/**
 * Tests for the electricidad domain adapter.
 *
 * Verifies:
 * - electricidadConfig passes validateTrajectoryConfig without throwing
 * - buildElectricidadTrajectory returns a non-empty TrajectoryDataset
 * - L1 covers all 5 drivers (D1..D5)
 * - All items have a valid horizon (in config buckets) and a valid driver (in config drivers)
 * - Each driver that has GOR data (D1..D5) has items in L2, L3, L4
 * - trajectory-arch.test.ts remains valid: this adapter is NOT inside src/lib/trajectory
 *   nor src/components/trajectory, so it does not break the isolation constraint.
 */

import { describe, it, expect } from "vitest";
import {
  electricidadConfig,
  buildElectricidadTrajectory,
} from "@/lib/trajectory-data.electricidad";
import { validateTrajectoryConfig } from "@/lib/trajectory";
import type { HorizonBucket } from "@/lib/trajectory";

// ── validateTrajectoryConfig ──────────────────────────────────────────────────

describe("electricidadConfig", () => {
  it("passes validateTrajectoryConfig without throwing", () => {
    expect(() => validateTrajectoryConfig(electricidadConfig)).not.toThrow();
  });

  it("has exactly 5 drivers (D1..D5)", () => {
    const keys = electricidadConfig.drivers.map((d) => d.key);
    expect(keys).toEqual(["D1", "D2", "D3", "D4", "D5"]);
  });

  it("has exactly 4 layers (L1..L4)", () => {
    const keys = electricidadConfig.layers.map((l) => l.key);
    expect(keys).toEqual(["L1", "L2", "L3", "L4"]);
  });

  it("has exactly 5 horizon buckets with correct keys", () => {
    const keys = electricidadConfig.horizonBuckets.map((b) => b.key);
    expect(keys).toEqual(["ahora", "corto", "medio1", "medio2", "largo"]);
  });

  it("colorFor returns a non-empty string for various item shapes", () => {
    const baseItem = {
      id: "test",
      layer: "L1",
      driver: "D1",
      horizon: "corto" as HorizonBucket,
      title: "Test",
      detail: "Detail",
    };
    expect(typeof electricidadConfig.colorFor(baseItem)).toBe("string");
    expect(electricidadConfig.colorFor(baseItem).length).toBeGreaterThan(0);

    // With gap
    expect(typeof electricidadConfig.colorFor({ ...baseItem, gap: "Crítica" })).toBe("string");
    expect(typeof electricidadConfig.colorFor({ ...baseItem, gap: "Alta" })).toBe("string");
    expect(typeof electricidadConfig.colorFor({ ...baseItem, gap: "Moderada" })).toBe("string");
    // L2 without gap
    expect(typeof electricidadConfig.colorFor({ ...baseItem, layer: "L2" })).toBe("string");
  });

  it("labelFor returns item.title", () => {
    const item = {
      id: "x",
      layer: "L1",
      driver: "D1",
      horizon: "corto" as HorizonBucket,
      title: "Mi Tecnología",
      detail: "Detalle",
    };
    expect(electricidadConfig.labelFor(item)).toBe("Mi Tecnología");
  });

  it("metricBadge returns TRL string for L1 items with metric", () => {
    const item = {
      id: "x",
      layer: "L1",
      driver: "D1",
      horizon: "corto" as HorizonBucket,
      title: "Tech",
      detail: "Desc",
      metric: { label: "TRL", value: 8 },
    };
    expect(electricidadConfig.metricBadge?.(item)).toBe("TRL 8");
  });

  it("metricBadge returns null for L2/L3/L4 items", () => {
    const item = {
      id: "x",
      layer: "L2",
      driver: "D1",
      horizon: "corto" as HorizonBucket,
      title: "Infra",
      detail: "Desc",
      metric: { label: "TRL", value: 8 },
    };
    expect(electricidadConfig.metricBadge?.(item)).toBeNull();
  });
});

// ── buildElectricidadTrajectory ───────────────────────────────────────────────

describe("buildElectricidadTrajectory", () => {
  it("returns a TrajectoryDataset with at least one item", () => {
    const dataset = buildElectricidadTrajectory();
    expect(dataset).toBeDefined();
    expect(Array.isArray(dataset.items)).toBe(true);
    expect(dataset.items.length).toBeGreaterThan(0);
  });

  it("L1 covers all 5 drivers (D1..D5)", () => {
    const dataset = buildElectricidadTrajectory();
    const l1Items = dataset.items.filter((item) => item.layer === "L1");
    const drivers = new Set(l1Items.map((item) => item.driver));
    expect(drivers.has("D1")).toBe(true);
    expect(drivers.has("D2")).toBe(true);
    expect(drivers.has("D3")).toBe(true);
    expect(drivers.has("D4")).toBe(true);
    expect(drivers.has("D5")).toBe(true);
  });

  it("L1 has exactly 18 items (one per TECHNOLOGY in radar-data)", () => {
    const dataset = buildElectricidadTrajectory();
    const l1Items = dataset.items.filter((item) => item.layer === "L1");
    expect(l1Items.length).toBe(18);
  });

  it("all items have a valid horizon (in config buckets)", () => {
    const dataset = buildElectricidadTrajectory();
    const validBuckets = new Set(electricidadConfig.horizonBuckets.map((b) => b.key));
    for (const item of dataset.items) {
      expect(validBuckets.has(item.horizon), `Item ${item.id} has invalid horizon: ${item.horizon}`).toBe(true);
    }
  });

  it("all items have a valid driver (in config drivers)", () => {
    const dataset = buildElectricidadTrajectory();
    const validDrivers = new Set(electricidadConfig.drivers.map((d) => d.key));
    for (const item of dataset.items) {
      expect(validDrivers.has(item.driver), `Item ${item.id} has invalid driver: ${item.driver}`).toBe(true);
    }
  });

  it("all item IDs are unique", () => {
    const dataset = buildElectricidadTrajectory();
    const ids = dataset.items.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("each driver D1..D5 has items in L2, L3, and L4 (GOR data coverage)", () => {
    const dataset = buildElectricidadTrajectory();
    const drivers = ["D1", "D2", "D3", "D4", "D5"];
    const layers = ["L2", "L3", "L4"];

    for (const driver of drivers) {
      for (const layer of layers) {
        const count = dataset.items.filter(
          (item) => item.driver === driver && item.layer === layer
        ).length;
        expect(
          count,
          `Driver ${driver} Layer ${layer} should have at least 1 item but has ${count}`
        ).toBeGreaterThan(0);
      }
    }
  });

  it("all L1 items have a TRL metric", () => {
    const dataset = buildElectricidadTrajectory();
    const l1Items = dataset.items.filter((item) => item.layer === "L1");
    for (const item of l1Items) {
      expect(item.metric, `L1 item ${item.id} should have metric`).toBeDefined();
      expect(item.metric?.label).toBe("TRL");
      expect(typeof item.metric?.value).toBe("number");
    }
  });

  it("all items have a non-empty title, detail, and source", () => {
    const dataset = buildElectricidadTrajectory();
    for (const item of dataset.items) {
      expect(item.title.trim().length, `Item ${item.id} has empty title`).toBeGreaterThan(0);
      expect(item.detail.trim().length, `Item ${item.id} has empty detail`).toBeGreaterThan(0);
      expect(item.source?.trim().length ?? 0, `Item ${item.id} has empty source`).toBeGreaterThan(0);
    }
  });

  it("gap values are only 'Crítica', 'Alta', 'Moderada', or undefined", () => {
    const dataset = buildElectricidadTrajectory();
    const validGaps = new Set(["Crítica", "Alta", "Moderada", undefined]);
    for (const item of dataset.items) {
      expect(validGaps.has(item.gap), `Item ${item.id} has invalid gap: ${item.gap}`).toBe(true);
    }
  });

  it("colorFor does not throw for any item in the dataset", () => {
    const dataset = buildElectricidadTrajectory();
    for (const item of dataset.items) {
      expect(() => electricidadConfig.colorFor(item)).not.toThrow();
    }
  });
});
