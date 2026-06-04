"use client";

/**
 * TrajectoryDetail — generic detail panel for any TrajectoryItem.
 *
 * Presentational and data-agnostic. Renders: title, detail text, optional
 * metric, optional source, and optional meta fields. Supports an optional
 * `config.detailRenderer` render-prop for domain-specific overrides.
 *
 * Does NOT import TechDetail or any domain symbol.
 */

import { X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { TrajectoryItem, TrajectoryConfig } from "@/lib/trajectory";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Capitalizes the first character of a string while preserving the rest.
 * Handles strings that are already correctly capitalized (e.g. "P1", "Nokia", siglas).
 * Strings with only 1 character or less are returned as-is.
 */
function capitalizeFirst(value: string): string {
  if (!value || value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TrajectoryDetailProps {
  /** The item to display. Pass `null` to render nothing (empty state). */
  item: TrajectoryItem | null;
  /** The trajectory config (for detailRenderer override and label resolution). */
  config: TrajectoryConfig;
  /**
   * Optional callback invoked when the user clicks the close button.
   * When provided, a close button (×) is rendered in the top-right corner.
   */
  onClose?: () => void;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Generic detail panel. Shows title, description, metric, source, and raw meta.
 * If `config.detailRenderer` is provided and returns a non-null value for the
 * item, that renderer takes over (the domain adapter can inject TechDetail here
 * for L1 nodes without coupling the motor to it).
 */
export function TrajectoryDetail({ item, config, onClose, className }: TrajectoryDetailProps) {
  if (!item) return null;

  // Domain adapter override
  if (config.detailRenderer) {
    const custom = config.detailRenderer(item);
    if (custom) return <>{custom}</>;
  }

  const layerLabel =
    config.layers.find((l) => l.key === item.layer)?.label ?? item.layer;
  const horizonLabel =
    config.horizonBuckets.find((h) => h.key === item.horizon)?.label ??
    item.horizon;

  // Layer color for the accent bar (generic — comes from config)
  const layerColor = (config.layers.find((l) => l.key === item.layer) as { color?: string } & typeof config.layers[number])?.color;

  return (
    <div className={className}>
      {/* Header — layer accent bar + title + close button */}
      <div
        className="relative rounded-t-md pb-2"
        style={layerColor ? { borderLeft: `4px solid ${layerColor}`, paddingLeft: "0.625rem" } : undefined}
      >
        {/* Close button */}
        {onClose && (
          <button
            type="button"
            aria-label="Cerrar detalle"
            onClick={onClose}
            className="absolute right-0 top-0 rounded-sm p-0.5 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring transition-opacity"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
        <div className="space-y-1" style={onClose ? { paddingRight: "1.5rem" } : undefined}>
          <h3 className="text-base font-semibold leading-snug">{item.title}</h3>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs">
              {layerLabel}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {horizonLabel}
            </Badge>
            {item.gap && (
              <Badge variant="secondary" className="text-xs">
                {item.gap}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-3" />

      {/* Detail text */}
      <p className="text-sm text-muted-foreground">{item.detail}</p>

      {/* Metric */}
      {item.metric && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {item.metric.label}:
          </span>
          <span className="text-sm font-semibold">{item.metric.value}</span>
        </div>
      )}

      {/* Source */}
      {item.source && (
        <>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Fuente: </span>
            {item.source}
          </p>
        </>
      )}

      {/* Meta (key-value pairs, excluding internal keys) */}
      {item.meta && Object.keys(item.meta).length > 0 && (
        <>
          <Separator className="my-3" />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {Object.entries(item.meta).map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="font-medium text-muted-foreground">
                  {key}
                </dt>
                <dd className="truncate">{capitalizeFirst(String(value))}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
}
