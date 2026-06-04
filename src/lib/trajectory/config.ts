/**
 * Configuration helpers for the trajectory engine.
 * Provides runtime validation and sensible defaults.
 * No domain symbols imported — only internal trajectory types.
 */

import type { TrajectoryConfig, TrajectoryItem } from "./types";

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Validates a `TrajectoryConfig` at runtime.
 * Throws a descriptive `Error` if any invariant is violated:
 * - `drivers`, `layers`, and `horizonBuckets` must each have at least one entry.
 * - Keys within each collection must be unique.
 * - `colorFor` and `labelFor` must be functions.
 *
 * @param config - The config object to validate.
 * @throws {Error} If any invariant is violated.
 */
export function validateTrajectoryConfig(config: TrajectoryConfig): void {
  // Required function properties
  if (typeof config.colorFor !== "function") {
    throw new Error("TrajectoryConfig: `colorFor` must be a function.");
  }
  if (typeof config.labelFor !== "function") {
    throw new Error("TrajectoryConfig: `labelFor` must be a function.");
  }

  // Non-empty collections
  if (!config.drivers || config.drivers.length === 0) {
    throw new Error("TrajectoryConfig: `drivers` must have at least one entry.");
  }
  if (!config.layers || config.layers.length === 0) {
    throw new Error("TrajectoryConfig: `layers` must have at least one entry.");
  }
  if (!config.horizonBuckets || config.horizonBuckets.length === 0) {
    throw new Error(
      "TrajectoryConfig: `horizonBuckets` must have at least one entry."
    );
  }

  // Unique keys within each collection
  const driverKeys = config.drivers.map((d) => d.key);
  if (hasDuplicates(driverKeys)) {
    throw new Error(
      `TrajectoryConfig: Duplicate driver keys found: ${findDuplicates(driverKeys).join(", ")}.`
    );
  }

  const layerKeys = config.layers.map((l) => l.key);
  if (hasDuplicates(layerKeys)) {
    throw new Error(
      `TrajectoryConfig: Duplicate layer keys found: ${findDuplicates(layerKeys).join(", ")}.`
    );
  }

  const bucketKeys = config.horizonBuckets.map((b) => b.key);
  if (hasDuplicates(bucketKeys)) {
    throw new Error(
      `TrajectoryConfig: Duplicate horizonBucket keys found: ${findDuplicates(bucketKeys).join(", ")}.`
    );
  }
}

// ── Default helpers ───────────────────────────────────────────────────────────

/**
 * Default `colorFor` implementation — returns a neutral gray class.
 * Use as fallback when the adapter does not need per-item color logic.
 *
 * @param _item - The trajectory item (unused in the default).
 * @returns A CSS class string representing a neutral background.
 */
export function defaultColorFor(_item: TrajectoryItem): string {
  return "bg-gray-100 text-gray-800";
}

/**
 * Default `labelFor` implementation — returns `item.title`.
 * Use as fallback when no special label formatting is needed.
 *
 * @param item - The trajectory item.
 * @returns The item's title string.
 */
export function defaultLabelFor(item: TrajectoryItem): string {
  return item.title;
}

// ── Internal utilities ────────────────────────────────────────────────────────

function hasDuplicates(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) duplicates.add(v);
    seen.add(v);
  }
  return [...duplicates];
}
