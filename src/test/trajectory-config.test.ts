import { describe, it, expect } from "vitest";
import { validateTrajectoryConfig, defaultColorFor, defaultLabelFor } from "@/lib/trajectory";
import type { TrajectoryConfig, TrajectoryItem } from "@/lib/trajectory";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeMinimalConfig(
  overrides?: Partial<TrajectoryConfig>
): TrajectoryConfig {
  return {
    drivers: [
      { key: "drvA", label: "Driver A" },
      { key: "drvB", label: "Driver B" },
    ],
    layers: [
      { key: "lyr1", label: "Layer 1", order: 1 },
      { key: "lyr2", label: "Layer 2", order: 2 },
    ],
    horizonBuckets: [
      { key: "ahora", label: "Ahora", order: 1 },
      { key: "corto", label: "Corto", order: 2 },
      { key: "medio1", label: "Medio", order: 3 },
    ],
    colorFor: () => "#cccccc",
    labelFor: (item) => item.title,
    ...overrides,
  };
}

function makeItem(overrides?: Partial<TrajectoryItem>): TrajectoryItem {
  return {
    id: "test-id",
    layer: "lyr1",
    driver: "drvA",
    horizon: "corto",
    title: "Test Item",
    detail: "Some detail",
    ...overrides,
  };
}

// ── validateTrajectoryConfig ──────────────────────────────────────────────────

describe("validateTrajectoryConfig", () => {
  it("does not throw for a valid config", () => {
    const config = makeMinimalConfig();
    expect(() => validateTrajectoryConfig(config)).not.toThrow();
  });

  it("throws when drivers is empty", () => {
    const config = makeMinimalConfig({ drivers: [] });
    expect(() => validateTrajectoryConfig(config)).toThrow();
  });

  it("throws when layers is empty", () => {
    const config = makeMinimalConfig({ layers: [] });
    expect(() => validateTrajectoryConfig(config)).toThrow();
  });

  it("throws when horizonBuckets is empty", () => {
    const config = makeMinimalConfig({ horizonBuckets: [] });
    expect(() => validateTrajectoryConfig(config)).toThrow();
  });

  it("throws when driver keys are duplicated", () => {
    const config = makeMinimalConfig({
      drivers: [
        { key: "drvA", label: "Driver A" },
        { key: "drvA", label: "Driver A duplicate" },
      ],
    });
    expect(() => validateTrajectoryConfig(config)).toThrow();
  });

  it("throws when layer keys are duplicated", () => {
    const config = makeMinimalConfig({
      layers: [
        { key: "lyr1", label: "Layer 1", order: 1 },
        { key: "lyr1", label: "Layer 1 duplicate", order: 2 },
      ],
    });
    expect(() => validateTrajectoryConfig(config)).toThrow();
  });

  it("throws when horizonBucket keys are duplicated", () => {
    const config = makeMinimalConfig({
      horizonBuckets: [
        { key: "ahora", label: "Ahora", order: 1 },
        { key: "ahora", label: "Ahora duplicate", order: 2 },
      ],
    });
    expect(() => validateTrajectoryConfig(config)).toThrow();
  });

  it("throws when colorFor is missing", () => {
    // TypeScript would catch this, but we also test at runtime
    const config = makeMinimalConfig({ colorFor: undefined as unknown as TrajectoryConfig["colorFor"] });
    expect(() => validateTrajectoryConfig(config)).toThrow();
  });

  it("throws when labelFor is missing", () => {
    const config = makeMinimalConfig({ labelFor: undefined as unknown as TrajectoryConfig["labelFor"] });
    expect(() => validateTrajectoryConfig(config)).toThrow();
  });

  it("passes with a single driver, single layer, single bucket", () => {
    const config = makeMinimalConfig({
      drivers: [{ key: "d1", label: "D1" }],
      layers: [{ key: "l1", label: "L1", order: 1 }],
      horizonBuckets: [{ key: "ahora", label: "Ahora", order: 1 }],
    });
    expect(() => validateTrajectoryConfig(config)).not.toThrow();
  });
});

// ── defaultColorFor ───────────────────────────────────────────────────────────

describe("defaultColorFor", () => {
  it("returns a non-empty string", () => {
    const item = makeItem();
    const color = defaultColorFor(item);
    expect(typeof color).toBe("string");
    expect(color.length).toBeGreaterThan(0);
  });

  it("is pure — same item produces same color", () => {
    const item = makeItem();
    expect(defaultColorFor(item)).toBe(defaultColorFor(item));
  });

  it("does not throw for any item shape", () => {
    expect(() => defaultColorFor(makeItem())).not.toThrow();
    expect(() => defaultColorFor(makeItem({ gap: "critica" }))).not.toThrow();
    expect(() => defaultColorFor(makeItem({ gap: undefined }))).not.toThrow();
    expect(() => defaultColorFor(makeItem({ meta: { kind: "tecnologia" } }))).not.toThrow();
  });
});

// ── defaultLabelFor ───────────────────────────────────────────────────────────

describe("defaultLabelFor", () => {
  it("returns item.title by default", () => {
    const item = makeItem({ title: "My Label" });
    expect(defaultLabelFor(item)).toBe("My Label");
  });

  it("is pure — same item produces same label", () => {
    const item = makeItem({ title: "Stable" });
    expect(defaultLabelFor(item)).toBe(defaultLabelFor(item));
  });

  it("handles items with different titles", () => {
    expect(defaultLabelFor(makeItem({ title: "Alpha" }))).toBe("Alpha");
    expect(defaultLabelFor(makeItem({ title: "Beta" }))).toBe("Beta");
  });
});
