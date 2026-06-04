"use client";

/**
 * TrajectoryMap — main composition component.
 *
 * Orchestrates:
 *   - Driver selector with Radix Tabs
 *   - CSS Grid of swimlane × horizon-bucket
 *   - Column headers (horizon buckets)
 *   - TrajectoryLane per layer
 *   - TrajectoryLegend sidebar
 *   - Empty state when driver has no items
 *
 * Props: { config, dataset, onSelect? }
 * Internally wraps itself with <TrajectoryProvider> so child components
 * can access config via context without prop-drilling.
 *
 * No domain symbols imported.
 */

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { TrajectoryConfig, TrajectoryDataset, TrajectoryItem } from "@/lib/trajectory";
import { byDriver, byLayer } from "@/lib/trajectory";
import { TrajectoryProvider } from "./TrajectoryProvider";
import { TrajectoryLane } from "./TrajectoryLane";
import { TrajectoryLegend } from "./TrajectoryLegend";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TrajectoryMapProps {
  /** Trajectory configuration (drivers, layers, horizons, color/label fns). */
  config: TrajectoryConfig;
  /** The dataset to visualize. */
  dataset: TrajectoryDataset;
  /** Called when the user clicks a node. */
  onSelect?: (item: TrajectoryItem) => void;
  /** ID of the currently selected item — forwarded to lanes for node highlighting. */
  selectedId?: string | null;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Root component of the trajectory map UI.
 *
 * Renders a driver tab per config.drivers entry.
 * Within each tab, renders one TrajectoryLane per layer (ordered by layer.order).
 * The grid is a CSS Grid with `1 + horizonBuckets.length` columns:
 *   col 0 = lane label, col 1..N = horizon buckets.
 */
export function TrajectoryMap({
  config,
  dataset,
  onSelect,
  selectedId,
  className,
}: TrajectoryMapProps) {
  const sortedDrivers = config.drivers; // order preserved from config
  const [activeDriver, setActiveDriver] = useState(sortedDrivers[0]?.key ?? "");

  const sortedLayers = [...config.layers].sort((a, b) => a.order - b.order);
  const sortedBuckets = [...config.horizonBuckets].sort(
    (a, b) => a.order - b.order
  );

  // Number of columns: 1 label column + N horizon bucket columns
  const gridCols = 1 + sortedBuckets.length;

  return (
    <TrajectoryProvider config={config}>
      <div className={cn("flex flex-col gap-4", className)}>
        {/* Driver selector */}
        <Tabs
          value={activeDriver}
          onValueChange={setActiveDriver}
          className="w-full"
        >
          {/* Desktop: uniform grid (1 col per driver). Mobile: wrapping flex. */}
          <TabsList
            className="h-auto gap-2 flex flex-wrap items-stretch p-1 sm:grid"
            style={
              sortedDrivers.length > 0
                ? { gridTemplateColumns: `repeat(${sortedDrivers.length}, 1fr)` }
                : undefined
            }
          >
            {sortedDrivers.map((driver) => {
              const isActive = activeDriver === driver.key;
              const color = (driver as { color?: string }).color;
              return (
                <TabsTrigger
                  key={driver.key}
                  value={driver.key}
                  className="h-full flex-1 basis-[7rem] sm:basis-auto flex flex-col items-center justify-center gap-0.5 transition-all py-2 px-2 min-h-[3.25rem]"
                  style={
                    color
                      ? isActive
                        ? {
                            backgroundColor: `${color}15`,
                            borderBottom: `2px solid ${color}`,
                            color,
                            fontWeight: 600,
                          }
                        : {
                            color: "inherit",
                          }
                      : undefined
                  }
                  onMouseEnter={(e) => {
                    if (color && !isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = `${color}0d`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (color && !isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "";
                    }
                  }}
                >
                  {/* Line 1: driver code in bold */}
                  <span className="font-bold text-xs leading-tight">{driver.key}</span>
                  {/* Line 2: driver label, up to 2 lines, no overflow */}
                  <span className="line-clamp-2 text-[11px] leading-tight text-center whitespace-normal max-w-full">
                    {driver.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {sortedDrivers.map((driver) => {
            const driverItems = byDriver(dataset.items, driver.key);
            const layerMap = byLayer(driverItems);
            const isEmpty = driverItems.length === 0;

            return (
              <TabsContent key={driver.key} value={driver.key}>
                <div className="flex gap-4">
                  {/* Main grid — sole horizontal scroller (touch swipe to reveal all horizon columns) */}
                  <div
                    className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {isEmpty ? (
                      // Empty state
                      <div
                        data-testid="trajectory-empty-state"
                        className="flex min-h-[12rem] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
                      >
                        No hay ítems para este driver.
                      </div>
                    ) : (
                      <>
                        {/* Desktop grid */}
                        <div
                          role="grid"
                          aria-label={`Mapa de trayectoria — ${driver.label}`}
                          className="hidden sm:grid rounded-xl border border-border shadow-sm overflow-hidden bg-card"
                          style={{
                            gridTemplateColumns: `minmax(6rem, 10rem) repeat(${sortedBuckets.length}, minmax(8rem, 1fr))`,
                          }}
                        >
                          {/* Column headers row */}
                          <div
                            role="row"
                            className="contents"
                          >
                            {/* Corner cell — axis labels */}
                            <div
                              role="columnheader"
                              aria-label="Eje filas: Capas; Eje columnas: Horizonte"
                              className="bg-sena-green/10 border-b border-r px-2 py-2 text-[10px] font-semibold text-sena-green flex flex-col justify-between"
                            >
                              <span className="self-end leading-tight">Horizonte →</span>
                              <span className="self-start leading-tight">Capas ↓</span>
                            </div>
                            {sortedBuckets.map((bucket, i) => {
                              const hColor = (bucket as { color?: string }).color;
                              return (
                                <div
                                  key={bucket.key}
                                  role="columnheader"
                                  className={cn(
                                    "border-b px-2 py-2 text-center text-xs font-semibold tracking-wide rounded-t-sm",
                                    i < sortedBuckets.length - 1 && "border-r border-r-white/20",
                                    !hColor && "bg-muted/40 text-muted-foreground"
                                  )}
                                  style={
                                    hColor
                                      ? {
                                          backgroundColor: hColor,
                                          borderBottomColor: `${hColor}`,
                                          borderBottomWidth: "2px",
                                          color: "#ffffff",
                                          textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                                        }
                                      : undefined
                                  }
                                >
                                  {bucket.label}
                                </div>
                              );
                            })}
                          </div>

                          {/* One lane per layer */}
                          {sortedLayers.map((layer) => {
                            const laneItems = layerMap.get(layer.key) ?? [];
                            return (
                              <TrajectoryLane
                                key={layer.key}
                                layerKey={layer.key}
                                items={laneItems}
                                onSelect={onSelect}
                                selectedId={selectedId}
                              />
                            );
                          })}
                        </div>

                        {/* Phone view (portrait + landscape, < lg) — vertical accordion grouped by
                            horizon; no horizontal scroll needed. The grid is reserved for lg+ screens. */}
                        <div className="flex flex-col gap-2 sm:hidden">
                          {sortedLayers.map((layer, i) => {
                            const laneItems = layerMap.get(layer.key) ?? [];
                            return (
                              <TrajectoryLane
                                key={layer.key}
                                layerKey={layer.key}
                                items={laneItems}
                                onSelect={onSelect}
                                selectedId={selectedId}
                                defaultOpen={i === 0}
                              />
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Legend sidebar (lg+ only — phones rely on inline layer/horizon labels) */}
                  <Separator orientation="vertical" className="hidden lg:block" />
                  <TrajectoryLegend
                    config={config}
                    className="hidden lg:block w-40 shrink-0"
                  />
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </TrajectoryProvider>
  );
}
