import { Ring, Sector, Technology } from "@/types/radar";

// ═══════════════════════════════════════════════════════════════
// RING CONFIGURATION — matches PNG radar exactly
// ═══════════════════════════════════════════════════════════════
export const RINGS: Ring[] = [
  {
    id: "adopt",
    label: "ADOPTAR",
    radius: 110,
    color: "#2E7D32",
    fillColor: "#C8E6C9",
    borderColor: "#81C784",
    labelColor: "#2E7D32",
    desc: "Implementación inmediata",
    trl: "TRL 7-9",
  },
  {
    id: "trial",
    label: "PROBAR",
    radius: 210,
    color: "#558B2F",
    fillColor: "#E1F0C4",
    borderColor: "#AED581",
    labelColor: "#688C36",
    desc: "Pilotos y capacitación",
    trl: "TRL 7-8",
  },
  {
    id: "assess",
    label: "EVALUAR",
    radius: 305,
    color: "#F9A825",
    fillColor: "#FFF3CD",
    borderColor: "#FFD54F",
    labelColor: "#B48C14",
    desc: "Investigación / formación",
    trl: "TRL 6-7",
  },
  {
    id: "monitor",
    label: "MONITOREAR",
    radius: 400,
    color: "#E64A19",
    fillColor: "#FFE0D2",
    borderColor: "#FFAB91",
    labelColor: "#BE643C",
    desc: "Seguimiento largo plazo",
    trl: "TRL 1-3",
  },
];

// ═══════════════════════════════════════════════════════════════
// SECTOR CONFIGURATION (5 Drivers / Direccionadores)
// Each sector spans 72° (360 / 5)
// ═══════════════════════════════════════════════════════════════
export const SECTOR_ANGLE = 72;

export const SECTORS: Sector[] = [
  {
    id: "D1",
    label: "Transición Energética Hacia Sistemas Sostenibles",
    shortLabel: "D1: Transición Energética Hacia Sistemas Sostenibles",
    labelLines: ["D1: Transición Energética", "Hacia Sistemas Sostenibles"],
    startAngle: -18,
    color: "#1565C0",
    bgLight: "#E3F2FD",
    bgDark: "rgba(21,101,192,0.12)",
    icon: "⚡",
  },
  {
    id: "D2",
    label: "Automatización de Redes Hacia la Transición Digital",
    shortLabel: "D2: Automatización de Redes Hacia la Transición Digital",
    labelLines: ["D2: Automatización de Redes", "Hacia la Transición Digital"],
    startAngle: 54,
    color: "#C62828",
    bgLight: "#FFEBEE",
    bgDark: "rgba(198,40,40,0.12)",
    icon: "🔌",
  },
  {
    id: "D3",
    label: "Flexibilidad de Red con Nuevos Modelos Operativos",
    shortLabel: "D3: Flexibilidad de Red con Nuevos Modelos Operativos",
    labelLines: ["D3: Flexibilidad de Red", "con Nuevos Modelos Operativos"],
    startAngle: 126,
    color: "#F57F17",
    bgLight: "#FFF3E0",
    bgDark: "rgba(245,127,23,0.12)",
    icon: "🔋",
  },
  {
    id: "D4",
    label: "Electrificación Digital Descentralizada con Gobernanza de Datos",
    shortLabel: "D4: Electrificación Digital Descentralizada con Gobernanza de Datos",
    labelLines: ["D4: Electrificación Digital", "Descentralizada con Gobernanza"],
    startAngle: 198,
    color: "#6A1B9A",
    bgLight: "#F3E5F5",
    bgDark: "rgba(106,27,154,0.12)",
    icon: "🏠",
  },
  {
    id: "D5",
    label: "Ecosistema Normativo",
    shortLabel: "D5: Ecosistema Normativo",
    labelLines: ["D5: Ecosistema Normativo", ""],
    startAngle: 270,
    color: "#00695C",
    bgLight: "#E0F2F1",
    bgDark: "rgba(0,105,92,0.12)",
    icon: "📜",
  },
];

// ═══════════════════════════════════════════════════════════════
// TECHNOLOGIES (18 items)
// ring: 0=ADOPTAR, 1=PROBAR, 2=EVALUAR, 3=MONITOREAR
// sector: 0..4 = D1..D5
// angleOff: offset from sector center in degrees
// ═══════════════════════════════════════════════════════════════
export const TECHNOLOGIES: Technology[] = [
  // ── D1: Transición Energética Hacia Sistemas Sostenibles ──
  {
    id: "T01",
    name: "Microrredes Inteligentes (Microgrids)",
    nameLines: ["Microrredes Inteligentes", "(Microgrids)"],
    code: "L01",
    sector: 0,
    ring: 1,
    angleOff: -8,
    trl: 8,
    desc: "Redes eléctricas locales con generación distribuida, almacenamiento y control inteligente que operan de forma autónoma o conectadas a la red principal.",
    impact: "Alto",
    horizon: "Corto (1-3 años)",
  },
  {
    id: "T02",
    name: "Sistemas de Almacenamiento de Energía (BESS)",
    nameLines: ["Sistemas de Almacenamiento", "de Energía (BESS)"],
    code: "L02",
    sector: 0,
    ring: 0,
    angleOff: 0,
    labelAbove: true,
    trl: 9,
    desc: "Baterías y sistemas de almacenamiento a gran escala para estabilización de red, gestión de picos de demanda e integración de renovables.",
    impact: "Alto",
    horizon: "Corto (1-3 años)",
  },
  {
    id: "T03",
    name: "Integración de Recursos Energéticos Distribuidos (DER)",
    nameLines: ["Integración de Recursos", "Energéticos Distribuidos (DER)"],
    code: "L03",
    sector: 0,
    ring: 1,
    angleOff: 8,
    trl: 8,
    desc: "Gestión coordinada de generación distribuida (solar, eólica, cogeneración) conectada a la red de distribución eléctrica.",
    impact: "Disruptivo",
    horizon: "Corto-mediano (2025-2030)",
  },
  {
    id: "T04",
    name: "Generación de Energía Comunitaria",
    nameLines: ["Generación de Energía", "Comunitaria"],
    code: "L04",
    sector: 0,
    ring: 1,
    angleOff: -24,
    labelAbove: true,
    trl: 7,
    desc: "Proyectos de energía renovable gestionados por comunidades locales para autoconsumo y venta de excedentes a la red.",
    impact: "Social Alto",
    horizon: "Medio (2-5 años)",
  },
  {
    id: "T05",
    name: "Sistemas Híbridos de Generación",
    nameLines: ["Sistemas Híbridos", "de Generación"],
    code: "L05",
    sector: 0,
    ring: 1,
    angleOff: 24,
    trl: 8,
    desc: "Combinación de múltiples fuentes de generación (solar + eólica + diesel/biogás) con almacenamiento para suministro confiable.",
    impact: "Alto",
    horizon: "Corto (1-3 años)",
  },

  // ── D2: Automatización de Redes Hacia la Transición Digital ──
  {
    id: "T06",
    name: "Infraestructura de Medición Avanzada (AMI)",
    nameLines: ["Infraestructura de Medición", "Avanzada (AMI)"],
    code: "L06",
    sector: 1,
    ring: 0,
    angleOff: -20,
    labelAbove: true,
    trl: 9,
    desc: "Red de medidores inteligentes con comunicación bidireccional para lectura remota, facturación dinámica y detección de fallas.",
    impact: "Alto",
    horizon: "Corto (1-3 años)",
  },
  {
    id: "T07",
    name: "Sistemas SCADA y DMS Avanzados",
    nameLines: ["Sistemas SCADA y", "DMS Avanzados"],
    code: "L07",
    sector: 1,
    ring: 0,
    angleOff: 20,
    trl: 9,
    desc: "Sistemas de supervisión, control y adquisición de datos (SCADA) y gestión avanzada de distribución (DMS) para operación de redes eléctricas.",
    impact: "Alto",
    horizon: "Corto (1-3 años)",
  },
  {
    id: "T08",
    name: "Automatización y Autocuración (Self-healing)",
    nameLines: ["Automatización y", "Autocuración (Self-healing)"],
    code: "L08",
    sector: 1,
    ring: 1,
    angleOff: 0,
    trl: 8,
    desc: "Redes eléctricas con capacidad de detección, aislamiento y restauración automática de fallas sin intervención humana.",
    impact: "Alto",
    horizon: "Corto-mediano (2-5 años)",
  },
  {
    id: "T09",
    name: "Gemelos Digitales (Digital Twins)",
    nameLines: ["Gemelos Digitales", "(Digital Twins)"],
    code: "L09",
    sector: 1,
    ring: 2,
    angleOff: 0,
    trl: 6,
    desc: "Réplicas virtuales de infraestructura eléctrica para simulación, planificación predictiva, optimización y mantenimiento.",
    impact: "Alto",
    horizon: "Medio (2-5 años)",
  },

  // ── D3: Flexibilidad de Red con Nuevos Modelos Operativos ──
  {
    id: "T10",
    name: "Plantas de Energía Virtuales (VPP)",
    nameLines: ["Plantas de Energía", "Virtuales (VPP)"],
    code: "L10",
    sector: 2,
    ring: 1,
    angleOff: -12,
    trl: 8,
    desc: "Agregación de múltiples recursos energéticos distribuidos (generación, almacenamiento, demanda flexible) operados como una planta centralizada.",
    impact: "Muy Alto",
    horizon: "Corto (1-3 años)",
  },
  {
    id: "T11",
    name: "Sistemas de Gestión de Recursos Distribuidos (DERMS)",
    nameLines: ["Sistemas de Gestión de", "Recursos Distribuidos (DERMS)"],
    code: "L11",
    sector: 2,
    ring: 1,
    angleOff: 15,
    trl: 8,
    desc: "Plataforma de gestión y control de recursos energéticos distribuidos (DER) para optimización de red y servicios auxiliares.",
    impact: "Muy Alto",
    horizon: "Corto (1-3 años)",
  },
  {
    id: "T12",
    name: "Programas de Respuesta a la Demanda (Demand Response)",
    nameLines: ["Programas de Respuesta", "a la Demanda (DR)"],
    code: "L12",
    sector: 2,
    ring: 0,
    angleOff: 22,
    trl: 9,
    desc: "Mecanismos de incentivos para modificar el perfil de consumo eléctrico en respuesta a señales de precio o condiciones de red.",
    impact: "Alto",
    horizon: "Corto (1-3 años)",
  },

  // ── D4: Electrificación Digital Descentralizada con Gobernanza de Datos ──
  {
    id: "T13",
    name: "Tecnologías Vehículo-a-Red (V2G / V2X)",
    nameLines: ["Tecnologías Vehículo-a-Red", "(V2G / V2X)"],
    code: "L13",
    sector: 3,
    ring: 1,
    angleOff: -24,
    trl: 7,
    desc: "Bidireccionalidad energética entre vehículos eléctricos y la red eléctrica (V2G) o cargas locales (V2H/V2L) para almacenamiento móvil.",
    impact: "Crítico",
    horizon: "Corto-mediano (2025-2030)",
  },
  {
    id: "T14",
    name: "Infraestructura de Carga Inteligente",
    nameLines: ["Infraestructura de", "Carga Inteligente"],
    code: "L14",
    sector: 3,
    ring: 1,
    angleOff: 8,
    labelAbove: true,
    trl: 8,
    desc: "Estaciones de carga para vehículos eléctricos con gestión inteligente de potencia, integración con red y pagos digitales.",
    impact: "Alto",
    horizon: "Corto (1-3 años)",
  },
  {
    id: "T15",
    name: "Sistemas de Gestión de Energía en Edificios (BEMS)",
    nameLines: ["Sistemas de Gestión de", "Energía en Edificios (BEMS)"],
    code: "L15",
    sector: 3,
    ring: 1,
    angleOff: -8,
    trl: 8,
    desc: "Plataformas de gestión energética integrada para edificios comerciales e industriales: HVAC, iluminación, cargas y generación propia.",
    impact: "Alto",
    horizon: "Corto (1-3 años)",
  },
  {
    id: "T16",
    name: "Domótica y Hogares Inteligentes",
    nameLines: ["Domótica y", "Hogares Inteligentes"],
    code: "L16",
    sector: 3,
    ring: 0,
    angleOff: 0,
    trl: 9,
    desc: "Automatización residencial para gestión eficiente de energía, confort, seguridad y conectividad en el hogar.",
    impact: "Alto",
    horizon: "Corto (1-3 años)",
  },
  {
    id: "T17",
    name: "Monitoreo No Intrusivo de Cargas (NILM)",
    nameLines: ["Monitoreo No Intrusivo", "de Cargas (NILM)"],
    code: "L17",
    sector: 3,
    ring: 1,
    angleOff: 24,
    labelAbove: true,
    trl: 8,
    desc: "Técnica de desagregación de consumo eléctrico mediante análisis de señales en el punto de medición, sin sensores individuales por carga.",
    impact: "Medio",
    horizon: "Corto (1-3 años)",
  },

  // ── D5: Ecosistema Normativo ──
  {
    id: "T18",
    name: "Gobernanza y Privacidad de Datos",
    nameLines: ["Gobernanza y Privacidad", "de Datos"],
    code: "L18",
    sector: 4,
    ring: 2,
    angleOff: 0,
    trl: 7,
    desc: "Marcos regulatorios para la gestión, protección y uso ético de datos energéticos en entornos de medición avanzada y plataformas digitales.",
    impact: "Regulatorio",
    horizon: "Medio (2-5 años)",
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  return {
    x: round4(cx + r * Math.cos(toRad(angleDeg))),
    y: round4(cy + r * Math.sin(toRad(angleDeg))),
  };
}

export function getTechPosition(tech: Technology, cx: number, cy: number) {
  const sectorStart = SECTORS[tech.sector].startAngle;
  const sectorCenter = sectorStart + SECTOR_ANGLE / 2;
  const angleDeg = sectorCenter + tech.angleOff;
  let r: number;
  if (tech.ring === 0) r = RINGS[0].radius * 0.55;
  else if (tech.ring === 1) r = (RINGS[0].radius + RINGS[1].radius) / 2;
  else if (tech.ring === 2) r = (RINGS[1].radius + RINGS[2].radius) / 2;
  else r = (RINGS[2].radius + RINGS[3].radius) / 2;
  return {
    x: round4(cx + r * Math.cos(toRad(angleDeg))),
    y: round4(cy + r * Math.sin(toRad(angleDeg))),
  };
}

export function getTrlColor(trl: number): string {
  if (trl >= 7) return "#C62828";
  if (trl >= 5) return "#E65100";
  if (trl >= 3) return "#FDC300";
  return "#4FC3F7";
}

export function getTrlLabel(trl: number): string {
  if (trl >= 7) return "TRL 7-9 (Alto)";
  if (trl >= 5) return "TRL 5-6 (Medio)";
  if (trl >= 3) return "TRL 3-4 (Bajo)";
  return "TRL 1-2 (Inicial)";
}

// ═══════════════════════════════════════════════════════════════
// EXCLUDED TECHNOLOGIES (Not mapped on radar)
// ═══════════════════════════════════════════════════════════════
export const EXCLUDED_TECHNOLOGIES: Array<{
  code: string;
  name: string;
  sublines: string[];
  justification: string;
}> = [];
