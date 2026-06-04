# Vigilancia Tecnológica CEET — Electricidad

![Version](https://img.shields.io/badge/versión-1.2.0-39A900?style=flat-square)
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
- **75 ítems** distribuidos en 4 capas × 5 horizontes, extraídos del GOR-F-012 e investigación primaria colombiana
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

### v1.2.0 — Cobertura completa del mapa (ítems del GOR + fuentes primarias colombianas) (2026)

- **Cobertura completa ALTA + MEDIA**: añadidos 17 ítems faltantes identificados en auditoría contra el GOR-F-012
- **Hidrógeno verde y geotermia** (D1/L3): módulo formativo con fundamento en Ley 2099/2021, Decreto 895/2022 y Hoja de Ruta del Hidrógeno Colombia 2022 (MinEnergía-BID); potencial geotérmico SGC 1.170 MW
- **Domótica y hogares inteligentes** (D4/L3): L16 TRL 9 ADOPTAR — KNX, Matter/Thread, Zigbee, integración BEMS; horizonte "ahora"
- **NILM — Monitoreo No Intrusivo de Cargas** (D4/L3): L17 — disaggregación de carga, FHMM, aplicación a auditorías energéticas
- **Infraestructura de carga AC Nivel 2 OCPP** (D4/L2): Ley 1964/2019, OCPP 2.0.1, Res. 40123/2024 MinEnergía; simulador EV/V2G
- **Interoperabilidad y regulación basada en desempeño** (D5/L3 ×2): LT5.2 (IEC 61968/61970 CIM, IEEE 2030.5) y LT5.5 (PBR, SAIDI/SAIFI, CREG incentivos) — brechas críticas slide 10
- **Mercados de energía transactiva y P2P** (D3/L3): LT3.4 — CREG programa transitorio demanda 2024, XM
- **Coordinación TSO-DSO** (D3/L3): marco en desarrollo Colombia; flujos bidireccionales TSO-DSO
- **Precios dinámicos y MRV energético** (D5/L3): LT5.4 — TOU/RTP/CPP; IPMVP, ISO 50015
- **Protección adaptativa de microrredes** (D1/L3): IEEE 2030.7, GOOSE IEC 61850
- **Energía comunitaria y cooperativas** (D1/L3): L04 — AGPE, CREG 030/2018, Ley 2099/2021
- **Aliado SEL University** (D1/L4): cursos eCOM 202 (IEC 61850) y COM 401 — fundamento Tabla 11 fila 4
- **Aliado ABB — relés REF615 + PCM600** (D2/L4): Tabla 11 fila 2; marcado como sugerida
- **Aliado UNAL Grupo EMC-UN** (D4/L4): inteligencia computacional aplicada al sector eléctrico (Prof. Sergio Raúl Rivera)
- **Aliado OpenADR Alliance** (D3/L4): organismo de certificación OpenADR 2.0/3.0; primeras certificaciones v3.0 marzo 2025
- **Aliado IEEE PES Colombia** (D5/L4): capítulo profesional activo; Encuentro PES 2024; capítulos Uniandes y U. Distrital
- **Matriz de cobertura actualizada**: 57 ítems L2-L4 (vs. 40 antes), 75 total (vs. 58)
- **Version bump**: 1.1.0 → 1.2.0

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
