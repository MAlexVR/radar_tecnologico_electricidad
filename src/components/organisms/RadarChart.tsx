"use client";

import React, { forwardRef } from "react";
import { Technology } from "@/types/radar";
import {
  RINGS,
  SECTORS,
  SECTOR_ANGLE,
  polarToXY,
  getTechPosition,
} from "@/lib/radar-data";

// ── SVG geometry — wider viewBox for labels ──
const SVG_W = 1200;
const SVG_H = 1060;
const CX = 600;
const CY = 520;

interface RadarChartProps {
  filteredTechs: Technology[];
  selectedTech: Technology | null;
  hoveredTech: Technology | null;
  activeSectors: Set<number>;
  activeRings: Set<number>;
  onSelect: (tech: Technology | null) => void;
  onHover: (tech: Technology | null) => void;
}

export const RadarChart = forwardRef<SVGSVGElement, RadarChartProps>(
  function RadarChart(
    {
      filteredTechs,
      selectedTech,
      hoveredTech,
      activeSectors,
      activeRings,
      onSelect,
      onHover,
    },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-full"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {/* White background — covers full viewBox including label area */}
        <rect width={SVG_W} height={SVG_H} fill="#ffffff" rx="16" />

        {/* Title */}
        <text
          x={CX}
          y={42}
          textAnchor="middle"
          fill="#1a1a2e"
          fontSize={22}
          fontWeight={700}
          letterSpacing="0.5"
        >
          Radar Tecnológico — Electricidad CEET 2025-2035
        </text>

        {/* Ring fills — outermost first */}
        {[...RINGS].reverse().map((ring) => (
          <circle
            key={ring.id}
            cx={CX}
            cy={CY}
            r={ring.radius}
            fill={ring.fillColor}
            stroke={ring.borderColor}
            strokeWidth={1.5}
            opacity={0.9}
          />
        ))}

        {/* Ring labels */}
        {RINGS.map((ring) => (
          <text
            key={`rl-${ring.id}`}
            x={CX}
            y={CY - ring.radius + 18}
            textAnchor="middle"
            fill={ring.labelColor}
            fontSize={13}
            fontWeight={700}
            opacity={0.8}
            letterSpacing="2"
          >
            {ring.label}
          </text>
        ))}

        {/* Sector dividers — dashed gray */}
        {SECTORS.map((s) => {
          const outer = polarToXY(CX, CY, RINGS[3].radius + 12, s.startAngle);
          const segments: React.JSX.Element[] = [];
          const steps = 40;
          for (let i = 0; i < steps; i += 2) {
            const t1 = i / steps;
            const t2 = (i + 1) / steps;
            const x1 = CX + (outer.x - CX) * t1;
            const y1 = CY + (outer.y - CY) * t1;
            const x2 = CX + (outer.x - CX) * t2;
            const y2 = CY + (outer.y - CY) * t2;
            segments.push(
              <line
                key={`${s.id}-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9e9e9e"
                strokeWidth={0.8}
                opacity={0.5}
              />,
            );
          }
          return <g key={s.id}>{segments}</g>;
        })}

        {/* Sector labels — single line, outside outermost ring */}
        {SECTORS.map((s, si) => {
          const midAngle = s.startAngle + SECTOR_ANGLE / 2;
          const labelR = RINGS[3].radius + 30;
          const pos = polarToXY(CX, CY, labelR, midAngle);

          // Always center-align the lines relative to each other
          const anchor = "middle";

          // Adjust x-position to simulate the previous start/end anchoring
          // so the text block stays roughly in the same place
          let textX = pos.x;
          const shift = 60; // Approximate half-width of labels

          if (pos.x > CX + 60) {
            textX += shift;
          } else if (pos.x < CX - 60) {
            textX -= shift;
          }

          const isActive = activeSectors.has(si);

          return (
            <text
              key={`sl-${s.id}`}
              x={textX}
              y={pos.y}
              textAnchor={anchor}
              fill={isActive ? s.color : "#9e9e9e"}
              fontSize={12}
              fontWeight={800}
              opacity={isActive ? 1 : 0.3}
            >
              {s.labelLines
                ? s.labelLines.map((line, i) => (
                    <tspan key={i} x={textX} dy={i === 0 ? 0 : "1.2em"}>
                      {line}
                    </tspan>
                  ))
                : s.shortLabel}
            </text>
          );
        })}

        {/* Technology dots */}
        {filteredTechs.map((tech) => {
          const pos = getTechPosition(tech, CX, CY);
          const sector = SECTORS[tech.sector];
          const isActive =
            selectedTech?.id === tech.id || hoveredTech?.id === tech.id;
          const r = isActive ? 8 : 6;

          return (
            <g
              key={tech.id}
              style={{ cursor: "pointer" }}
              onClick={() =>
                onSelect(selectedTech?.id === tech.id ? null : tech)
              }
              onMouseEnter={() => onHover(tech)}
              onMouseLeave={() => onHover(null)}
            >
              {/* Glow for active */}
              {isActive && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={14}
                  fill={sector.color}
                  opacity={0.2}
                />
              )}
              {/* Dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={r}
                fill={sector.color}
                stroke="#fff"
                strokeWidth={isActive ? 2.5 : 1.5}
                opacity={isActive ? 1 : 0.85}
              />
              {/* Label — dark text for readability */}
              <text
                x={pos.x}
                y={(() => {
                  const lineCount = tech.nameLines?.length ?? 1;
                  const fontSize = isActive ? 11 : 9.5;
                  const lineHeight = fontSize * 1.2;
                  const gap = tech.labelDy ?? (isActive ? 14 : 12);

                  if (!tech.labelAbove) {
                    return pos.y + gap;
                  }
                  // Above: place so last line is `gap` px above the dot
                  return pos.y - gap - (lineCount - 1) * lineHeight;
                })()}
                textAnchor="middle"
                fill={isActive ? "#1a1a2e" : "#3a3a5c"}
                fontSize={isActive ? 11 : 9.5}
                fontWeight={isActive ? 700 : 500}
              >
                {tech.nameLines
                  ? tech.nameLines.map((line: string, i: number) => (
                      <tspan key={i} x={pos.x} dy={i === 0 ? 0 : "1.2em"}>
                        {line}
                      </tspan>
                    ))
                  : tech.name}
              </text>
            </g>
          );
        })}

        {/* Source Text Attribution */}
        <text
          x={CX}
          y={SVG_H - 30}
          textAnchor="middle"
          fill="#8e8e8e"
          fontSize={12}
          fontWeight={500}
        >
          Fuente: Elaboración propia basada en ejercicio VCyT CEET-GICS (2025).
          Metodología tipo Gartner Technology Radar.
        </text>
      </svg>
    );
  },
);
