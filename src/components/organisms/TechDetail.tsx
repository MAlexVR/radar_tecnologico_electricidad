"use client";

import { Technology } from "@/types/radar";
import {
  RINGS,
  SECTORS,
  getTrlColor,
  getTrlLabel,
  TECHNOLOGIES,
} from "@/lib/radar-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Target, Gauge, ArrowRight, Lightbulb } from "lucide-react";

interface TechDetailProps {
  tech: Technology | null;
}

const RING_ACTIONS = [
  "Implementación inmediata: actualización curricular, adquisición de equipos y capacitación a instructores prioritaria.",
  "Programa piloto: desarrollar laboratorios de práctica, incluir en certificaciones y formar instructores.",
  "Fase de investigación: incorporar en contenidos teóricos, monitorear evolución y establecer alianzas académicas.",
  "Vigilancia activa: seguimiento semestral, participar en eventos y documentar avances del ecosistema.",
];

export function TechDetail({ tech }: TechDetailProps) {
  if (!tech) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Target className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base mb-2">
          Selecciona una tecnología
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
          Haz clic en un punto del radar o en la tabla de nomenclaturas para ver
          detalles, madurez (TRL) y recomendaciones.
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 w-full mt-6">
          {RINGS.map((ring, i) => {
            const count = TECHNOLOGIES.filter((t) => t.ring === i).length;
            return (
              <div
                key={ring.id}
                className="rounded-lg bg-muted p-3 text-center"
              >
                <span
                  className="text-xl font-bold"
                  style={{ color: ring.color }}
                >
                  {count}
                </span>
                <p className="text-[9px] text-muted-foreground font-medium mt-0.5 truncate">
                  {ring.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const sector = SECTORS[tech.sector];
  const ring = RINGS[tech.ring];
  const tempColor = getTrlColor(tech.trl);

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div
        className="rounded-xl p-4 border-l-4"
        style={{
          backgroundColor: sector.bgDark,
          borderLeftColor: sector.color,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{sector.icon}</span>
          <Badge
            className="text-[10px]"
            style={{
              backgroundColor: `${sector.color}20`,
              color: sector.color,
              borderColor: `${sector.color}30`,
            }}
          >
            {tech.code}
          </Badge>
        </div>
        <h3 className="font-bold text-base leading-tight">{tech.name}</h3>
        <p className="text-[11px] text-muted-foreground mt-1">{sector.label}</p>
      </div>

      {/* Temperature gauge */}
      <Card className="border-0 bg-muted">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Nivel de TRL
              </span>
            </div>
            <span className="text-xs font-bold" style={{ color: tempColor }}>
              {getTrlLabel(tech.trl)}
            </span>
          </div>
          {/* Bar */}
          <div className="h-2 rounded-full bg-background overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(tech.trl / 9) * 100}%`,
                background: `linear-gradient(90deg, #4FC3F7, ${tempColor})`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] text-muted-foreground">TRL 1</span>
            <span className="text-sm font-bold" style={{ color: tempColor }}>
              TRL {tech.trl}
            </span>
            <span className="text-[9px] text-muted-foreground">TRL 9</span>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {tech.desc}
        </p>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Fase", value: ring.label, color: ring.labelColor },
          { label: "Impacto", value: tech.impact, color: "#00304d" },
          { label: "Horizonte", value: tech.horizon, color: "#007832" },
          { label: "Madurez", value: `TRL ${tech.trl}`, color: tempColor },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-muted p-2.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">
              {item.label}
            </span>
            <span
              className="text-xs font-semibold mt-0.5 block"
              style={{ color: item.color }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      {/* Action */}
      <div className="rounded-xl p-3 bg-muted border border-border/50">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-sena-yellow" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-sena-green-dark">
            Acción Recomendada
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {RING_ACTIONS[tech.ring]}
        </p>
      </div>
    </div>
  );
}
