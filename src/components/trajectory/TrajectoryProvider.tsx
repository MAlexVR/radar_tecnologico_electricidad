"use client";

/**
 * TrajectoryProvider — React Context for injecting TrajectoryConfig.
 *
 * The motor UI is data-agnostic: every component reads config from context
 * instead of importing domain data directly. The adapter (slice 3) instantiates
 * the config object and wraps the tree with <TrajectoryProvider>.
 *
 * No domain symbols imported here — only trajectory engine types.
 */

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { TrajectoryConfig } from "@/lib/trajectory";

// ── Context ───────────────────────────────────────────────────────────────────

const TrajectoryConfigContext = createContext<TrajectoryConfig | null>(null);
TrajectoryConfigContext.displayName = "TrajectoryConfigContext";

// ── Provider ──────────────────────────────────────────────────────────────────

export interface TrajectoryProviderProps {
  /** The trajectory configuration object (from the domain adapter). */
  config: TrajectoryConfig;
  children: ReactNode;
}

/**
 * Wraps the trajectory UI tree and makes `config` available via context.
 * Place it as high as needed in the tree — typically wrapping `<TrajectoryMap>`.
 */
export function TrajectoryProvider({ config, children }: TrajectoryProviderProps) {
  return (
    <TrajectoryConfigContext.Provider value={config}>
      {children}
    </TrajectoryConfigContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Returns the `TrajectoryConfig` from context.
 *
 * @throws {Error} If called outside a `<TrajectoryProvider>` tree.
 */
export function useTrajectoryConfig(): TrajectoryConfig {
  const ctx = useContext(TrajectoryConfigContext);
  if (!ctx) {
    throw new Error(
      "useTrajectoryConfig must be used within a <TrajectoryProvider>."
    );
  }
  return ctx;
}
