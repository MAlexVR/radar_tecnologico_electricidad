/**
 * Adaptador de dominio electricidad para el motor de trayectoria.
 *
 * Este archivo ES el límite de dominio: puede importar @/lib/radar-data
 * y las Tablas GOR. El motor (src/lib/trajectory/ y src/components/trajectory/)
 * NO importa este archivo — la dependencia es unidireccional:
 *   dominio → adaptador → motor
 *
 * Fuentes de datos:
 *   - radar-data.ts: TECHNOLOGIES (L01–L18, 18 líneas), SECTORS (D1–D5)
 *   - GOR-F-012_Electricidad.md:
 *     Tabla 8  — Esquema de Optimización de Programas (actualización curricular y ambientes)
 *     Tabla 9  — Mapa de Potenciales Aliados
 *     Tabla 10 — Proyectos Sugeridos por Direccionador
 *     Tabla 11 — Identificación de variables, brechas y cierre de brechas científicas-tecnológicas
 *
 * REGLA ANTI-FABRICACIÓN: solo se transcriben textos presentes en las tablas
 * del GOR o en radar-data. Los juicios de mapeo están marcados // JUICIO:.
 */

import { TECHNOLOGIES, SECTORS } from "@/lib/radar-data";
import { normalizeHorizon } from "@/lib/trajectory";
import type {
  TrajectoryConfig,
  TrajectoryDataset,
  TrajectoryItem,
} from "@/lib/trajectory";

// ── Constante: título oficial del documento GOR ───────────────────────────────
// Fuente: GOR-F-012_Electricidad.md — encabezado tabla de clasificación del documento
// "Vigilancia científico-tecnológica y prospectiva del área de electricidad 2026 - 2036"
// Presentado por: Luz Mayerly Amaya Romero, Instructora, CEET — SENA, Mayo 2026
export const FUENTE_GOR =
  "Vigilancia científico-tecnológica y prospectiva del área de electricidad 2026-2036 (GOR-F-012)";

// ── Paleta semántica de brecha ────────────────────────────────────────────────
// GOR Tabla 11: Rojo = Crítica (acción inmediata 0-12 meses); Amarillo = Alta (6-24 meses).
// Moderada no aparece explícitamente en Tabla 11 de electricidad — se mantiene por compatibilidad con el motor.

const GAP_COLORS: Record<string, string> = {
  "Crítica":  "bg-red-700 text-white",       // Rojo — brecha crítica (acción 0-12 meses, Tabla 11)
  "Alta":     "bg-amber-500 text-white",      // Ámbar — brecha alta (acción 6-24 meses, Tabla 11)
  "Moderada": "bg-green-300 text-green-900",  // Verde claro — brecha moderada
};

const DRIVER_COLORS: Record<string, string> = {
  D1: "bg-blue-100 text-blue-900",
  D2: "bg-red-100 text-red-900",
  D3: "bg-orange-100 text-orange-900",
  D4: "bg-purple-100 text-purple-900",
  D5: "bg-teal-100 text-teal-900",
};

const NEUTRAL_COLOR = "bg-gray-100 text-gray-800";

// ── electricidadConfig: TrajectoryConfig ─────────────────────────────────────

/**
 * Configuración del mapa de trayectoria para el dominio electricidad CEET.
 * Los strings son en español; el motor es agnóstico.
 */
export const electricidadConfig: TrajectoryConfig = {
  // ── Drivers: derivados de SECTORS (D1..D5) con color institucional ───────
  // Colores del radar (SECTORS[i].color) para coherencia visual entre radar y mapa.
  drivers: SECTORS.map((s) => ({
    key: s.id,      // "D1" .. "D5" — se muestra en la línea 1 del tab
    label: s.label, // sin prefijo de código; la línea 1 del tab ya muestra D1..D5
    icon: s.icon,
    color: s.color, // hex del radar — coherencia visual entre módulos
  })),

  // ── Layers: 4 swimlanes con paleta profesional ────────────────────────────
  layers: [
    { key: "L1", label: "Tecnologías",      order: 1, color: "#1565C0" }, // azul SENA
    { key: "L2", label: "Infraestructura",  order: 2, color: "#2E7D32" }, // verde SENA
    { key: "L3", label: "Talento & I+D+i",  order: 3, color: "#6A1B9A" }, // púrpura
    { key: "L4", label: "Alianzas",         order: 4, color: "#00838F" }, // cian/teal
  ],

  // ── Horizon buckets: 5 columnas de tiempo con continuo frío vívido ──────
  // Gradiente secuencial teal → azul → índigo → violeta → púrpura.
  horizonBuckets: [
    { key: "ahora",  label: "Ya / Ahora",  order: 1, color: "#14B8A6" }, // teal
    { key: "corto",  label: "0–12 meses",  order: 2, color: "#3B82F6" }, // azul
    { key: "medio1", label: "1–3 años",    order: 3, color: "#6366F1" }, // índigo
    { key: "medio2", label: "3–5 años",    order: 4, color: "#8B5CF6" }, // violeta
    { key: "largo",  label: "5–10 años",   order: 5, color: "#A855F7" }, // púrpura
  ],

  // ── colorFor: por gap (semántica de brecha); L1 por driver si no hay gap ─
  colorFor: (item) => {
    if (item.gap && GAP_COLORS[item.gap]) return GAP_COLORS[item.gap];
    if (item.layer === "L1") {
      return DRIVER_COLORS[item.driver] ?? NEUTRAL_COLOR;
    }
    return NEUTRAL_COLOR;
  },

  // ── labelFor: devuelve item.title ─────────────────────────────────────────
  labelFor: (item) => item.title,

  // ── metricBadge: solo para L1 (TRL) ──────────────────────────────────────
  metricBadge: (item) => {
    if (item.metric && item.layer === "L1") {
      return `TRL ${item.metric.value}`;
    }
    return null;
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convierte sector index (0-based) a clave de driver "D1".."D5".
 */
function driverKey(sectorIndex: number): string {
  return `D${sectorIndex + 1}`;
}

/**
 * Normaliza el horizonte de radar-data (electricidad) a HorizonBucket.
 *
 * Los strings de TECHNOLOGIES en electricidad son distintos a los de telecom:
 *   "Corto (1-3 años)"          → "corto"
 *   "Corto-mediano (2025-2030)" → "corto"   // JUICIO: 2025-2030 = prácticamente corto-medio; conservador: corto
 *   "Medio (2-5 años)"          → "medio1"  // normalizeHorizon fallback
 *   "Largo (5-10 años)"         → "largo"
 * normalizeHorizon del motor cubre los casos estándar; los casos específicos
 * de electricidad se manejan aquí antes de delegar.
 */
function normalizeElecHorizon(raw: string): import("@/lib/trajectory").HorizonBucket {
  const key = raw.trim().toLowerCase();
  // Electricidad-specific mappings not in the generic map
  if (key === "corto (1-3 años)")            return "corto";
  if (key === "corto-mediano (2025-2030)")   return "corto";  // JUICIO: horizonte inmediato-cercano
  if (key === "corto-mediano (2-5 años)")    return "medio1";
  if (key === "largo (5-10 años)")           return "largo";
  if (key === "medio (2-5 años)")            return "medio1";
  if (key === "medio (2-5 años)")            return "medio1";
  // Delegate remaining cases to the generic normalizer
  return normalizeHorizon(raw);
}

// ── buildElectricidadTrajectory ───────────────────────────────────────────────

/*
 * ────────────────────────────────────────────────────────────────────────────
 * MATRIZ DE COBERTURA (driver × capa → número de ítems L2/L3/L4)
 * ────────────────────────────────────────────────────────────────────────────
 *        L2    L3    L4   | total cap.
 * D1      2     4     3   |     9
 * D2      3     4     2   |     9
 * D3      2     3     2   |     7
 * D4      2     3     2   |     7
 * D5      2     3     3   |     8
 * ────────────────────────────────────────────────────────────────────────────
 * L1 (tecnologías): 18 ítems derivados de TECHNOLOGIES (todos los drivers).
 * Total ítems L2-L4: 40 ítems. Total general: 58 ítems.
 * ────────────────────────────────────────────────────────────────────────────
 */

/**
 * Construye el TrajectoryDataset para el mapa de trayectoria de electricidad.
 *
 * Capa L1 — Tecnologías: derivada de TODOS los items de TECHNOLOGIES.
 * Capas L2/L3/L4 — Infraestructura, Talento & I+D+i, Alianzas:
 *   Pobladas para TODOS los direccionadores D1–D5, transcritas fielmente del GOR.
 */
export function buildElectricidadTrajectory(): TrajectoryDataset {
  const items: TrajectoryItem[] = [];

  // ── L1: Tecnologías (todos los direccionadores) ───────────────────────────
  // Fuente: TECHNOLOGIES de radar-data.ts
  // Las líneas con brecha Crítica (Tabla 11) llevan gap="Crítica":
  //   L01 (Microrredes), L02 (BESS), L03 (DER), L05 (FV on-grid + BESS),
  //   L06 (AMI), L07 (SCADA/DMS), L08 (Self-healing), L10 (VPP), L11 (DERMS),
  //   L12 (DR) — Tabla 11 filas 1-3: brechas Críticas en D1/D2/D3
  // Las líneas con brecha Alta (Tabla 11):
  //   L09 (Gemelo Digital), L13 (V2G), L14 (Infra Carga), L15 (BEMS),
  //   L18 (Gobernanza Datos)

  const CRITICAL_LINES = new Set([
    "L01", // Microrredes — Tabla 11 fila 4: Crítica
    "L02", // BESS — Tabla 11 fila 5: Crítica
    "L03", // DER — JUICIO: DER integrado es brecha crítica per análisis D1
    "L05", // Sistemas FV on-grid — Tabla 11 fila 5: Crítica
    "L06", // AMI — Tabla 11 fila 1: Crítica
    "L07", // SCADA/DMS — Tabla 11 fila 3: Crítica
    "L08", // Self-healing / Automatización — JUICIO: parte de IEC 61850 brecha Crítica
  ]);

  const HIGH_LINES = new Set([
    "L09", // Gemelo Digital — Tabla 11 fila 8: Alta
    "L10", // VPP — Tabla 11 fila 11: Alta (parte de D3)
    "L11", // DERMS — Tabla 11 fila 11: Alta
    "L13", // V2G — Tabla 11 fila: Alta (D4 movilidad eléctrica)
    "L15", // BEMS — Tabla 11 fila 7: Alta
    "L18", // Gobernanza Datos — Tabla 11 fila 12: Alta
  ]);

  for (const tech of TECHNOLOGIES) {
    const driver = driverKey(tech.sector);
    const horizon = normalizeElecHorizon(tech.horizon);
    const gap = CRITICAL_LINES.has(tech.code)
      ? "Crítica"
      : HIGH_LINES.has(tech.code)
      ? "Alta"
      : undefined;

    items.push({
      id: `tech-${tech.code}`,
      layer: "L1",
      driver,
      horizon,
      title: tech.name,
      detail: tech.desc,
      metric: { label: "TRL", value: tech.trl },
      gap,
      relatedIds: [],
      source: `${FUENTE_GOR}, Radar tecnológico`,
      meta: { Código: tech.code },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // D1: Transición Energética Hacia Sistemas Sostenibles
  // L2/L3/L4 — fuente: GOR Tablas 8, 9, 10, 11
  // ─────────────────────────────────────────────────────────────────────────

  // ── D1 / L2: Infraestructura ─────────────────────────────────────────────

  // Tabla 11, fila 4: Microrredes Híbridas con BESS — Brecha Crítica
  // "Microrred didáctica: solar 3 kWp + BESS LFP 10 kWh con BMS + diésel 5 kVA + carga programable."
  // Tabla 8: "Kits IoT y Sensorización de Red — Dotar de kits de sensores" (P2)
  // Tabla 10 D1: "Diseño e implementación de una microrred híbrida didáctica solar-BESS"
  items.push({
    id: "d1-l2-microrred-solar-bess",
    layer: "L2",
    driver: "D1",
    horizon: "medio1", // JUICIO: Tabla 11 fila 4 — implementación 12-30 meses (Cuadrante 2); Tabla 10 D1 modernización
    title: "Laboratorio: microrred híbrida didáctica (solar 3 kWp + BESS LFP 10 kWh + diésel 5 kVA)",
    detail:
      "Diseñar, construir y poner en operación una microrred híbrida didáctica de baja potencia: solar fotovoltaica 3 kWp + batería BESS LFP 10 kWh con BMS + carga programable + generador diésel 5 kVA de respaldo. Controlador de microrred (SEL-3530 RTAC o Schneider Conext). Inversor híbrido bidireccional con SunSpec Modbus. Software HOMER Pro para dimensionamiento.",
    gap: "Crítica", // Tabla 11 fila 4: brecha Crítica — sin BESS, sin controlador de microrred
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "Ambiente",
      Prioridad: "P1",
      Línea: "L01/L02",
    },
  });

  // Tabla 11, fila 5: Sistemas FV On-Grid con Almacenamiento Residencial — Brecha Crítica
  // "Inversor híbrido bidireccional didáctico. Módulo BESS LFP 5 kWh con BMS. Software PVsyst."
  items.push({
    id: "d1-l2-kit-fv-on-grid-bess",
    layer: "L2",
    driver: "D1",
    horizon: "corto", // Tabla 1: "Alto impacto / Bajo esfuerzo. Horizonte: 6-12 meses."
    title: "Kit FV on-grid con BESS residencial (inversor híbrido + módulo LFP 5 kWh + PVsyst)",
    detail:
      "Evolucionar de off-grid a on-grid + BESS. Adquirir inversor híbrido bidireccional didáctico y módulo BESS LFP 5 kWh con BMS. Instalar software PVsyst para dimensionamiento. Incluir análisis financiero de AGPE bajo CREG 030/2018 y CREG 098/2019.",
    gap: "Crítica", // Tabla 11 fila 5: brecha Crítica — sin inversores bidireccionales ni BESS residencial
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "Ambiente",
      Prioridad: "P1",
      Línea: "L05",
    },
  });

  // ── D1 / L3: Talento & I+D+i ─────────────────────────────────────────────

  // Tabla 8: "Técnico Instalación Sistemas Eléctricos Residenciales y Comerciales — Actualización Curricular —
  //   Desarrollar resultado de aprendizaje en instalación, configuración y lectura de medidores inteligentes
  //   con protocolo DLMS/COSEM." — Alta (P1)
  // JUICIO: el aspecto FV/BESS residencial del programa 832202 se registra en D1.
  items.push({
    id: "d1-l3-capacitacion-fv-bess",
    layer: "L3",
    driver: "D1",
    horizon: "corto", // Tabla 8: Alta (P1) = implementación 0-12 meses
    title: "Formación a instructores: sistemas FV on-grid + BESS (Fronius / SMA / Huawei Academy)",
    detail:
      "Capacitar instructores en inversores híbridos bidireccionales, BESS residencial, software PVsyst y regulación AGPE (CREG 030/2018, CREG 098/2019). Programas educativos disponibles en Fronius Solar Academy, SMA Training y Huawei FusionSolar Academy. Mínimo 2 instructores capacitados.",
    gap: "Crítica", // Tabla 11 fila 5: L05 brecha Crítica — sin formación on-grid ni BESS
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "Talento", Prioridad: "P1" },
  });

  // Tabla 10 D1: "Diseño e implementación de una microrred híbrida didáctica solar-BESS para formación
  //   en transición energética" — Modernización de Ambientes
  items.push({
    id: "d1-l3-proyecto-microrred-sennova",
    layer: "L3",
    driver: "D1",
    horizon: "medio1", // JUICIO: proyecto SENNOVA/modernización — ciclo 12-18 meses
    title: "Proyecto: microrred híbrida solar-BESS didáctica (Modernización de Ambientes)",
    detail:
      "Diseñar, construir y poner en operación una microrred híbrida didáctica de baja potencia (solar FV 3 kWp + BESS LFP 10 kWh + carga programable + generador diésel 5 kVA de respaldo). Aliado potencial: Schneider Electric (Programa académico EcoStruxure). Impacto: desarrollo de competencias en microrredes, BESS e integración DER inexistentes en la oferta actual.",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "Proyecto",
      Programa: "Modernización de Ambientes",
      Aliado: "Schneider Electric (EcoStruxure)",
    },
  });

  // Tabla 8: "Tecnólogo Gestión Eficiente de la Energía — Actualización Curricular —
  //   Evolucionar de eficiencia energética convencional hacia BEMS con inteligencia artificial." — Alta (P1)
  // JUICIO: el aspecto de integración DER/BEMS del programa 821207 se registra en D1.
  items.push({
    id: "d1-l3-actualizacion-gestion-energia-der",
    layer: "L3",
    driver: "D1",
    horizon: "corto", // Tabla 8: Alta (P1) = 0-12 meses
    title: "Actualización curricular: Tecnólogo Gestión Eficiente de la Energía (DER + BEMS + Python)",
    detail:
      "Evolucionar de eficiencia energética convencional (ISO 50001, auditorías) hacia BEMS con inteligencia artificial: predicción de demanda (LSTM, Random Forest), optimización tarifaria TOU, integración DER solar + BESS, Python básico para análisis de datos energéticos. Plataformas: Schneider EcoStruxure Building, Siemens Desigo CC.",
    gap: "Alta", // Tabla 11 fila 7: L15 brecha Crítica → evolución desde alta
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "Talento", Prioridad: "P1" },
  });

  // Tabla 10 D1: "Modernización de Ambientes" — Schneider Electric programa académico EcoStruxure
  // JUICIO: los cursos complementarios en energías renovables se registran en D1 L3.
  items.push({
    id: "d1-l3-capacitacion-microrredes-schneider",
    layer: "L3",
    driver: "D1",
    horizon: "corto", // P1 = 0-12 meses; Schneider Electric University cursos disponibles
    title: "Formación a instructores: microrredes y BESS (Schneider Electric University / SEL Academy)",
    detail:
      "Plan de formación para instructores en microrredes híbridas, almacenamiento BESS y control de microrred. Programas disponibles en Schneider Electric University (EcoStruxure, PEM) y SEL Academy (SEL-3530 RTAC). Mínimo 2 instructores capacitados.",
    gap: "Crítica", // Tabla 11 fila 4: brecha Crítica — instructores sin formación en BESS ni microrred
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "Talento", Prioridad: "P1" },
  });

  // ── D1 / L4: Alianzas ────────────────────────────────────────────────────

  // Tabla 9: "Schneider Electric (Schneider Electric University)" — Fabricante con programa educativo
  // "Convenio de equipamiento académico: dotación de laboratorio smart grid con tableros didácticos,
  //  inversores, medidores y software EcoStruxure a precio preferencial."
  items.push({
    id: "d1-l4-schneider-electric",
    layer: "L4",
    driver: "D1",
    horizon: "corto", // Tabla 9: convenio equipamiento — formalizable en 6-12 meses; programas académicos activos
    title: "Schneider Electric (Schneider Electric University)",
    detail:
      "Líder mundial en distribución eléctrica, automatización y gestión energética. Schneider Electric University ofrece formación gratuita y certificaciones PEM en eficiencia energética, smart grids y EcoStruxure. Tipo de alianza sugerida: convenio de equipamiento académico con tableros didácticos, inversores y software EcoStruxure a precio preferencial.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "Alianza",
      Aliado: "Schneider Electric",
      "Tipo de aliado": "Fabricante",
      País: "Francia / Colombia",
    },
  });

  // Tabla 10 D1: Aliado potencial — Schneider Electric (programa académico EcoStruxure)
  // JUICIO: Fronius/SMA/Huawei se mencionan en Tabla 11 fila 5 como distribuidores locales — se agrupan
  items.push({
    id: "d1-l4-fronius-sma-huawei",
    layer: "L4",
    driver: "D1",
    horizon: "corto", // Tabla 11 fila 5: "Convenio con distribuidores locales (Fronius, SMA)" — inmediato
    title: "Fronius / SMA / Huawei (fabricantes inversores FV-BESS)",
    detail:
      "Fabricantes de inversores híbridos con programas de capacitación. Fronius Solar Academy, SMA Training y Huawei FusionSolar Academy. Tipo de alianza sugerida: capacitación de instructores + kits didácticos a precio preferencial.",
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "Alianza",
      Aliado: "Fronius / SMA / Huawei",
      "Tipo de aliado": "Fabricante",
      País: "Austria / Alemania / China",
    },
  });

  // Tabla 9: Universidad Nacional de Colombia — Grupo PAAS-UN
  // "Co-diseño de módulos curriculares en redes inteligentes y microrredes."
  items.push({
    id: "d1-l4-unal",
    layer: "L4",
    driver: "D1",
    horizon: "medio1", // Convenio interinstitucional — formalización 6-12 meses con UNAL
    title: "Universidad Nacional de Colombia (Grupo PAAS-UN)",
    detail:
      "Principal universidad pública del país con grupos de investigación A1 en sistemas eléctricos de potencia, calidad de energía (PAAS-UN) y smart grids. Miembro del UCAIUG (IEC 61850 Users Group). Capacidad de co-investigación en microrredes, AMI y gobernanza de datos energéticos. Tipo de alianza sugerida: convenio interinstitucional de cooperación académica para co-diseño de módulos curriculares.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "Alianza",
      Aliado: "Universidad Nacional de Colombia (PAAS-UN)",
      "Tipo de aliado": "Universidad",
      País: "Colombia",
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // D2: Automatización de Redes Hacia la Transición Digital
  // L2/L3/L4 — fuente: GOR Tablas 8, 9, 10, 11
  // ─────────────────────────────────────────────────────────────────────────

  // ── D2 / L2: Infraestructura ─────────────────────────────────────────────

  // Tabla 11, fila 1: Medición Inteligente AMI — Brecha Crítica
  // "Adquirir kit de mín. 10 medidores didácticos AMI con protocolo DLMS/COSEM.
  //  Software MDM para gestión de datos de medición. Módulo formativo en instalación."
  items.push({
    id: "d2-l2-kit-ami-medidores",
    layer: "L2",
    driver: "D2",
    horizon: "corto", // Tabla 1: "Horizonte: 6-12 meses" (Quick Win); Tabla 11 acción inmediata 0-12m
    title: "Kit AMI didáctico: 10 medidores inteligentes DLMS/COSEM + software MDM",
    detail:
      "Adquirir kit de mínimo 10 medidores didácticos AMI con protocolo DLMS/COSEM (ej. Landis+Gyr E450 o Itron OpenWay) y software MDM para gestión de datos de medición. Habilita prácticas de instalación, configuración y lectura de medidores inteligentes en los programas 832202 y 832333. Aliado: Enel Colombia (validación con datos reales).",
    gap: "Crítica", // Tabla 11 fila 1: brecha Crítica — sin medidores inteligentes ni formación DLMS/COSEM
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "Ambiente",
      Prioridad: "P1",
      Línea: "L06",
      Cierre: "Convenio Enel Colombia",
    },
  });

  // Tabla 11, fila 2: Automatización de Subestaciones IEC 61850 — Brecha Crítica
  // "Laboratorio de automatización IEC 61850: mín. 4 IEDs (relés SEL-751/ABB REF615),
  //  1 RTAC (SEL-3530), switches Ethernet industriales con VLANs, servidor SCADA."
  items.push({
    id: "d2-l2-laboratorio-iec61850",
    layer: "L2",
    driver: "D2",
    horizon: "medio1", // Tabla 11: acción 12-30 meses (Cuadrante 2) — inversión alta, requiere planificación
    title: "Laboratorio IEC 61850: 4 IEDs + RTAC + switches industriales + servidor SCADA/DMS",
    detail:
      "Implementar laboratorio de automatización de redes de distribución basado en IEC 61850: mínimo 4 IEDs (relés SEL-751/ABB REF615), 1 controlador RTAC (SEL-3530), switches Ethernet industriales con VLANs, servidor SCADA/DMS educativa. Plataforma: ETAP, Survalent o GridLAB-D open-source. Primera infraestructura IEC 61850 en un centro SENA del país.",
    gap: "Crítica", // Tabla 11 fila 2: brecha Crítica — sin IEDs, sin RTAC, sin protocolos IEC 61850
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "Ambiente",
      Prioridad: "P1",
      Línea: "L07/L08",
      Aliado: "SEL University / XM S.A.",
    },
  });

  // Tabla 11, fila 3: SCADA/DMS con funciones avanzadas — Brecha Crítica
  // "Plataforma SCADA/DMS educativa con funciones FLISR y VVO para mín. 15 estaciones."
  items.push({
    id: "d2-l2-plataforma-scada-dms",
    layer: "L2",
    driver: "D2",
    horizon: "medio1", // Tabla 11: brecha Crítica acción 12-24 meses; requiere licencias académicas
    title: "Plataforma SCADA/DMS educativa con FLISR/VVO (ETAP o DIgSILENT + GridLAB-D/OpenDSS)",
    detail:
      "Adquirir licencia académica ETAP o DIgSILENT PowerFactory para 15 estaciones con funciones FLISR (Fault Location, Isolation, Service Restoration) y VVO (Volt/VAR Optimization). Instalar GridLAB-D/OpenDSS como complemento open-source gratuito. Sin plataforma SCADA/DMS ni simulador de red actualmente en el CEET.",
    gap: "Crítica", // Tabla 11 fila 3: brecha Crítica — sin SCADA/DMS, sin funciones FLISR/VVO
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "Ambiente",
      Prioridad: "P1",
      Línea: "L07",
    },
  });

  // ── D2 / L3: Talento & I+D+i ─────────────────────────────────────────────

  // Tabla 8: "Técnico Instalación Sistemas Eléctricos Residenciales y Comerciales —
  //   Actualización Curricular — Desarrollar resultado de aprendizaje en instalación,
  //   configuración y lectura de medidores inteligentes con protocolo DLMS/COSEM." — Alta (P1)
  items.push({
    id: "d2-l3-capacitacion-ami-dlms",
    layer: "L3",
    driver: "D2",
    horizon: "corto", // Tabla 8: Alta (P1) = implementación 0-12 meses
    title: "Formación a instructores: AMI y protocolo DLMS/COSEM (certificación Landis+Gyr / Itron / SEL University)",
    detail:
      "Capacitar instructores en instalación, configuración y lectura de medidores inteligentes con protocolo DLMS/COSEM, software MDM. SEL University ofrece cursos gratuitos IEC 61850. ABB Ability Academic: relés REF615 y plataforma PCM600. Mínimo 2 instructores capacitados.",
    gap: "Crítica", // Tabla 11 fila 1: brecha Crítica — sin formación AMI/DLMS-COSEM
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "Talento", Prioridad: "P1" },
  });

  // Tabla 8: "Tecnólogo Electricidad Industrial — Actualización Curricular —
  //   Reemplazar control convencional por automatización de distribución: SCADA/DMS, FLISR,
  //   reconectadores automáticos con DNP3/IEC 61850." — Alta (P1)
  items.push({
    id: "d2-l3-actualizacion-electricidad-industrial",
    layer: "L3",
    driver: "D2",
    horizon: "corto", // Tabla 8: Alta (P1) = 0-12 meses
    title: "Actualización curricular: Tecnólogo Electricidad Industrial (SCADA/DMS, FLISR, IEC 61850)",
    detail:
      "Reemplazar contenido de control industrial convencional (contactores, PLC básico) por automatización de distribución: SCADA/DMS (ETAP, Survalent o GridLAB-D open-source), funciones FLISR, gestión de reconectadores automáticos con comunicación DNP3/IEC 61850.",
    gap: "Crítica", // Tabla 11 fila 3: brecha Crítica — mayor potencial de transformación pero también mayor brecha
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "Talento", Prioridad: "P1" },
  });

  // Tabla 8: "Técnico Montaje y Mant. Redes Aéreas Distribución — Actualización Curricular —
  //   Agregar competencia en instalación de sensores IoT: LoRaWAN/4G-LTE, MQTT." — Alta (P1)
  items.push({
    id: "d2-l3-actualizacion-redes-aereas-iot",
    layer: "L3",
    driver: "D2",
    horizon: "corto", // Tabla 8: Alta (P1) = 0-12 meses
    title: "Actualización curricular: Técnico Redes Aéreas Distribución (sensores IoT, LoRaWAN, MQTT)",
    detail:
      "Agregar competencia en instalación de sensores IoT en redes aéreas: monitores de línea (ej. Sentient Energy MM3), sensores de temperatura de conductor, detectores de falla por corriente (FCI), comunicación vía LoRaWAN/4G-LTE. Protocolo MQTT para envío de datos a plataformas de monitoreo.",
    gap: "Crítica", // Tabla 11 fila 6: brecha Crítica — sin formación en IoT de redes eléctricas
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "Talento", Prioridad: "P1" },
  });

  // Tabla 10 D2: "Laboratorio de automatización de distribución con IEC 61850 y funciones SCADA/DMS"
  //   Tipo: Modernización de Ambientes + I+D+i aplicada SENNOVA.
  //   Aliado: XM S.A. (capacitación simulador SIN), Enel Colombia (validación escenarios reales).
  items.push({
    id: "d2-l3-proyecto-iec61850-sennova",
    layer: "L3",
    driver: "D2",
    horizon: "medio1", // Tabla 10 D2: proyecto 12-30 meses — Cuadrante 2 (proyectos estratégicos)
    title: "Proyecto I+D+i SENNOVA: Laboratorio IEC 61850 + SCADA/DMS para redes inteligentes",
    detail:
      "Modernización de Ambientes + I+D+i aplicada SENNOVA: implementar laboratorio de automatización de distribución con IEC 61850, IEDs de protección, controlador RTAC, y plataforma SCADA/DMS educativa. Aliado potencial: XM S.A. (capacitación con simulador SIN en tiempo real), Enel Colombia (validación con datos reales de red de distribución). Impacto: primera infraestructura IEC 61850 en centro SENA del país.",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "Proyecto",
      Programa: "Modernización de Ambientes / I+D+i SENNOVA",
      Aliado: "XM S.A. / Enel Colombia",
    },
  });

  // ── D2 / L4: Alianzas ────────────────────────────────────────────────────

  // Tabla 9: "Enel Colombia (Enel-Codensa / Enel Green Power)"
  // "Convenio de pasantías y transferencia tecnológica: etapas productivas de aprendices en centros
  //  de operación y proyectos AMI de Enel."
  items.push({
    id: "d2-l4-enel-colombia",
    layer: "L4",
    driver: "D2",
    horizon: "corto", // Tabla 9: Enel Colombia — operador local activo; alianza inmediata viable
    title: "Enel Colombia (Enel-Codensa / Enel Green Power)",
    detail:
      "Líder en despliegue de AMI en Colombia (>1M medidores en Bogotá-Cundinamarca). Enel Green Power opera parques solares y eólicos en La Guajira. Tipo de alianza sugerida: convenio de pasantías y transferencia tecnológica — etapas productivas en centros de operación AMI, mentorías de ingenieros Enel, visitas técnicas a subestaciones automatizadas y centros de control SCADA/DMS.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "Alianza",
      Aliado: "Enel Colombia",
      "Tipo de aliado": "Empresa",
      País: "Italia / Colombia",
    },
  });

  // Tabla 9: "XM S.A. (Operador del Sistema Interconectado Nacional)"
  // "Convenio de formación especializada: módulos de capacitación en operación del SIN con simulador XM."
  items.push({
    id: "d2-l4-xm",
    layer: "L4",
    driver: "D2",
    horizon: "corto", // Tabla 9: XM S.A. Colombia — alianza local de alto valor, formalizable pronto
    title: "XM S.A. (Operador del SIN)",
    detail:
      "Operador del mercado eléctrico mayorista y del Sistema Interconectado Nacional (SIN). Ofrece capacitación a la medida con simulador en tiempo real del SIN (4 módulos: control de frecuencia, gestión de tensión, maniobra de equipos, recuperación del sistema). Tipo de alianza sugerida: convenio de formación especializada para aprendices tecnólogos.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "Alianza",
      Aliado: "XM S.A.",
      "Tipo de aliado": "Actor ecosistema",
      País: "Colombia",
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // D3: Flexibilidad de Red con Nuevos Modelos Operativos
  // L2/L3/L4 — fuente: GOR Tablas 8, 9, 10, 11
  // ─────────────────────────────────────────────────────────────────────────

  // ── D3 / L2: Infraestructura ─────────────────────────────────────────────

  // Tabla 11, fila 6: Monitoreo IoT de Activos de Red — Brecha Crítica
  // Tabla 8: "Kits IoT y Sensorización de Red — Sensores de corriente/tensión (CT/PT IoT-enabled),
  //   monitores de línea tipo Sentient Energy, gateway LoRaWAN + nodos, plataforma IoT (ThingsBoard)." — P2
  // JUICIO: el kit IoT es infraestructura transversal D2/D3; se registra en D3 porque D3 cubre
  //   respuesta a la demanda y flexibilidad que depende de sensorización IoT en tiempo real.
  items.push({
    id: "d3-l2-kit-iot-sensorizacion-red",
    layer: "L2",
    driver: "D3",
    horizon: "corto", // Tabla 1: "Alto impacto / Bajo esfuerzo. Horizonte: 6-12 meses." (Quick Win)
    title: "Kits IoT para sensorización de red: CT/PT + gateway LoRaWAN + ThingsBoard + Grafana",
    detail:
      "Adquirir kits de sensores industriales para redes de distribución: sensores de corriente/tensión (CT/PT IoT-enabled), monitores de línea tipo Sentient Energy MM3, gateway LoRaWAN + nodos sensores (temperatura, humedad, vibración). Instalar plataforma IoT ThingsBoard o AWS IoT Core educativo y dashboards Grafana para visualización en tiempo real.",
    gap: "Crítica", // Tabla 11 fila 6: brecha Crítica — sin laboratorio IoT industrial
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: {
      Tipo: "Ambiente",
      Prioridad: "P2",
      Línea: "L10/L11/L12",
    },
  });

  // Tabla 11, fila 11: Respuesta a la Demanda con Integración DER
  // "Servidor OpenADR 2.0 de pruebas. Simulador de mercado de flexibilidad con cargas programables."
  items.push({
    id: "d3-l2-servidor-openadr",
    layer: "L2",
    driver: "D3",
    horizon: "medio1", // Tabla 11 fila 11: Alta — implementación 6-24 meses; depende de microrred e IoT
    title: "Servidor OpenADR 2.0 de pruebas + simulador de mercado de flexibilidad con cargas programables",
    detail:
      "Instalar servidor OpenADR 2.0 de pruebas (open-source). Crear simulador de mercado de flexibilidad con cargas programables. Integración con la microrred didáctica (D1) y plataforma VPP. Dependencia: requiere infraestructura de microrred (D1-L2) e IoT (D3-L2) implementados previamente.",
    gap: "Alta", // Tabla 11 fila 11: brecha Alta — sin infraestructura OpenADR ni mercados de flexibilidad
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "Ambiente",
      Prioridad: "P2",
      Línea: "L12",
    },
  });

  // ── D3 / L3: Talento & I+D+i ─────────────────────────────────────────────

  // Tabla 8: "Tecnólogo Supervisión de Redes de Distribución — Actualización Curricular —
  //   Incluir módulo de modelamiento de red en software de gemelo digital." — Alta (P1)
  items.push({
    id: "d3-l3-actualizacion-supervision-redes",
    layer: "L3",
    driver: "D3",
    horizon: "corto", // Tabla 8: Alta (P1) = 0-12 meses
    title: "Actualización curricular: Tecnólogo Supervisión de Redes (modelamiento GIS + gemelo digital + SCADA histórico)",
    detail:
      "Incluir módulo de modelamiento de red en software de gemelo digital. Prácticas en creación de modelos de red a partir de datos GIS, simulación de escenarios de contingencia, y validación con datos SCADA históricos.",
    gap: "Alta", // Tabla 11 fila 8: brecha Alta — sin modelamiento ni herramientas computacionales de simulación
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "Talento", Prioridad: "P1" },
  });

  // Tabla 10 D3: "Investigación aplicada en agregación de DER y respuesta a la demanda"
  //   Tipo: I+D+i aplicada SENNOVA.
  //   Aliado: Universidad Nacional de Colombia (Grupo PAAS-UN).
  items.push({
    id: "d3-l3-proyecto-vpp-sennova",
    layer: "L3",
    driver: "D3",
    horizon: "medio1", // Tabla 10 D3: proyecto I+D+i SENNOVA — ciclo 12-18 meses
    title: "Proyecto I+D+i SENNOVA: plataforma VPP y respuesta a la demanda con DER",
    detail:
      "I+D+i aplicada SENNOVA: desarrollar prototipo funcional de plataforma de agregación de DER (Virtual Power Plant) que integre la microrred didáctica del centro (D1), cargas controlables del laboratorio, y un simulador de punto de carga EV con protocolo OCPP 2.0.1, para demostrar viabilidad técnica de respuesta a la demanda con DER en el contexto regulatorio colombiano. Aliado potencial: Universidad Nacional de Colombia (Grupo PAAS-UN, co-investigación en DER y mercados).",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "Proyecto",
      Programa: "I+D+i aplicada SENNOVA",
      Aliado: "Universidad Nacional de Colombia (PAAS-UN)",
    },
  });

  // Tabla 11, fila 11: formación para respuesta a la demanda
  // "Módulo teórico-práctico de 60 h sobre DR, agregación DER y mercados de flexibilidad."
  items.push({
    id: "d3-l3-modulo-dr-agregacion-der",
    layer: "L3",
    driver: "D3",
    horizon: "medio1", // Tabla 11 fila 11: Alta acción 6-24 meses
    title: "Módulo teórico-práctico (60 h): Respuesta a la Demanda, agregación DER y mercados de flexibilidad",
    detail:
      "Crear módulo de 60 horas sobre mercados de flexibilidad, agregación DER y participación en mercados de energía. Integrar con microrred didáctica como recurso controlable. Contenido: OpenADR 2.0, CREG mercados de flexibilidad, señales de precio TOU, VPP. Dependencia: requiere infraestructura IoT y microrred implementados previamente.",
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: { Tipo: "Talento", Prioridad: "P2", Línea: "L12" },
  });

  // ── D3 / L4: Alianzas ────────────────────────────────────────────────────

  // Tabla 9: Universidad Nacional de Colombia — aliada en D3 para I+D DER/mercados
  // JUICIO: la UNAL tiene rol dual (D1 y D3); en D3 el vínculo es el Grupo PAAS-UN en DER/mercados eléctricos.
  items.push({
    id: "d3-l4-unal-paas",
    layer: "L4",
    driver: "D3",
    horizon: "medio1", // Tabla 9: convenio interinstitucional — formalización 6-12 meses
    title: "Universidad Nacional de Colombia (Grupo PAAS-UN — DER y mercados eléctricos)",
    detail:
      "Grupo PAAS-UN: investigación en sistemas eléctricos de potencia, calidad de energía y smart grids. Capacidad de co-investigación en VPP, DERMS y gobernanza de datos energéticos. Tipo de alianza sugerida: co-investigación SENNOVA en DER y mercados de flexibilidad.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "Alianza",
      Aliado: "Universidad Nacional de Colombia (PAAS-UN)",
      "Tipo de aliado": "Universidad",
      País: "Colombia",
    },
  });

  // Tabla 9: XM S.A. — actor clave en mercados de flexibilidad D3
  items.push({
    id: "d3-l4-xm-mercados",
    layer: "L4",
    driver: "D3",
    horizon: "corto", // XM S.A. Colombia — relación directa con mercados eléctricos; alianza inmediata
    title: "XM S.A. (Operador del SIN — mercados de flexibilidad y DER)",
    detail:
      "XM S.A. está desarrollando esquemas de flexibilidad y agregación DER para el mercado eléctrico colombiano. Tipo de alianza sugerida: validación de escenarios de respuesta a la demanda con datos reales del SIN; co-diseño de contenidos sobre mercados de flexibilidad.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "Alianza",
      Aliado: "XM S.A.",
      "Tipo de aliado": "Actor ecosistema",
      País: "Colombia",
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // D4: Electrificación Digital Descentralizada con Gobernanza de Datos
  // L2/L3/L4 — fuente: GOR Tablas 8, 9, 10, 11
  // ─────────────────────────────────────────────────────────────────────────

  // ── D4 / L2: Infraestructura ─────────────────────────────────────────────

  // Tabla 11, fila 7: Gestión Energética Inteligente con IA (BEMS) — Brecha Crítica
  // "Incluir Python para análisis de datos energéticos en programa 821207. Jupyter + scikit-learn + TF."
  // JUICIO: el laboratorio de simulación computacional (ML/analítica) es la infraestructura de D4.
  items.push({
    id: "d4-l2-laboratorio-simulacion-ml",
    layer: "L2",
    driver: "D4",
    horizon: "corto", // Tabla 11 fila 7: Crítica — "instalar Python + Jupyter + scikit-learn (costo cero en software)"
    title: "Laboratorio de simulación computacional: Python + Jupyter + scikit-learn + TensorFlow (mín. 15 estaciones)",
    detail:
      "Instalar Python + Jupyter Notebooks + scikit-learn + TensorFlow en laboratorio de simulación (costo cero en software). Usar datasets públicos de consumo energético para prácticas (UCI ML Repository, Kaggle Energy). Mínimo 15 estaciones con capacidad para modelos de predicción de demanda (LSTM, Random Forest). Complemento: licencias académicas DIgSILENT PowerFactory o ETAP para modelamiento de red.",
    gap: "Crítica", // Tabla 11 fila 7: brecha Crítica — sin estaciones dedicadas a analítica ni software ML
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "Ambiente",
      Prioridad: "P1",
      Línea: "L15/L09",
    },
  });

  // Tabla 11, fila 8: Gemelo Digital de Red de Distribución — Brecha Alta
  // "Laboratorio de simulación computacional: mín. 15 estaciones con GPU. Licencias académicas DIgSILENT."
  items.push({
    id: "d4-l2-licencias-digsilent-powerfactory",
    layer: "L2",
    driver: "D4",
    horizon: "medio1", // Tabla 11 fila 8: Alta — "fase exploratoria inmediata" + licencias académicas
    title: "Licencias académicas DIgSILENT PowerFactory + GridLAB-D/OpenDSS para gemelo digital de red",
    detail:
      "Adquirir licencias académicas DIgSILENT PowerFactory o ETAP para estaciones del laboratorio de simulación. Instalar GridLAB-D/OpenDSS (open-source). Módulo de 120 h en modelamiento de red y simulación de escenarios. Datos GIS y SCADA históricos para validación (convenio con operador de red). Fase exploratoria: conceptualización de gemelos digitales.",
    gap: "Alta", // Tabla 11 fila 8: brecha Alta — sin licencias de simulación ni software de modelamiento
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "Ambiente",
      Prioridad: "P2",
      Línea: "L09",
    },
  });

  // ── D4 / L3: Talento & I+D+i ─────────────────────────────────────────────

  // Tabla 10 D4: "Curso complementario en analítica de datos energéticos y fundamentos de gemelo digital"
  //   Tipo: Educación continuada / Curso complementario.
  //   Aliado: Universidad Industrial de Santander (UIS).
  items.push({
    id: "d4-l3-curso-analitica-gemelo-digital",
    layer: "L3",
    driver: "D4",
    horizon: "medio1", // Tabla 10 D4: curso complementario — diseño + implementación 6-18 meses
    title: "Curso complementario: analítica de datos energéticos y fundamentos de gemelo digital de red (120 h)",
    detail:
      "Diseñar e impartir curso de 120 h en analítica de datos energéticos y fundamentos de gemelo digital de red. Cuatro módulos: (1) Python para el sector eléctrico — pandas, numpy, datos SCADA/AMI; (2) ML aplicado a redes — predicción demanda LSTM/Random Forest, detección anomalías en transformadores; (3) Mantenimiento predictivo de activos — sensores IoT, modelos de degradación; (4) Introducción al gemelo digital de red — DIgSILENT PowerFactory, escenarios de contingencia. Aliado potencial: Universidad Industrial de Santander (UIS). Impacto: ingresos por educación continuada.",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "Proyecto",
      Programa: "Educación continuada / Curso complementario",
      Aliado: "Universidad Industrial de Santander (UIS)",
    },
  });

  // Tabla 11, fila 9: Mantenimiento Predictivo con ML — Brecha Alta
  // "Vincular con proyecto IoT (variable #6) — mismos sensores sirven para mantenimiento predictivo."
  items.push({
    id: "d4-l3-modulo-mantenimiento-predictivo",
    layer: "L3",
    driver: "D4",
    horizon: "medio1", // Tabla 11 fila 9: Alta — depende de IoT (#6) y Python/ML (#7) implementados
    title: "Módulo: mantenimiento predictivo de activos con ML (datos de sensores IoT + Grafana + Python)",
    detail:
      "Crear módulo complementario de análisis de datos de activos para mantenimiento predictivo: sensores IoT de monitoreo de transformadores (temperatura, gases disueltos, vibración), plataforma de análisis Python + dashboards Grafana, modelos ML de degradación (Random Forest, SVM). Usar datasets públicos de fallas en transformadores (IEEE PES). Dependencia: requiere IoT (D3-L2) y Python/ML (D4-L2) implementados previamente.",
    gap: "Alta", // Tabla 11 fila 9: brecha Alta — sin sensores de monitoreo continuo ni software predictivo
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: { Tipo: "Talento", Prioridad: "P2", Línea: "L09" },
  });

  // Tabla 8: "Tecnólogo Gestión Eficiente de la Energía — Actualización Curricular —
  //   Evolucionar hacia BEMS con IA: algoritmos de predicción de demanda, optimización tarifaria TOU." (P1)
  // JUICIO: el aspecto BEMS/ML del programa 821207 se registra en D4 (electrificación digital).
  items.push({
    id: "d4-l3-capacitacion-bems-ia",
    layer: "L3",
    driver: "D4",
    horizon: "corto", // Tabla 8: Alta (P1) = 0-12 meses; Python puede instalarse de inmediato
    title: "Formación a instructores: BEMS con IA y Python para análisis de datos energéticos (Schneider / Siemens SITRAIN)",
    detail:
      "Capacitar instructores en BEMS con algoritmos predictivos (LSTM, Random Forest), optimización tarifaria TOU, integración de DER solar + BESS, plataformas de gestión energética. Programas disponibles en Schneider EcoStruxure Building y Siemens SITRAIN. Instalar Jupyter Notebooks + scikit-learn para prácticas inmediatas con datasets públicos.",
    gap: "Crítica", // Tabla 11 fila 7: brecha Crítica — instructores sin formación en Python ni ML
    source: `${FUENTE_GOR}, Tabla 8`,
    meta: { Tipo: "Talento", Prioridad: "P1" },
  });

  // ── D4 / L4: Alianzas ────────────────────────────────────────────────────

  // Tabla 9: Universidad Industrial de Santander (UIS) — Grupo GISEL
  // "Diplomados conjuntos en smart grids para instructores SENA. Co-formulación ante Minciencias."
  items.push({
    id: "d4-l4-uis-gisel",
    layer: "L4",
    driver: "D4",
    horizon: "medio1", // Tabla 9: convenio interinstitucional — formalización 6-12 meses
    title: "Universidad Industrial de Santander (UIS) — Grupo GISEL (categoría A Minciencias)",
    detail:
      "GISEL es grupo A de Minciencias especializado en mercados eléctricos, confiabilidad, calidad de potencia y alta tensión. Tipo de alianza sugerida: diplomados conjuntos en smart grids para instructores SENA, uso compartido de laboratorios de alta tensión y sistemas de potencia, co-formulación de proyectos ante Minciencias (convocatorias CTeI).",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "Alianza",
      Aliado: "Universidad Industrial de Santander (UIS)",
      "Tipo de aliado": "Universidad",
      País: "Colombia",
    },
  });

  // Tabla 9: Siemens Energy (SITRAIN / Power Academy) — Fabricante con programa educativo
  // "Convenio de formación SITRAIN: capacitación de instructores SENA en protección y automatización."
  items.push({
    id: "d4-l4-siemens-energy",
    layer: "L4",
    driver: "D4",
    horizon: "medio1", // Tabla 9: convenio formación SITRAIN — 6-12 meses para formalización
    title: "Siemens Energy (SITRAIN / Power Academy / Grid Software University)",
    detail:
      "Portafolio integral en generación, transmisión y distribución. SITRAIN ofrece formación en automatización industrial, protección de redes y smart infrastructure. Power Academy permite cursos personalizados en gestión de red y software de simulación. Grid Software University capacita en plataformas de gemelo digital de red. Tipo de alianza sugerida: convenio de formación SITRAIN para instructores SENA.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "Alianza",
      Aliado: "Siemens Energy",
      "Tipo de aliado": "Fabricante",
      País: "Alemania / Colombia",
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // D5: Ecosistema Normativo
  // L2/L3/L4 — fuente: GOR Tablas 8, 9, 10, 11
  // ─────────────────────────────────────────────────────────────────────────

  // ── D5 / L2: Infraestructura ─────────────────────────────────────────────

  // Tabla 11, fila 10: Ciberseguridad OT para Redes Eléctricas — Brecha Alta
  // "Laboratorio de ciberseguridad OT: red segmentada con firewall industrial, switch gestionable, IDS/IPS."
  items.push({
    id: "d5-l2-laboratorio-ciberseguridad-ot",
    layer: "L2",
    driver: "D5",
    horizon: "medio1", // Tabla 1: "Medio impacto / Medio esfuerzo" — Cuadrante 3; Tabla 11: acción 6-24m
    title: "Laboratorio de ciberseguridad OT: red segmentada + firewall industrial + IDS (Security Onion, Wireshark)",
    detail:
      "Crear laboratorio básico de ciberseguridad OT: red segmentada con firewall industrial + switch gestionable + IDS/IPS para protocolos industriales + servidor Security Onion/Splunk. Entorno sandbox con PLCs/RTUs virtualizados. Herramientas: Security Onion, Wireshark con disectores DNP3/Modbus. Sin infraestructura de ciberseguridad actualmente en el CEET.",
    gap: "Alta", // Tabla 11 fila 10: brecha Alta — ciberseguridad OT sin laboratorio ni instructores
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "Ambiente",
      Prioridad: "P2",
      Línea: "L18",
    },
  });

  // Tabla 11, fila 12: Gobernanza de Datos y Privacidad Energética — Brecha Alta
  // "No requiere inversión en infraestructura física — módulo transversal formativo."
  // JUICIO: se registra como ítem de infraestructura formativa (entorno conceptual/normativo).
  items.push({
    id: "d5-l2-modulo-gobernanza-datos-energeticos",
    layer: "L2",
    driver: "D5",
    horizon: "corto", // Tabla 11 fila 12: "No requiere inversión en infraestructura física" — implementable de inmediato
    title: "Módulo transversal: gobernanza de datos energéticos y privacidad (sin inversión en infraestructura)",
    detail:
      "Módulo transversal de gobernanza de datos energéticos aplicable a todos los programas. Contenido: Ley 1581/2012 aplicada a datos AMI, privacidad por diseño para smart grids, conceptos de EU AI Act para IA en infraestructura crítica, marco de cumplimiento IEC 62443 + gobernanza de datos. No requiere inversión en infraestructura física. Nula formación en gobernanza digital actualmente.",
    gap: "Alta", // Tabla 11 fila 12: brecha Alta — ningún programa aborda gobernanza de datos energéticos
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "Ambiente",
      Prioridad: "P2",
      Línea: "L18",
    },
  });

  // ── D5 / L3: Talento & I+D+i ─────────────────────────────────────────────

  // Tabla 10 D5: "Diseño de un marco de gobernanza de datos y ciberseguridad OT para ambientes de aprendizaje"
  //   Tipo: I+D+i aplicada SENNOVA.
  //   Aliado: CIDET + Universidad Nacional de Colombia.
  items.push({
    id: "d5-l3-proyecto-gobernanza-ciberseguridad-ot",
    layer: "L3",
    driver: "D5",
    horizon: "medio2", // Tabla 10 D5: proyecto complejo — marco regulatorio + ciberseguridad; horizonte 3-5 años
    title: "Proyecto I+D+i SENNOVA: marco de gobernanza de datos y ciberseguridad OT para laboratorios smart grid",
    detail:
      "Diseñar, documentar e implementar un marco integral de gobernanza de datos y ciberseguridad OT para los ambientes de aprendizaje del centro (laboratorio IEC 61850, microrred didáctica, SCADA/DMS), que sirva como: (i) infraestructura de protección real de los equipos, (ii) ambiente de prácticas en ciberseguridad industrial, y (iii) modelo de referencia replicable en la red SENA. Aliado potencial: CIDET (consultoría RETIE/normativa eléctrica), Universidad Nacional de Colombia (análisis regulatorio interdisciplinario).",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "Proyecto",
      Programa: "I+D+i aplicada SENNOVA",
      Aliado: "CIDET / Universidad Nacional de Colombia",
    },
  });

  // Tabla 11, fila 10: Ciberseguridad OT — formación
  // "Fundamentos IEC 62443, hardening de SCADA, análisis de tráfico industrial."
  items.push({
    id: "d5-l3-capacitacion-ciberseguridad-ot",
    layer: "L3",
    driver: "D5",
    horizon: "medio1", // JUICIO: IEC 62443 requiere capacitación especializada; 6-18 meses
    title: "Formación a instructores: ciberseguridad OT (IEC 62443, hardening SCADA, Cisco Networking Academy)",
    detail:
      "Capacitar instructores en fundamentos IEC 62443, hardening de dispositivos SCADA, análisis de tráfico industrial (protocolos DNP3/Modbus). Certificaciones: Cisco CyberOps Associate, Cisco Networking Academy. Perfil híbrido IT/OT — ningún instructor actual tiene este perfil en el CEET.",
    gap: "Alta", // Tabla 11 fila 10: brecha Alta — sin instructores perfil híbrido IT/OT
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: { Tipo: "Talento", Prioridad: "P2" },
  });

  // Tabla 11, fila 12: Gobernanza de Datos — formación transversal
  // "Invitar experto de UNAL (Fac. Derecho + Ingeniería) para co-diseño de contenidos."
  // "Participación en GT de CIGRÉ Colombia sobre transformación digital."
  items.push({
    id: "d5-l3-capacitacion-gobernanza-datos",
    layer: "L3",
    driver: "D5",
    horizon: "corto", // Tabla 11 fila 12: "No requiere inversión física" — implementable 0-12 meses con expertos externos
    title: "Formación a instructores: gobernanza de datos energéticos y regulación IA (UNAL / CIGRÉ Colombia)",
    detail:
      "Co-diseño de contenidos con expertos de UNAL (Facultad de Derecho + Ingeniería) para módulo de gobernanza digital. Seguimiento del desarrollo regulatorio colombiano sobre IA. Participación en grupos de trabajo CIGRÉ Colombia sobre transformación digital. Fundamentos: Ley 1581/2012 aplicada a datos AMI, EU AI Act (Reg. 2024/1689), ISO/IEC 42001.",
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: { Tipo: "Talento", Prioridad: "P2" },
  });

  // ── D5 / L4: Alianzas ────────────────────────────────────────────────────

  // Tabla 9: CIDET (Centro de Investigación y Desarrollo Tecnológico del Sector Eléctrico)
  // "Alianza de certificación y actualización normativa: certificación de competencias RETIE/RETILAP."
  items.push({
    id: "d5-l4-cidet",
    layer: "L4",
    driver: "D5",
    horizon: "corto", // Tabla 9: CIDET Colombia — actor local; alianza inmediata viable
    title: "CIDET (Centro de Investigación y Desarrollo Tecnológico del Sector Eléctrico)",
    detail:
      "Centro de I+D+i del sector eléctrico colombiano, reconocido por Minciencias como Centro de Innovación y Productividad. Laboratorios acreditados ONAC para ensayos RETIE, iluminación y compatibilidad electromagnética. Tipo de alianza sugerida: certificación de competencias RETIE/RETILAP para aprendices, consultoría en cumplimiento normativo, actualización anual en normativa eléctrica.",
    source: `${FUENTE_GOR}, Tabla 9`,
    meta: {
      Tipo: "Alianza",
      Aliado: "CIDET",
      "Tipo de aliado": "Actor ecosistema",
      País: "Colombia (Medellín)",
    },
  });

  // Tabla 9 / Tabla 10 D5: Universidad Nacional de Colombia — co-diseño regulatorio
  // "Invitar experto de UNAL (Fac. Derecho + Ingeniería) para co-diseño de contenidos."
  items.push({
    id: "d5-l4-unal-regulatorio",
    layer: "L4",
    driver: "D5",
    horizon: "medio1", // JUICIO: convenio académico interdisciplinario — 6-12 meses para formalización
    title: "Universidad Nacional de Colombia (Fac. Derecho + Ingeniería — análisis regulatorio interdisciplinario)",
    detail:
      "Colaboración interdisciplinaria UNAL para análisis regulatorio del EU AI Act, Ley 1581/2012 aplicada a smart grids e ISO/IEC 42001 en infraestructuras críticas eléctricas. Tipo de alianza sugerida: co-diseño de contenidos curriculares en gobernanza de datos y ética de IA, asesoría en marcos de cumplimiento.",
    source: `${FUENTE_GOR}, Tabla 10`,
    meta: {
      Tipo: "Alianza",
      Aliado: "Universidad Nacional de Colombia",
      "Tipo de aliado": "Universidad",
      País: "Colombia",
    },
  });

  // Tabla 11 fila 12: "Participación en GT de CIGRÉ Colombia sobre transformación digital."
  // JUICIO: CIGRÉ Colombia es mención explícita en el GOR; se registra como aliado D5.
  items.push({
    id: "d5-l4-cigre-colombia",
    layer: "L4",
    driver: "D5",
    horizon: "medio1", // JUICIO: participación en GT requiere membresía y coordinación — 6-12 meses
    title: "CIGRÉ Colombia (Grupo de Trabajo sobre Transformación Digital)",
    detail:
      "Consejo Internacional de Grandes Redes Eléctricas — Capítulo Colombia. Grupo de Trabajo sobre transformación digital y gobernanza de IA en infraestructura energética crítica. Tipo de alianza sugerida: participación activa en grupos de trabajo, acceso a normativa técnica internacional y publicaciones de CIGRÉ.",
    source: `${FUENTE_GOR}, Tabla 11`,
    meta: {
      Tipo: "Alianza",
      Aliado: "CIGRÉ Colombia",
      "Tipo de aliado": "Consorcio",
      País: "Colombia / Global",
    },
  });

  return { items };
}
