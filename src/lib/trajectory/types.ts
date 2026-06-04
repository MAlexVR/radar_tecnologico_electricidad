/**
 * Motor genérico de trayectoria tecnológica.
 * Este módulo es data-agnóstico: NO importa ningún símbolo de dominio
 * (radar-data, ceet-telecom.json, next-intl, @/core, etc.).
 * Solo TypeScript puro + React types opcionales vía `import type`.
 */

import type { ReactNode } from "react";

// ── Horizon Buckets ──────────────────────────────────────────────────────────

/**
 * Columnas de tiempo en el grid del mapa de trayectoria.
 * El normalizador `normalizeHorizon` garantiza que cualquier string
 * de entrada produzca uno de estos valores (nunca undefined).
 */
export type HorizonBucket =
  | "ahora"
  | "corto"
  | "medio1"
  | "medio2"
  | "largo";

// ── Core Item ────────────────────────────────────────────────────────────────

/**
 * Unidad mínima de información en el mapa de trayectoria.
 * El motor no interpreta los valores de `layer`, `driver`, ni `gap` —
 * los trata como claves opacas y delega la semántica al `TrajectoryConfig`.
 */
export interface TrajectoryItem {
  /** Identificador único del ítem. */
  id: string;
  /** Clave de swimlane (p. ej. "L1", "L2"). Opaca para el motor. */
  layer: string;
  /** Clave de direccionador/driver (p. ej. "D1", "drvA"). Opaca para el motor. */
  driver: string;
  /** Horizonte normalizado. Siempre definido tras pasar por `normalizeHorizon`. */
  horizon: HorizonBucket;
  /** Título visible del nodo. */
  title: string;
  /** Descripción o detalle ampliado del ítem. */
  detail: string;
  /** Métrica opcional (p. ej. TRL, NPS). */
  metric?: { label: string; value: number | string };
  /** Estado de brecha / urgencia. El config decide cómo colorearlo. */
  gap?: string;
  /** IDs de otros ítems relacionados (para cross-linking futuro). */
  relatedIds?: string[];
  /** Trazabilidad institucional (fuente del dato). */
  source?: string;
  /** Datos de dominio adicionales sin tipado fuerte (kind, priority, etc.). */
  meta?: Record<string, unknown>;
}

// ── Config ───────────────────────────────────────────────────────────────────

/** Descriptor de una swimlane (capa/fila del grid). */
export interface TrajectoryLayer {
  /** Clave única. Debe coincidir con `TrajectoryItem.layer`. */
  key: string;
  /** Etiqueta legible para el usuario. */
  label: string;
  /** Orden de visualización (ascendente). */
  order: number;
  /** Icono opcional (nombre de Lucide u otro sistema). */
  icon?: string;
  /**
   * Color hex opcional para acentos visuales de la capa (borde, fondo tintado, swatch de leyenda).
   * El motor lo lee pero no lo impone — el adaptador de dominio lo provee.
   * Ejemplo: `"#3949AB"` (índigo para L1 Tecnologías).
   */
  color?: string;
}

/** Descriptor de una columna de horizonte. */
export interface TrajectoryHorizonBucket {
  /** Clave. Debe coincidir con `HorizonBucket`. */
  key: HorizonBucket;
  /** Etiqueta legible para el usuario. */
  label: string;
  /** Orden de visualización (ascendente). */
  order: number;
  /**
   * Color hex opcional para el encabezado de columna del horizonte.
   * Rampa de intensidad de un solo tono — el adaptador de dominio lo provee.
   * Ejemplo: `"#37474F"` (gris azulado intenso para el horizonte "ahora").
   */
  color?: string;
}

/**
 * Configuración completa del motor de trayectoria.
 * El adaptador de dominio instancia este objeto y lo pasa al motor.
 * El motor NUNCA lo crea ni lo modifica.
 */
export interface TrajectoryConfig {
  /**
   * Lista de drivers/direccionadores. Al menos uno requerido.
   * `color` es hex opcional para acentos visuales del selector de driver.
   * `icon` es el nombre/URL del icono del driver (Lucide u otro sistema).
   */
  drivers: { key: string; label: string; icon?: string; color?: string }[];
  /** Lista de swimlanes. Al menos una requerida. Sin claves duplicadas. */
  layers: TrajectoryLayer[];
  /** Lista de buckets de horizonte. Al menos uno requerido. Sin claves duplicadas. */
  horizonBuckets: TrajectoryHorizonBucket[];
  /**
   * Función pura que retorna el color de fondo de un nodo.
   * Recibe el ítem completo para permitir lógica de gap/urgencia.
   * @returns Clase CSS o valor de color.
   */
  colorFor: (item: TrajectoryItem) => string;
  /**
   * Función pura que retorna la etiqueta principal del nodo.
   * Por defecto: `item.title`.
   */
  labelFor: (item: TrajectoryItem) => string;
  /**
   * Función opcional que retorna el texto del badge de métrica.
   * Retorna `null` si el ítem no debe mostrar badge.
   */
  metricBadge?: (item: TrajectoryItem) => string | null;
  /**
   * Render-prop opcional para reemplazar el panel de detalle genérico
   * por uno específico de dominio (p. ej. TechDetail del radar para ítems L1).
   */
  detailRenderer?: (item: TrajectoryItem) => ReactNode;
}

// ── Dataset ──────────────────────────────────────────────────────────────────

/**
 * Conjunto de datos a visualizar. El adaptador de dominio lo construye;
 * el motor lo consume de forma read-only.
 */
export interface TrajectoryDataset {
  items: TrajectoryItem[];
}
