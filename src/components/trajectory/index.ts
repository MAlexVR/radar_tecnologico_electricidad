/**
 * Public API of the trajectory UI components.
 * Import from here — not from individual component files.
 *
 * No domain symbols exported — these components are data-agnostic.
 */

export { TrajectoryProvider, useTrajectoryConfig } from "./TrajectoryProvider";
export type { TrajectoryProviderProps } from "./TrajectoryProvider";

export { TrajectoryNode } from "./TrajectoryNode";
export type { TrajectoryNodeProps } from "./TrajectoryNode";

export { TrajectoryLane } from "./TrajectoryLane";
export type { TrajectoryLaneProps } from "./TrajectoryLane";

export { TrajectoryDetail } from "./TrajectoryDetail";
export type { TrajectoryDetailProps } from "./TrajectoryDetail";

export { TrajectoryLegend } from "./TrajectoryLegend";
export type { TrajectoryLegendProps } from "./TrajectoryLegend";

export { TrajectoryMap } from "./TrajectoryMap";
export type { TrajectoryMapProps } from "./TrajectoryMap";
