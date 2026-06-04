"use client";

/**
 * TrajectoryNode — a single cell/button in the trajectory grid.
 *
 * Presentational and data-agnostic. Reads styling/label logic from
 * TrajectoryConfig via context. The aria-label is fully descriptive so
 * screen readers don't need to infer meaning from position alone.
 *
 * No domain symbols imported here.
 */

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TrajectoryItem } from "@/lib/trajectory";
import { useTrajectoryConfig } from "./TrajectoryProvider";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TrajectoryNodeProps {
  /** The item this node represents. */
  item: TrajectoryItem;
  /** Called when the user clicks the node. */
  onSelect?: (item: TrajectoryItem) => void;
  /** Whether this node is currently selected (renders a ring in layer color). */
  selected?: boolean;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Renders a trajectory item as an accessible `<button>`.
 *
 * - Color and label are derived from `config.colorFor` / `config.labelFor`.
 * - Optional metric badge from `config.metricBadge`.
 * - aria-label format: "[LayerLabel] | [HorizonLabel] | [Title] | [gap?]"
 */
// Gap severity colors — used for the indicator dot.
// Both capitalized (production data) and lowercase forms are accepted for
// backward-compatibility with synthetic test fixtures.
const GAP_DOT_COLORS: Record<string, string> = {
  "Crítica":  "#C62828",
  "Alta":     "#F9A825",
  critica:    "#C62828",   // legacy / synthetic fixtures
  alta:       "#F9A825",   // legacy / synthetic fixtures
};

export function TrajectoryNode({ item, onSelect, selected = false, className }: TrajectoryNodeProps) {
  const config = useTrajectoryConfig();

  // Resolve human-readable layer and horizon labels from config
  const layerLabel =
    config.layers.find((l) => l.key === item.layer)?.label ?? item.layer;
  const horizonLabel =
    config.horizonBuckets.find((h) => h.key === item.horizon)?.label ??
    item.horizon;

  // Layer color for left border accent
  const layerColor = (config.layers.find((l) => l.key === item.layer) as { color?: string } & typeof config.layers[number])?.color;

  const colorClass = config.colorFor(item);
  const label = config.labelFor(item);
  const badge = config.metricBadge ? config.metricBadge(item) : null;

  // Gap indicator dot (critica = red, alta = amber)
  const gapDotColor = item.gap ? GAP_DOT_COLORS[item.gap] : undefined;

  // Build a fully descriptive aria-label
  const ariaLabel = [
    layerLabel,
    horizonLabel,
    label,
    item.gap ? item.gap : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full flex-col items-start gap-1 rounded-md border p-2 text-left text-xs",
        "bg-card transition-all duration-150",
        "hover:shadow-md hover:scale-[1.01]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        colorClass,
        className
      )}
      style={
        layerColor
          ? selected
            ? { borderLeft: `3px solid ${layerColor}`, boxShadow: `0 0 0 2px ${layerColor}40` }
            : { borderLeft: `3px solid ${layerColor}` }
          : undefined
      }
      onClick={() => onSelect?.(item)}
    >
      {/* Gap severity dot — top-right corner */}
      {gapDotColor && (
        <span
          aria-hidden
          title={
            item.gap === "Crítica" || item.gap === "critica"
              ? "Brecha Crítica"
              : "Brecha Alta"
          }
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: gapDotColor }}
        />
      )}

      {/* Node title */}
      <span className="line-clamp-2 font-medium leading-snug pr-3">{label}</span>

      {/* Metric badge */}
      {badge && (
        <Badge
          variant="secondary"
          className="pointer-events-none mt-auto text-[0.65rem] leading-none"
        >
          {badge}
        </Badge>
      )}
    </button>
  );
}
