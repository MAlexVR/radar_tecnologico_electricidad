# Radar Tecnológico — Electricidad CEET 2025-2035

![SENA](https://img.shields.io/badge/SENA-CEET-39A900?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=flat-square&logo=tailwindcss)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix-000000?style=flat-square)

Aplicación web interactiva de vigilancia científico-tecnológica para el área de electricidad del Centro de Electricidad, Electrónica y Telecomunicaciones (CEET) — SENA.

Grupo de Investigación, Innovación y Producción Académica — **GICS**

## Stack Tecnológico

- **Next.js 16+** con App Router y Turbopack
- **React 19.2** con Server Components
- **TypeScript 5.7**
- **Tailwind CSS 4.2** con configuración CSS-based (`@theme`) — paleta institucional SENA
- **tw-animate-css** para animaciones de componentes Radix UI
- **shadcn/ui** (Radix UI + CVA)
- **Lucide React 0.575** para iconografía
- **Work Sans** como fuente institucional (Google Fonts)
- **jsPDF 4.2** para exportación de documentos

## Contenido del Radar

- **18 tecnologías** organizadas en **5 direccionadores del desarrollo (D1-D5)**
- **4 anillos de adopción**: ADOPTAR, PROBAR, EVALUAR, MONITOREAR
- **Indicador de madurez** basado en niveles TRL (1-9)
- **Tabla de nomenclaturas** completa con códigos L01-L18

### Direccionadores

| ID  | Direccionador                                               | Tecnologías |
| --- | ----------------------------------------------------------- | ----------- |
| D1  | Transición Energética Hacia Sistemas Sostenibles            | 5           |
| D2  | Automatización de Redes Hacia la Transición Digital         | 4           |
| D3  | Flexibilidad de Red con Nuevos Modelos Operativos           | 3           |
| D4  | Electrificación Digital Descentralizada con Gobernanza de Datos | 5       |
| D5  | Ecosistema Normativo                                        | 1           |

## Características

- **Visualización interactiva SVG** con zoom, pan y selección de tecnologías
- **Gestos táctiles**: Navegación intuitiva mediante gestos (pan y pinch-to-zoom)
- **Filtros dinámicos** por direccionador y fase de adopción
- **Exportación**: PNG (3x resolución) y PDF (A4 landscape)
- **Diseño responsivo**: interfaz adaptada a móvil, tablet y escritorio
- **Interfaz institucional**: paleta SENA, logos CEET y GICS, modo claro

## Paleta Institucional SENA

| Color        | Hex       | Uso                        |
| ------------ | --------- | -------------------------- |
| Verde SENA   | `#39A900` | Primario / Header / Footer |
| Azul SENA    | `#00324D` | Títulos / Bordes           |
| Gris Claro   | `#F2F2F2` | Fondos secundarios         |
| Gris Oscuro  | `#333333` | Texto general              |
| Amarillo     | `#FDC300` | Alertas / TRL bajo         |
| Cian         | `#50E5F9` | Acentos                    |

## Instalación

```bash
# Clonar el repositorio
cd radar-tecnologico-electricidad

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
│   ├── globals.css        # Theme CSS con @theme Tailwind v4 + paleta SENA
│   ├── layout.tsx         # Root layout (Work Sans, metadata)
│   └── page.tsx           # Página principal
├── components/
│   ├── molecules/         # AboutModal, HelpModal
│   ├── organisms/         # Header, Footer, RadarChart, TechDetail, NomenclatureTable, RadarLegend
│   ├── templates/         # RadarTemplate (orquestador principal)
│   └── ui/                # shadcn/ui components (Button, Badge, Dialog, Tabs...)
├── lib/
│   ├── utils.ts           # cn() helper
│   └── radar-data.ts      # Datos completos del radar (18 tecnologías)
└── types/
    └── radar.ts           # Interfaces TypeScript
public/
└── assets/logos/
    ├── escudo-semilleros.svg            # Escudo header
    ├── logo-centro-formacion-white.svg  # Logo CEET (blanco)
    ├── logo-grupo-investigacion.svg     # Logo GICS
    └── logo-sena.png                    # Logo SENA
```

## Changelog

### v1.0.0 — Radar Electricidad CEET 2025-2035 (2026)
- **Migración de dominio**: contenido completamente actualizado de Telecomunicaciones a Electricidad
- **18 tecnologías** mapeadas desde ejercicio de Vigilancia Científico-Tecnológica CEET-GICS (2025)
- **5 direccionadores** alineados con área de electricidad: Transición Energética, Automatización de Redes, Flexibilidad de Red, Electrificación Digital, Ecosistema Normativo
- **Autoría actualizada**: Ing. Luz Mayerly Amaya Romero (Autora — Área de Electricidad), Ing. Mauricio Vargas (Coautor — Área de Telecomunicaciones)
- Versión, metadatos y README sincronizados a v1.0

### v2.0.0 — Rediseño UX/UI Telecomunicaciones (2026)
- Migración a **Next.js 16**, **React 19.2** y **Tailwind CSS v4** (config CSS-based, sin `tailwind.config.ts`)
- **Header** institucional: escudo semilleros en círculo blanco, franja azul SENA, menú responsivo
- **Footer** institucional: logos CEET + GICS, texto institucional alineado con identidad SENA
- **AboutModal** con layout full-screen mobile, credenciales completas del autor
- **HelpModal** con descripción accesible (`DialogDescription`), niveles TRL y anillos
- **Paleta SENA** unificada: verde `#39A900`, azul `#00324D`, modo claro exclusivo
- **CSS cascade fix**: `@layer base` para que utilidades Tailwind pisen `border-color` global
- **Accesibilidad**: `suppressHydrationWarning`, `aria` en todos los `DialogContent`
- **Image**: `style={{ width: "auto" }}` en imágenes responsivas (fix Next.js warning)
- Actualizadas todas las dependencias a versiones vigentes

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
Metodología tipo Gartner Technology Radar.

---

© 2026 SENA — Servicio Nacional de Aprendizaje
