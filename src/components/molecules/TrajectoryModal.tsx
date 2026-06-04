"use client";

/**
 * TrajectoryModal — Radix Dialog wrapper for the Trajectory Map (Electricidad domain).
 *
 * Integration layer: this molecule is allowed to import the domain adapter
 * (trajectory-data.electricidad) because it sits outside the motor/engine
 * architectural boundary enforced by trajectory-arch.test.ts.
 *
 * Layout:
 *   - Mobile: full-screen (like AboutModal / HelpModal)
 *   - Desktop: nearly full-screen (w-[98vw] max-w-[1400px] h-[92vh]) with flex-col
 *   - Right panel: TrajectoryDetail when an item is selected (desktop side-by-side,
 *     mobile stacked below the map)
 */

import { useState, useRef, useCallback, useMemo } from "react";
import { FileDown, Loader2, Map } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrajectoryMap, TrajectoryDetail } from "@/components/trajectory";
import type { TrajectoryItem } from "@/lib/trajectory";
import { electricidadConfig, buildElectricidadTrajectory } from "@/lib/trajectory-data.electricidad";
import { downloadElementAsPDF } from "@/lib/export-utils";

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TrajectoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TrajectoryModal({ open, onOpenChange }: TrajectoryModalProps) {
  // Build dataset once — electricidadConfig and buildElectricidadTrajectory are pure
  const dataset = useMemo(() => buildElectricidadTrajectory(), []);

  // Local selection state — toggling the same item deselects it
  const [selected, setSelected] = useState<TrajectoryItem | null>(null);

  const handleSelect = useCallback(
    (item: TrajectoryItem) =>
      setSelected((prev) => (prev?.id === item.id ? null : item)),
    []
  );

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Ref to the map container for PDF capture
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    if (!mapContainerRef.current) return;
    setExporting(true);
    setExportError(null);
    try {
      await downloadElementAsPDF(mapContainerRef.current, {
        title: "Mapa de Trayectoria Tecnológica — Electricidad CEET",
        filename: "Mapa_Trayectoria_Electricidad_CEET",
      });
    } catch {
      setExportError("Error al exportar. Intenta de nuevo.");
    } finally {
      setExporting(false);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          // Mobile: full-screen (same pattern as AboutModal / HelpModal)
          "fixed inset-0 top-0 left-0 translate-x-0 translate-y-0",
          "w-full h-[100dvh] max-w-none border-none rounded-none",
          // Desktop: nearly full-screen, centered
          "md:inset-auto md:top-[50%] md:left-[50%] md:-translate-x-1/2 md:-translate-y-1/2",
          "md:w-[98vw] md:max-w-[1400px] md:h-[92vh]",
          "md:border md:rounded-xl",
          // Layout
          "flex flex-col p-0 gap-0 overflow-hidden z-50",
        ].join(" ")}
        aria-describedby="trajectory-modal-description"
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        {/* pr-12 reserves space so the export button never overlaps the native Dialog close × (right-4 top-4) */}
        <DialogHeader className="px-5 pr-12 py-3 border-b bg-muted/20 flex-none m-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Map className="w-5 h-5 text-sena-green shrink-0" aria-hidden />
              <DialogTitle className="text-lg text-sena-blue truncate">
                Mapa de Trayectoria Tecnológica
              </DialogTitle>
            </div>

            {/* Export button */}
            <button
              data-testid="trajectory-export-btn"
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-sena-blue border border-sena-blue/30 hover:bg-sena-blue/10 transition-colors font-medium disabled:opacity-60 shrink-0"
              aria-label={exporting ? "Exportando…" : "Exportar PDF"}
            >
              {exporting ? (
                <Loader2 size={14} className="animate-spin" aria-hidden />
              ) : (
                <FileDown size={14} aria-hidden />
              )}
              <span className="hidden sm:inline">
                {exporting ? "Exportando…" : "Exportar PDF"}
              </span>
            </button>
          </div>

          <DialogDescription
            id="trajectory-modal-description"
            className="text-xs text-sena-gray-dark/80 mt-1 sr-only"
          >
            Mapa de Trayectoria Tecnológica del área de Electricidad — CEET SENA 2025-2035
          </DialogDescription>

          {exportError && (
            <p role="alert" className="text-xs text-red-600 mt-1">
              {exportError}
            </p>
          )}
        </DialogHeader>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-0">
          {/* Map area — ref wraps the entire frame so PDF export captures the panel */}
          <div
            ref={mapContainerRef}
            className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-3 md:p-4"
          >
            {/* Elegant outer frame — Card-style panel with SENA green accent */}
            <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
              {/* Accent band: thin SENA-green top stripe */}
              <div className="h-1 w-full bg-sena-green" aria-hidden />
              {/* Inner content with generous padding */}
              <div className="p-3 md:p-5 bg-gradient-to-b from-muted/20 to-transparent">
                {/* Contextual introduction — frames the map as a VCyT / prospectiva product */}
                <div className="mb-4 rounded-lg border-l-4 border-sena-green bg-sena-green/5 px-4 py-3">
                  <h3 className="text-sm font-bold text-sena-blue">
                    Mapa de Trayectoria Tecnológica del área de Electricidad
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-sena-gray-dark/90 md:text-[13px]">
                    Esta visualización proyecta en el tiempo (2025–2035) la evolución de las
                    capacidades del área de Electricidad del Centro de Electricidad, Electrónica
                    y Telecomunicaciones (CEET). Es un producto del ejercicio de Vigilancia
                    Científico-Tecnológica y de la prospectiva tecnológica del Centro: organiza,
                    por direccionador estratégico y horizonte de adopción, las tecnologías, la
                    infraestructura, el talento, los proyectos de I+D+i y las alianzas que el
                    área requiere para anticipar el cambio tecnológico, cerrar brechas de
                    formación y orientar las decisiones estratégicas hacia una oferta formativa
                    pertinente y a la vanguardia del sector.
                  </p>
                </div>
                <TrajectoryMap
                  config={electricidadConfig}
                  dataset={dataset}
                  onSelect={handleSelect}
                  selectedId={selected?.id ?? null}
                />

                {/* Theoretical sources (APA) — verified Springer DOIs */}
                <div className="mt-5 border-t pt-3">
                  <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Fuentes Teóricas
                  </h4>
                  <ul className="space-y-1.5 text-[11px] leading-relaxed text-sena-gray-dark/90">
                    <li>
                      de Weck, O. L. (2022). <em>Technology roadmapping and
                      development: A quantitative approach to the management of
                      technology</em>. Springer. ISBN&nbsp;978-3-030-88345-4.{" "}
                      <a
                        href="https://doi.org/10.1007/978-3-030-88346-1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sena-blue underline underline-offset-2 hover:text-sena-green break-all"
                      >
                        https://doi.org/10.1007/978-3-030-88346-1
                      </a>
                    </li>
                    <li>
                      Nimmo, G. (2013). Technology roadmapping on the industry
                      level: Experiences from Canada. En M. G. Moehrle, R.
                      Isenmann &amp; R. Phaal (Eds.), <em>Technology roadmapping
                      for strategy and innovation: Charting the route to
                      success</em> (pp.&nbsp;47–65). Springer.{" "}
                      <a
                        href="https://doi.org/10.1007/978-3-642-33923-3_4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sena-blue underline underline-offset-2 hover:text-sena-green break-all"
                      >
                        https://doi.org/10.1007/978-3-642-33923-3_4
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Detail panel — lateral on desktop, stacked below on mobile */}
          {selected && (
            <div
              data-testid="trajectory-detail-panel"
              className={[
                "border-t lg:border-t-0 lg:border-l",
                "bg-muted/10",
                // Phone (< lg): stacked below, fixed height, scrollable
                "h-56 overflow-y-auto p-4",
                // lg+: fixed-width sidebar, full height scroll
                "lg:h-auto lg:w-80 lg:shrink-0 lg:overflow-y-auto lg:p-4",
              ].join(" ")}
            >
              <TrajectoryDetail
                item={selected}
                config={electricidadConfig}
                onClose={() => setSelected(null)}
              />
            </div>
          )}
        </div>

        {/* ── Mobile close button (same pattern as AboutModal) ─────── */}
        <div className="flex-none p-4 border-t bg-muted/20 md:hidden">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full h-10 rounded-md border border-sena-gray-dark/20 text-sena-blue font-medium text-sm flex items-center justify-center"
          >
            Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
