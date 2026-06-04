/**
 * Layout helpers for the trajectory engine.
 * All functions are pure: same input → same output, no side effects.
 * No domain symbols imported — only internal trajectory types.
 */

import type { TrajectoryItem, HorizonBucket } from "./types";

// ── Horizon normalization map ─────────────────────────────────────────────────

/**
 * Maps raw horizon strings (as they appear in domain data) to `HorizonBucket`.
 * Keys are lowercased for case-insensitive matching.
 */
const HORIZON_MAP: ReadonlyMap<string, HorizonBucket> = new Map([
  // "Ahora" equivalents
  ["ya desplegado", "ahora"],
  ["continuo", "ahora"],
  // "Corto" equivalents
  ["corto (1-2 años)", "corto"],
  ["corto (1-2 años)", "corto"],
  // "Medio1" equivalents (2-x years, up to 3-5)
  ["medio (2-3 años)", "medio1"],
  ["medio (2-4 años)", "medio1"],
  ["medio (2-5 años)", "medio1"],
  ["medio (2-3 años)", "medio1"],
  ["medio (2-4 años)", "medio1"],
  ["medio (2-5 años)", "medio1"],
  // "Medio2" equivalents (3-5 year range)
  ["medio (3-5 años)", "medio2"],
  ["medio (3-5 años)", "medio2"],
  // "Largo" equivalents
  ["largo (5-8 años)", "largo"],
  ["largo (5-10 años)", "largo"],
  ["largo (2030+)", "largo"],
  ["largo (5-8 años)", "largo"],
  ["largo (5-10 años)", "largo"],
]);

/**
 * Normalizes a raw horizon string to a `HorizonBucket`.
 *
 * - Matching is case-insensitive and trims whitespace.
 * - Unknown strings fall back to `"medio1"` (never returns `undefined`).
 *
 * @param raw - The raw horizon string from the data source.
 * @returns A valid `HorizonBucket` value.
 */
export function normalizeHorizon(raw: string): HorizonBucket {
  const key = raw.trim().toLowerCase();
  return HORIZON_MAP.get(key) ?? "medio1";
}

// ── Dataset grouping helpers ──────────────────────────────────────────────────

/**
 * Returns all items belonging to a given driver key.
 * Pure — does not mutate the input array.
 *
 * @param items - The full set of trajectory items.
 * @param driverKey - The driver/direccionador key to filter by.
 * @returns A new array containing only items where `item.driver === driverKey`.
 */
export function byDriver(
  items: TrajectoryItem[],
  driverKey: string
): TrajectoryItem[] {
  return items.filter((item) => item.driver === driverKey);
}

/**
 * Groups items by their `layer` key into a `Map`.
 * Pure — does not mutate the input array.
 *
 * @param items - The set of items to group.
 * @returns A `Map` where each key is a layer key and each value is the array
 *          of items belonging to that layer. Only layers that have at least
 *          one item appear in the Map.
 */
export function byLayer(items: TrajectoryItem[]): Map<string, TrajectoryItem[]> {
  const result = new Map<string, TrajectoryItem[]>();
  for (const item of items) {
    const bucket = result.get(item.layer);
    if (bucket) {
      bucket.push(item);
    } else {
      result.set(item.layer, [item]);
    }
  }
  return result;
}

/**
 * Groups items by their `horizon` bucket into a `Map`.
 * Pure — does not mutate the input array.
 *
 * @param items - The set of items to group.
 * @returns A `Map` where each key is a `HorizonBucket` and each value is the
 *          array of items with that horizon. Only horizons that have at least
 *          one item appear in the Map (no empty entries).
 */
export function byHorizon(
  items: TrajectoryItem[]
): Map<HorizonBucket, TrajectoryItem[]> {
  const result = new Map<HorizonBucket, TrajectoryItem[]>();
  for (const item of items) {
    const bucket = result.get(item.horizon);
    if (bucket) {
      bucket.push(item);
    } else {
      result.set(item.horizon, [item]);
    }
  }
  return result;
}
