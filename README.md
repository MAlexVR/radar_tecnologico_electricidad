# Vigilancia Tecnológica CEET — Electricidad

![Version](https://img.shields.io/badge/versión-1.1.0-39A900?style=flat-square)
![SENA](https://img.shields.io/badge/SENA-CEET-39A900?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=flat-square&logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=flat-square&logo=vitest)

Plataforma de vigilancia científico-tecnológica del área de Electricidad del Centro de Electricidad, Electrónica y Telecomunicaciones (CEET — SENA). Integra el **Radar Tecnológico** (madurez y adopción de tecnologías) y el **Mapa de Trayectoria Tecnológica** (evolución de capacidades del centro en el tiempo), para el horizonte 2025-2035.

Grupo de Investigación, Innovación y Producción Académica — **GICS**

## Stack Tecnológico

- **Next.js 16+** con App Router y Turbopack
- **React 19.2** con Server Components
- **TypeScript 5.7** modo estricto
- **Tailwind CSS 4.2** con configuración CSS-based (`@theme`) — paleta institucional SENA
- **tw-animate-css** para animaciones de componentes Radix UI
- **shadcn/ui** (Radix UI + CVA) — Dialog, Tabs, Badge, Tooltip, ScrollArea
- **Lucide React 0.575** para iconografía
- **Work Sans** como fuente institucional (Google Fonts)
- **jsPDF 4.2** + **html-to-image** para exportación de documentos
- **Vitest 4 + React Testing Library** para pruebas de componentes

## Herramientas

### Radar Tecnológico

Visualización SVG interactiva de la madurez y adopción de tecnologías del área de Electricidad.

- **18 tecnologías** organizadas en **5 direccionadores del desarrollo (D1-D5)**
- **4 anillos de adopción**: ADOPTAR, PROBAR, EVALUAR, MONITOREAR
- Indicador de madurez basado en **niveles TRL (1-9)**
- Tabla de nomenclaturas completa con códigos **L01-L18**
- Exportación: PNG (3×) y PDF A4 landscape
- Gestos táctiles: pan y pinch-to-zoom

| ID  | Direccionador                                               | Tecnologías |
| --- | ----------------------------------------------------------- | ----------- |
| D1  | Transición Energética Hacia Sistemas Sostenibles            | 5           |
| D2  | Automatización de Redes Hacia la Transición Digital         | 4           |
| D3  | Flexibilidad de Red con Nuevos Modelos Operativos           | 3           |
| D4  | Electrificación Digital Descentralizada con Gobernanza de Datos | 5       |
| D5  | Ecosistema Normativo                                        | 1           |

### Mapa de Trayectoria Tecnológica

Visualización de la evolución proyectada de las capacidades del área de Electricidad en el tiempo (2025–2035).

- **Motor genérico reutilizable** (`src/lib/trajectory/`) — agnóstico al dominio, portable a otros centros
- **5 direccionadores estratégicos** (D1–D5), seleccionables por pestañas
- **~58 ítems** distribuidos en 4 capas × 5 horizontes, extraídos directamente del GOR-F-012 Electricidad
- **Capas (swimlanes)**: Tecnologías · Infraestructura · Talento & I+D+i · Alianzas
- **Horizontes**: Presente (2025) → Corto plazo → Mediano plazo (I) → Mediano plazo (II) → Largo plazo (2035)
- Panel de detalle lateral al hacer clic en un ítem
- Exportación a **PDF A4 landscape** desde el botón "Exportar PDF"
- Accesible desde el botón "Mapa de Trayectoria Tecnológica" en el Header

#### Arquitectura del motor

```
src/lib/trajectory/          # Motor genérico (sin dependencias de dominio)
├── index.ts                 # Re-exports públicos: tipos + normalizeHorizon
├── config.ts                # Tipos TrajectoryConfig, TrajectoryLayer, TrajectoryDriver
├── dataset.ts               # Tipos TrajectoryDataset, TrajectoryItem
└── layout.ts                # Lógica de layout: agrupar ítems por driver/layer/horizon

src/lib/trajectory-data.electricidad.ts  # Adaptador de dominio Electricidad
                                          # Importa radar-data + tablas GOR → TrajectoryConfig + TrajectoryDataset

src/components/trajectory/   # Componentes UI del mapa (agnósticos al dominio)
├── TrajectoryMap.tsx        # Orquestador: tabs + grid
├── TrajectoryLane.tsx       # Swimlane (fila de capa)
├── TrajectoryNode.tsx       # Nodo individual (botón accesible)
├── TrajectoryDetail.tsx     # Panel de detalle lateral
├── TrajectoryLegend.tsx     # Leyenda de colores
├── TrajectoryProvider.tsx   # Context provider (config + selectedId)
└── index.ts                 # Re-exports

src/components/molecules/TrajectoryModal.tsx  # Integración: Dialog Radix + motor
```

## Paleta Institucional SENA

| Color        | Hex       | Uso                        |
| ------------ | --------- | -------------------------- |
| Verde SENA   | `#39A900` | Primario / Header / Footer |
| Azul SENA    | `#00324D` | Títulos / Bordes           |
| Gris Claro   | `#F2F2F2` | Fondos secundarios         |
| Gris Oscuro  | `#333333` | Texto general              |
| Amarillo     | `#FDC300` | Alertas / TRL bajo         |
| Cian         | `#50E5F9` | Acentos                    |

## Testing

```bash
# Ejecutar pruebas (Vitest 4 + RTL)
npm test

# Modo watch
npx vitest

# Interfaz visual
npx vitest --ui
```

Las pruebas cubren:
- Motor de trayectoria (configuración, layout, datos Electricidad)
- Componentes TrajectoryMap y TrajectoryNode (RTL + userEvent)
- Modal TrajectoryModal (open/close, export button, domain strings)
- Contenido UI del dominio Electricidad (header, about, help, manifest, radar chart)
- Arquitectura (dependencias unidireccionales motor ← adaptador)

> Nota: 2 pruebas en `radar-data.test.ts` tienen fallas pre-existentes relacionadas con el espaciado angular de nodos del radar; no afectan funcionalidad.

## Instalación

```bash
git clone <repo>
cd radar_tecnologico_electricidad

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build
npm start
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── globals.css         # Theme CSS con @theme Tailwind v4 + paleta SENA
│   ├── layout.tsx          # Root layout (Work Sans, metadata dual)
│   └── page.tsx            # Página principal
├── components/
│   ├── molecules/
│   │   ├── AboutModal.tsx      # Sobre la plataforma (dual: Radar + Mapa)
│   │   ├── HelpModal.tsx       # Guía de referencia (TRL + anillos + Mapa)
│   │   └── TrajectoryModal.tsx # Wrapper Dialog del Mapa de Trayectoria
│   ├── organisms/
│   │   ├── Header.tsx          # Header con botón Mapa de Trayectoria
│   │   ├── Footer.tsx          # Footer institucional CEET + GICS
│   │   ├── RadarChart.tsx      # SVG interactivo del radar
│   │   ├── NomenclatureTable.tsx
│   │   ├── RadarLegend.tsx
│   │   └── TechDetail.tsx
│   ├── templates/
│   │   └── RadarTemplate.tsx   # Orquestador principal del radar
│   ├── trajectory/             # Componentes del Mapa de Trayectoria
│   └── ui/                     # shadcn/ui (Badge, Dialog, Tabs...)
├── lib/
│   ├── utils.ts                # cn() helper
│   ├── radar-data.ts           # Datos del radar (18 tecnologías)
│   ├── trajectory/             # Motor genérico de trayectoria
│   ├── trajectory-data.electricidad.ts  # Adaptador dominio Electricidad
│   └── export-utils.ts         # SVG→PDF (radar) y DOM→PDF (mapa)
└── test/
    ├── setup.ts                # @testing-library/jest-dom/vitest
    ├── radar-data.test.ts
    ├── trajectory-arch.test.ts
    ├── trajectory-config.test.ts
    ├── trajectory-data-electricidad.test.ts
    ├── trajectory-layout.test.ts
    ├── trajectory-map.test.tsx
    ├── trajectory-modal.test.tsx
    ├── trajectory-node.test.tsx
    └── ui-content.test.tsx
public/
└── assets/logos/
    ├── escudo-semilleros.svg
    ├── logo-centro-formacion-white.svg
    ├── logo-grupo-investigacion.svg
    └── logo-sena.png
```

## Changelog

### v1.1.0 — Mapa de Trayectoria Tecnológica (2026)

- **Mapa de Trayectoria Tecnológica**: nueva herramienta integrada en el Header
- **Motor genérico** `src/lib/trajectory/` — portable, agnóstico al dominio
- **Adaptador Electricidad** (`trajectory-data.electricidad.ts`): ~58 ítems en 4 capas × 5 horizontes × 5 direccionadores, extraídos del GOR-F-012
- **TrajectoryModal**: Dialog full-screen (mobile) / nearly-full-screen (desktop), con intro, mapa, panel de detalle y exportación PDF
- **Branding actualizado**: "Vigilancia Tecnológica CEET" — plataforma dual (Radar + Mapa)
- **HelpModal** ampliado: nueva sección del Mapa de Trayectoria (capas, horizontes, colores, exportar PDF)
- **AboutModal** actualizado: descripción dual de ambas herramientas
- **Tests**: suite Vitest 4 + RTL con 143 pruebas pasando (2 fallas pre-existentes aisladas)
- **Version bump**: 1.0.0 → 1.1.0

### v1.0.0 — Radar Electricidad CEET 2025-2035 (2026)

- **Migración de dominio**: contenido completamente actualizado de Telecomunicaciones a Electricidad
- **18 tecnologías** mapeadas desde ejercicio de Vigilancia Científico-Tecnológica CEET-GICS (2025)
- **5 direccionadores** alineados con área de electricidad
- **Autoría actualizada**: Ing. Luz Mayerly Amaya Romero (Autora), Ing. Mauricio Vargas (Coautor)

## Autoría

**Autora:**
Ing. Luz Mayerly Amaya Romero, Instructora — Área de Electricidad

**Coautor:**
Ing. Mauricio Alexander Vargas Rodríguez, MSc., MBA Esp. PM.
Instructor G14 — Centro de Electricidad, Electrónica y Telecomunicaciones
SENA, Bogotá D.C. — Colombia

Grupo de Investigación, Innovación y Producción Académica — GICS

## Fuente

Elaboración propia basada en ejercicio de Vigilancia Científico-Tecnológica CEET-GICS (2025).
Metodología tipo Gartner Technology Radar (Radar) y Technology Roadmapping (Mapa de Trayectoria).

---

© 2026 SENA — Servicio Nacional de Aprendizaje
