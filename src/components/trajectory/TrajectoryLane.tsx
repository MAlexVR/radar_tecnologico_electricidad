"use client";

/**
 * TrajectoryLane — one swimlane (row) in the trajectory grid.
 *
 * Desktop: a CSS Grid row with cells per horizon bucket.
 * Mobile: a native <details>/<summary> accordion (no Radix Accordion dep).
 *
 * Receives items already filtered to this layer. Renders one column cell
 * per bucket in config.horizonBuckets, showing nodes for each cell.
 *
 * No domain symbols imported.
 */

import { cn } from "@/lib/utils";
import type { TrajectoryItem } from "@/lib/trajectory";
import { useTrajectoryConfig } from "./TrajectoryProvider";
import { TrajectoryNode } from "./TrajectoryNode";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TrajectoryLaneProps {
  /** The layer key this lane represents. */
  layerKey: string;
  /** Items that belong to this layer (pre-filtered by the parent). */
  items: TrajectoryItem[];
  /** Forwarded from TrajectoryMap to each node. */
  onSelect?: (item: TrajectoryItem) => void;
  /** ID of the currently selected item — used to highlight the active node. */
  selectedId?: string | null;
  /** On mobile, render the accordion open by default (used for the first lane). */
  defaultOpen?: boolean;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * One horizontal swimlane row.
 *
 * On desktop (`md+`): renders as a grid sub-row where each column aligns
 * with a horizon bucket column (grid-cols set by parent on wrapper element).
 *
 * On mobile (`< md`): wraps in a native `<details>` accordion to keep the
 * timeline scannable without horizontal overflow.
 */
export function TrajectoryLane({ layerKey, items, onSelect, selectedId, defaultOpen = false, className }: TrajectoryLaneProps) {
  const config = useTrajectoryConfig();

  const layer = config.layers.find((l) => l.key === layerKey);
  const layerLabel = layer?.label ?? layerKey;

  const sortedBuckets = [...config.horizonBuckets].sort(
    (a, b) => a.order - b.order
  );

  // Group items by horizon bucket for efficient lookup
  const byBucket = new Map<string, TrajectoryItem[]>();
  for (const item of items) {
    const existing = byBucket.get(item.horizon);
    if (existing) {
      existing.push(item);
    } else {
      byBucket.set(item.horizon, [item]);
    }
  }

  const layerColor = (layer as { color?: string } & typeof layer)?.color;

  // The grid cells (one per horizon bucket) — tinted with horizon bucket color (8% alpha)
  // layerColor is expressed via the rowheader left-border; cells use the column (horizon) tint
  // so that the two visual systems (layer = rows, horizon = columns) don't fight each other.
  const cells = sortedBuckets.map((bucket, i) => {
    const cellItems = byBucket.get(bucket.key) ?? [];
    const bucketColor = (bucket as { color?: string }).color;
    return (
      <div
        key={bucket.key}
        role="gridcell"
        aria-label={`${layerLabel} — ${bucket.label}`}
        className={cn(
          "min-h-[3rem] space-y-1 p-1 border-b",
          i < sortedBuckets.length - 1 && "border-r border-r-border/30"
        )}
        style={bucketColor ? { backgroundColor: `${bucketColor}14` } : undefined}
      >
        {cellItems.map((item) => (
          <TrajectoryNode
            key={item.id}
            item={item}
            onSelect={onSelect}
            selected={selectedId === item.id}
          />
        ))}
      </div>
    );
  });

  // ── Mobile: <details> accordion, grouped BY HORIZON so the time axis is
  // preserved on small screens (the desktop grid columns can't fit in portrait).
  const mobileView = (
    <details
      className="sm:hidden rounded-lg border border-border/60 bg-card overflow-hidden"
      open={defaultOpen}
    >
      <summary
        className="flex cursor-pointer select-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold hover:bg-accent"
        style={
          layerColor
            ? { borderLeft: `4px solid ${layerColor}`, color: layerColor }
            : undefined
        }
      >
        <span className="leading-tight">{layerLabel}</span>
        <span className="text-xs opacity-60">({items.length})</span>
      </summary>
      <div className="space-y-3 px-3 pb-3 pt-1">
        {items.length === 0 && (
          <p className="py-1 text-xs text-muted-foreground">Sin ítems en esta capa.</p>
        )}
        {sortedBuckets.map((bucket) => {
          const cellItems = byBucket.get(bucket.key) ?? [];
          if (cellItems.length === 0) return null;
          const bucketColor = (bucket as { color?: string }).color;
          return (
            <div key={bucket.key}>
              {/* Horizon sub-header with its color chip — restores the time context */}
              <div
                className="mb-1.5 flex items-center gap-1.5 border-b pb-1"
                style={bucketColor ? { borderBottomColor: `${bucketColor}55` } : undefined}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={bucketColor ? { backgroundColor: bucketColor } : undefined}
                />
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  {bucket.label}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {cellItems.map((item) => (
                  <TrajectoryNode
                    key={item.id}
                    item={item}
                    onSelect={onSelect}
                    selected={selectedId === item.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );

  // ── Desktop: grid row with layer color label cell ─────────────────────────
  const desktopView = (
    <div
      role="row"
      aria-label={`Capa: ${layerLabel}`}
      className={cn("hidden sm:contents", className)}
    >
      {/* Lane label cell (first column) — tinted bg + left border in layer color */}
      <div
        role="rowheader"
        className="flex items-center px-2 py-2 text-xs font-semibold border-b border-r"
        style={
          layerColor
            ? {
                backgroundColor: `${layerColor}12`,
                borderLeft: `4px solid ${layerColor}`,
                color: layerColor,
              }
            : undefined
        }
      >
        {layerLabel}
      </div>
      {/* Horizon cells (tinted in cells[] above) */}
      {cells}
    </div>
  );

  return (
    <>
      {desktopView}
      {mobileView}
    </>
  );
}
