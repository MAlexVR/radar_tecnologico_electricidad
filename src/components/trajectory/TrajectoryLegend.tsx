"use client";

/**
 * TrajectoryLegend — visual legend derived from TrajectoryConfig.
 *
 * Renders three sections:
 *   1. Layers / swimlanes — swatch in layer.color (when provided)
 *   2. Brecha (gap) — critica (red) and alta (amber) sampled from colorFor
 *   3. Horizonte — ordered bucket labels
 *
 * Fully data-agnostic — no domain symbols imported.
 */

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { TrajectoryConfig, TrajectoryItem } from "@/lib/trajectory";

// Gap severity dot colors — same as TrajectoryNode
const GAP_DOT_COLORS: Record<string, string> = {
  critica: "#C62828",
  alta:    "#F9A825",
};

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TrajectoryLegendProps {
  config: TrajectoryConfig;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Legend component showing layers and their associated colors.
 * Colors are sampled by calling `config.colorFor` with a synthetic
 * representative item per layer (horizon = "ahora", no gap by default).
 */
export function TrajectoryLegend({ config, className }: TrajectoryLegendProps) {
  const sortedLayers = [...config.layers].sort((a, b) => a.order - b.order);

  return (
    <aside
      aria-label="Leyenda del mapa de trayectoria"
      className={cn("space-y-4 text-sm", className)}
    >
      {/* 1. Layers section — swatch in layer.color */}
      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Capas
        </h4>
        <ul className="space-y-1.5" role="list">
          {sortedLayers.map((layer) => {
            const layerColor = (layer as { color?: string } & typeof layer).color;
            // Fallback: sample via colorFor with a neutral item when no layer.color
            const sample: TrajectoryItem = {
              id: `__legend-${layer.key}`,
              layer: layer.key,
              driver: config.drivers[0]?.key ?? "",
              horizon: "ahora",
              title: layer.label,
              detail: "",
            };
            const fallbackClass = config.colorFor(sample);

            return (
              <li key={layer.key} className="flex items-center gap-2">
                {layerColor ? (
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: layerColor }}
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className={cn("h-3 w-3 shrink-0 rounded-sm border", fallbackClass)}
                  />
                )}
                <span className="text-xs" style={layerColor ? { color: layerColor, fontWeight: 500 } : undefined}>
                  {layer.label}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <Separator />

      {/* 2. Brecha (gap severity) section */}
      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Brecha
        </h4>
        <ul className="space-y-1.5" role="list">
          {Object.entries(GAP_DOT_COLORS).map(([gapKey, dotColor]) => (
            <li key={gapKey} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: dotColor }}
              />
              <span className="text-xs capitalize">{gapKey}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      {/* 3. Horizon buckets section — swatch in bucket.color when available */}
      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Horizonte
        </h4>
        <ul className="space-y-1.5" role="list">
          {[...config.horizonBuckets]
            .sort((a, b) => a.order - b.order)
            .map((bucket) => {
              const bucketColor = (bucket as { color?: string }).color;
              return (
                <li key={bucket.key} className="flex items-center gap-2">
                  {bucketColor ? (
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: bucketColor }}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {bucket.order}.
                    </span>
                  )}
                  <span
                    className="text-xs"
                    style={bucketColor ? { color: bucketColor, fontWeight: 500 } : undefined}
                  >
                    {bucket.label}
                  </span>
                </li>
              );
            })}
        </ul>
      </section>
    </aside>
  );
}
