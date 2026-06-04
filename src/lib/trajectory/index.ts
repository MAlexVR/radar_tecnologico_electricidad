/**
 * Public API of the trajectory engine.
 * Import from here — never from internal module files directly.
 */

export type {
  HorizonBucket,
  TrajectoryItem,
  TrajectoryLayer,
  TrajectoryHorizonBucket,
  TrajectoryConfig,
  TrajectoryDataset,
} from "./types";

export {
  normalizeHorizon,
  byDriver,
  byLayer,
  byHorizon,
} from "./layout";

export {
  validateTrajectoryConfig,
  defaultColorFor,
  defaultLabelFor,
} from "./config";
