import { describe, it, expect } from "vitest";
import { normalizeHorizon, byDriver, byLayer, byHorizon } from "@/lib/trajectory";
import type { TrajectoryItem, HorizonBucket } from "@/lib/trajectory";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeItem(
  overrides: Partial<TrajectoryItem> & { id: string }
): TrajectoryItem {
  return {
    layer: "lyr1",
    driver: "drvA",
    horizon: "corto",
    title: "Item " + overrides.id,
    detail: "Detail for " + overrides.id,
    ...overrides,
  };
}

// ── normalizeHorizon ─────────────────────────────────────────────────────────

describe("normalizeHorizon", () => {
  // Tabla RD-1 completa — strings reales del dominio telecom
  const cases: Array<[string, HorizonBucket]> = [
    ["Ya desplegado", "ahora"],
    ["Continuo", "ahora"],
    ["Corto (1-2 años)", "corto"],
    ["Medio (2-3 años)", "medio1"],
    ["Medio (2-4 años)", "medio1"],
    ["Medio (2-5 años)", "medio1"],
    ["Medio (3-5 años)", "medio2"],
    ["Largo (5-8 años)", "largo"],
    ["Largo (5-10 años)", "largo"],
    ["Largo (2030+)", "largo"],
    // Variaciones de capitalización / espacios esperadas del GOR
    ["ya desplegado", "ahora"],
    ["continuo", "ahora"],
    ["corto (1-2 años)", "corto"],
    ["medio (2-4 años)", "medio1"],
    ["medio (3-5 años)", "medio2"],
    ["largo (5-10 años)", "largo"],
  ];

  it.each(cases)('normalizeHorizon("%s") → "%s"', (raw, expected) => {
    expect(normalizeHorizon(raw)).toBe(expected);
  });

  it('returns "medio1" for unknown/empty strings (default fallback)', () => {
    expect(normalizeHorizon("foo")).toBe("medio1");
    expect(normalizeHorizon("")).toBe("medio1");
    expect(normalizeHorizon("Otro (3 años)")).toBe("medio1");
    expect(normalizeHorizon("N/A")).toBe("medio1");
  });

  it("never returns undefined", () => {
    const result = normalizeHorizon("cualquier cosa");
    expect(result).toBeDefined();
    expect(["ahora", "corto", "medio1", "medio2", "largo"]).toContain(result);
  });
});

// ── Synthetic dataset ─────────────────────────────────────────────────────────
// IMPORTANT: uses fictitious driver/layer keys to prove the engine is data-agnostic.
// No domain symbols ("5G", "D1", "TRL") appear here.

const ITEMS: TrajectoryItem[] = [
  makeItem({ id: "i1", driver: "drvA", layer: "lyr1", horizon: "ahora" }),
  makeItem({ id: "i2", driver: "drvA", layer: "lyr2", horizon: "corto" }),
  makeItem({ id: "i3", driver: "drvA", layer: "lyr1", horizon: "medio1" }),
  makeItem({ id: "i4", driver: "drvB", layer: "lyr1", horizon: "largo" }),
  makeItem({ id: "i5", driver: "drvB", layer: "lyr3", horizon: "medio2" }),
  makeItem({ id: "i6", driver: "drvC", layer: "lyr2", horizon: "ahora" }),
];

// ── byDriver ─────────────────────────────────────────────────────────────────

describe("byDriver", () => {
  it("returns only items matching the given driver key", () => {
    const result = byDriver(ITEMS, "drvA");
    expect(result).toHaveLength(3);
    expect(result.every((i) => i.driver === "drvA")).toBe(true);
  });

  it("returns empty array when no items match", () => {
    const result = byDriver(ITEMS, "drvZ");
    expect(result).toEqual([]);
  });

  it("is pure — same input produces same output", () => {
    const r1 = byDriver(ITEMS, "drvB");
    const r2 = byDriver(ITEMS, "drvB");
    expect(r1).toEqual(r2);
  });

  it("does not mutate the original array", () => {
    const copy = [...ITEMS];
    byDriver(ITEMS, "drvA");
    expect(ITEMS).toEqual(copy);
  });

  it("handles empty items array", () => {
    expect(byDriver([], "drvA")).toEqual([]);
  });
});

// ── byLayer ──────────────────────────────────────────────────────────────────

describe("byLayer", () => {
  it("groups items by layer key without loss", () => {
    const map = byLayer(ITEMS);
    const total = [...map.values()].reduce((acc, arr) => acc + arr.length, 0);
    expect(total).toBe(ITEMS.length);
  });

  it("produces correct keys", () => {
    const map = byLayer(ITEMS);
    expect([...map.keys()].sort()).toEqual(["lyr1", "lyr2", "lyr3"]);
  });

  it("each bucket contains only items with matching layer", () => {
    const map = byLayer(ITEMS);
    for (const [layerKey, items] of map) {
      expect(items.every((i) => i.layer === layerKey)).toBe(true);
    }
  });

  it("returns empty Map for empty input", () => {
    const map = byLayer([]);
    expect(map.size).toBe(0);
  });

  it("is pure — same input produces same output", () => {
    const m1 = byLayer(ITEMS);
    const m2 = byLayer(ITEMS);
    expect([...m1.entries()]).toEqual([...m2.entries()]);
  });
});

// ── byHorizon ────────────────────────────────────────────────────────────────

describe("byHorizon", () => {
  it("groups items by horizon bucket without loss", () => {
    const map = byHorizon(ITEMS);
    const total = [...map.values()].reduce((acc, arr) => acc + arr.length, 0);
    expect(total).toBe(ITEMS.length);
  });

  it("produces entries for each horizon present in items", () => {
    const map = byHorizon(ITEMS);
    expect(map.has("ahora")).toBe(true);
    expect(map.has("corto")).toBe(true);
    expect(map.has("medio1")).toBe(true);
    expect(map.has("medio2")).toBe(true);
    expect(map.has("largo")).toBe(true);
  });

  it("does NOT produce entries for absent horizons", () => {
    // Our ITEMS have no "medio2" for drvC slice; but byHorizon covers all items.
    // Test with a narrower slice: only ahora items
    const ahoraOnly = ITEMS.filter((i) => i.horizon === "ahora");
    const map = byHorizon(ahoraOnly);
    expect(map.size).toBe(1);
    expect(map.has("ahora")).toBe(true);
    expect(map.has("corto")).toBe(false);
  });

  it("each bucket contains only items with matching horizon", () => {
    const map = byHorizon(ITEMS);
    for (const [bucket, items] of map) {
      expect(items.every((i) => i.horizon === bucket)).toBe(true);
    }
  });

  it("returns empty Map for empty input", () => {
    const map = byHorizon([]);
    expect(map.size).toBe(0);
  });

  it("is pure — same input produces same output", () => {
    const m1 = byHorizon(ITEMS);
    const m2 = byHorizon(ITEMS);
    expect([...m1.entries()]).toEqual([...m2.entries()]);
  });
});
