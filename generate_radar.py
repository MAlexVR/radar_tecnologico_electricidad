import pandas as pd
import json

df = pd.read_excel(r'E:\Repositorio\radar_tecnologico_electricidad\docs\Vigilancia_CientificoTecnológicaV2.xlsx', sheet_name='Vigilancia Electricidad', header=None)

# Extraer vision del centro
vision = str(df.iloc[2,2]) if pd.notna(df.iloc[2,2]) else ''

# Configuracion manual basada en analisis profundo
# ring: 0=ADOPTAR, 1=PROBAR, 2=EVALUAR, 3=MONITOREAR

techs_config = [
    # D1
    {'code':'L01','name':'Microrredes Inteligentes (Microgrids)','sector':0,'ring':1,'trl':8,'impact':'Alto','horizon':'Corto (1-3 a�os)'},
    {'code':'L02','name':'Sistemas de Almacenamiento de Energ�a (BESS)','sector':0,'ring':0,'trl':9,'impact':'Alto','horizon':'Corto (1-3 a�os)'},
    {'code':'L03','name':'Integraci�n de Recursos Energ�ticos Distribuidos (DER)','sector':0,'ring':1,'trl':8,'impact':'Disruptivo','horizon':'Corto-mediano (2025-2030)'},
    {'code':'L04','name':'Generaci�n de Energ�a Comunitaria','sector':0,'ring':1,'trl':7,'impact':'Social Alto','horizon':'Medio (2-5 a�os)'},
    {'code':'L05','name':'Sistemas H�bridos de Generaci�n','sector':0,'ring':1,'trl':8,'impact':'Alto','horizon':'Corto (1-3 a�os)'},
    # D2
    {'code':'L06','name':'Infraestructura de Medici�n Avanzada (AMI)','sector':1,'ring':0,'trl':9,'impact':'Alto','horizon':'Corto (1-3 a�os)'},
    {'code':'L07','name':'Sistemas SCADA y DMS Avanzados','sector':1,'ring':0,'trl':9,'impact':'Alto','horizon':'Corto (1-3 a�os)'},
    {'code':'L08','name':'Automatizaci�n y Autocuraci�n (Self-healing)','sector':1,'ring':1,'trl':8,'impact':'Alto','horizon':'Corto-mediano (2-5 a�os)'},
    {'code':'L09','name':'Gemelos Digitales (Digital Twins)','sector':1,'ring':2,'trl':6,'impact':'Alto','horizon':'Medio (2-5 a�os)'},
    # D3
    {'code':'L10','name':'Plantas de Energ�a Virtuales (VPP)','sector':2,'ring':1,'trl':8,'impact':'Muy Alto','horizon':'Corto (1-3 a�os)'},
    {'code':'L11','name':'Sistemas de Gesti�n de Recursos Distribuidos (DERMS)','sector':2,'ring':1,'trl':8,'impact':'Muy Alto','horizon':'Corto (1-3 a�os)'},
    {'code':'L12','name':'Programas de Respuesta a la Demanda (Demand Response)','sector':2,'ring':0,'trl':9,'impact':'Alto','horizon':'Corto (1-3 a�os)'},
    # D4
    {'code':'L13','name':'Tecnolog�as Veh�culo-a-Red (V2G / V2X)','sector':3,'ring':1,'trl':7,'impact':'Cr�tico','horizon':'Corto-mediano (2025-2030)'},
    {'code':'L14','name':'Infraestructura de Carga Inteligente','sector':3,'ring':1,'trl':8,'impact':'Alto','horizon':'Corto (1-3 a�os)'},
    {'code':'L15','name':'Sistemas de Gesti�n de Energ�a en Edificios (BEMS)','sector':3,'ring':1,'trl':8,'impact':'Alto','horizon':'Corto (1-3 a�os)'},
    {'code':'L16','name':'Dom�tica y Hogares Inteligentes','sector':3,'ring':0,'trl':9,'impact':'Alto','horizon':'Corto (1-3 a�os)'},
    {'code':'L17','name':'Monitoreo No Intrusivo de Cargas (NILM)','sector':3,'ring':1,'trl':8,'impact':'Medio','horizon':'Corto (1-3 a�os)'},
    # D5
    {'code':'L18','name':'Gobernanza y Privacidad de Datos','sector':4,'ring':2,'trl':7,'impact':'Regulatorio','horizon':'Medio (2-5 a�os)'},
]

# Descripciones extraidas del Excel
descs = {
    'L01': 'Integraci�n coordinada de generaci�n distribuida renovable, almacenamiento y cargas en sistemas el�ctricos locales con capacidad de operaci�n aut�noma e interconectada.',
    'L02': 'Almacenamiento y despacho de energ�a el�ctrica mediante bater�as a escala residencial, comercial y de servicios p�blicos.',
    'L03': 'Agregaci�n, orquestaci�n y participaci�n de DER (PV, BESS, cargas flexibles, VE) en mercados de energ�a mediante plataformas digitales.',
    'L04': 'Producci�n compartida de energ�a renovable a nivel de distrito, vecindario o comunidad, incluyendo modelos de gobernanza y compensaci�n colectiva.',
    'L05': 'Integraci�n de dos o m�s fuentes de generaci�n con almacenamiento, operando como sistema coordinado para suplir demanda en modo aislado o conectado a red.',
    'L06': 'Medici�n inteligente bidireccional con conectividad IoT para monitoreo granular del consumo, detecci�n de p�rdidas y respuesta a la demanda.',
    'L07': 'Supervisi�n, control, adquisici�n de datos y gesti�n de distribuci�n con estimaci�n de estado, predicci�n de carga e integraci�n de IA.',
    'L08': 'Detecci�n, localizaci�n, aislamiento y restauraci�n autom�tica de fallas en redes de distribuci�n con terminales inteligentes y gemelos digitales.',
    'L09': 'Modelado digital, simulaci�n multif�sica y monitoreo predictivo de activos y redes mediante r�plicas virtuales sincronizadas con el sistema f�sico.',
    'L10': 'Agregaci�n, optimizaci�n y despacho coordinado de recursos energ�ticos distribuidos como entidad �nica despachable en mercados de energ�a.',
    'L11': 'Gesti�n, coordinaci�n y despacho de DER desde la perspectiva del operador de red, integrando visibilidad, control y optimizaci�n en tiempo real.',
    'L12': 'Gesti�n de la modificaci�n de patrones de consumo el�ctrico mediante se�ales de precio, incentivos o control directo de carga.',
    'L13': 'Flujo bidireccional de energ�a entre veh�culos el�ctricos y la red, incluyendo hardware de carga bidireccional, gesti�n con IA y plataformas V2G.',
    'L14': 'Dise�o, despliegue, operaci�n y gesti�n de estaciones y redes de carga para VE, integrando IoT, IA y energ�as renovables.',
    'L15': 'Monitoreo, control y optimizaci�n del consumo energ�tico en edificaciones mediante IA, IoT y control predictivo.',
    'L16': 'Automatizaci�n, monitoreo y control inteligente del consumo energ�tico residencial, integrando IoT, IA, generaci�n solar y almacenamiento.',
    'L17': 'Desagregaci�n del consumo el�ctrico a nivel de electrodom�stico desde un �nico punto de medici�n mediante algoritmos de IA/ML.',
    'L18': 'Gobernanza de datos en redes inteligentes, privacidad del consumidor energ�tico y transparencia algor�tmica en infraestructuras cr�ticas.',
}

# nameLines para nombres largos
name_lines = {
    'L01': ['Microrredes Inteligentes','(Microgrids)'],
    'L02': ['Sistemas de Almacenamiento','de Energ�a (BESS)'],
    'L03': ['Integraci�n de Recursos','Energ�ticos Distribuidos (DER)'],
    'L04': ['Generaci�n de Energ�a','Comunitaria'],
    'L05': ['Sistemas H�bridos','de Generaci�n'],
    'L06': ['Infraestructura de Medici�n','Avanzada (AMI)'],
    'L07': ['Sistemas SCADA y','DMS Avanzados'],
    'L08': ['Automatizaci�n y Autocuraci�n','(Self-healing)'],
    'L09': ['Gemelos Digitales','(Digital Twins)'],
    'L10': ['Plantas de Energ�a','Virtuales (VPP)'],
    'L11': ['Sistemas de Gesti�n de','Recursos Distribuidos (DERMS)'],
    'L12': ['Programas de Respuesta','a la Demanda (DR)'],
    'L13': ['Tecnolog�as Veh�culo-a-Red','(V2G / V2X)'],
    'L14': ['Infraestructura de','Carga Inteligente'],
    'L15': ['Sistemas de Gesti�n de Energ�a','en Edificios (BEMS)'],
    'L16': ['Dom�tica y','Hogares Inteligentes'],
    'L17': ['Monitoreo No Intrusivo','de Cargas (NILM)'],
    'L18': ['Gobernanza y','Privacidad de Datos'],
}

# Generar el archivo
lines = []
lines.append('import { Ring, Sector, Technology } from "@/types/radar";')
lines.append('')
lines.append('// ═══════════════════════════════════════════════════════════════')
lines.append('// RING CONFIGURATION')
lines.append('// ═══════════════════════════════════════════════════════════════')
lines.append('export const RINGS: Ring[] = [')
lines.append('  { id: "adopt", label: "ADOPTAR", radius: 110, color: "#2E7D32", fillColor: "#C8E6C9", borderColor: "#81C784", labelColor: "#2E7D32", desc: "Implementaci�n inmediata", trl: "TRL 7-9" },')
lines.append('  { id: "trial", label: "PROBAR", radius: 210, color: "#558B2F", fillColor: "#E1F0C4", borderColor: "#AED581", labelColor: "#688C36", desc: "Pilotos y capacitaci�n", trl: "TRL 5-7" },')
lines.append('  { id: "assess", label: "EVALUAR", radius: 305, color: "#F9A825", fillColor: "#FFF3CD", borderColor: "#FFD54F", labelColor: "#B48C14", desc: "Investigaci�n / formaci�n", trl: "TRL 3-5" },')
lines.append('  { id: "monitor", label: "MONITOREAR", radius: 400, color: "#E64A19", fillColor: "#FFE0D2", borderColor: "#FFAB91", labelColor: "#BE643C", desc: "Seguimiento largo plazo", trl: "TRL 1-3" },')
lines.append('];')
lines.append('')
lines.append('// ═══════════════════════════════════════════════════════════════')
lines.append('// SECTOR CONFIGURATION (5 Drivers / Direccionadores)')
lines.append('// Each sector spans 72� (360 / 5)')
lines.append('// ═══════════════════════════════════════════════════════════════')
lines.append('export const SECTOR_ANGLE = 72;')
lines.append('')
lines.append('export const SECTORS: Sector[] = [')
lines.append('  {')
lines.append('    id: "D1",')
lines.append('    label: "Transici�n Energ�tica Hacia Sistemas Sostenibles",')
lines.append('    shortLabel: "D1: Transici�n Energ�tica Hacia Sistemas Sostenibles",')
lines.append('    labelLines: ["D1: Transici�n Energ�tica", "Hacia Sistemas Sostenibles"],')
lines.append('    startAngle: -18,')
lines.append('    color: "#1565C0",')
lines.append('    bgLight: "#E3F2FD",')
lines.append('    bgDark: "rgba(21,101,192,0.12)",')
lines.append('    icon: "�",')
lines.append('  },')
lines.append('  {')
lines.append('    id: "D2",')
lines.append('    label: "Automatizaci�n de Redes Hacia la Transici�n Digital",')
lines.append('    shortLabel: "D2: Automatizaci�n de Redes Hacia la Transici�n Digital",')
lines.append('    labelLines: ["D2: Automatizaci�n de Redes", "Hacia la Transici�n Digital"],')
lines.append('    startAngle: 54,')
lines.append('    color: "#C62828",')
lines.append('    bgLight: "#FFEBEE",')
lines.append('    bgDark: "rgba(198,40,40,0.12)",')
lines.append('    icon: "�",')
lines.append('  },')
lines.append('  {')
lines.append('    id: "D3",')
lines.append('    label: "Flexibilidad de Red con Nuevos Modelos Operativos",')
lines.append('    shortLabel: "D3: Flexibilidad de Red con Nuevos Modelos Operativos",')
lines.append('    labelLines: ["D3: Flexibilidad de Red", "con Nuevos Modelos Operativos"],')
lines.append('    startAngle: 126,')
lines.append('    color: "#F57F17",')
lines.append('    bgLight: "#FFF3E0",')
lines.append('    bgDark: "rgba(245,127,23,0.12)",')
lines.append('    icon: "�",')
lines.append('  },')
lines.append('  {')
lines.append('    id: "D4",')
lines.append('    label: "Electrificaci�n Digital Descentralizada con Gobernanza de Datos",')
lines.append('    shortLabel: "D4: Electrificaci�n Digital Descentralizada con Gobernanza de Datos",')
lines.append('    labelLines: ["D4: Electrificaci�n Digital", "Descentralizada con Gobernanza"],')
lines.append('    startAngle: 198,')
lines.append('    color: "#6A1B9A",')
lines.append('    bgLight: "#F3E5F5",')
lines.append('    bgDark: "rgba(106,27,154,0.12)",')
lines.append('    icon: "�",')
lines.append('  },')
lines.append('  {')
lines.append('    id: "D5",')
lines.append('    label: "Ecosistema Normativo",')
lines.append('    shortLabel: "D5: Ecosistema Normativo",')
lines.append('    labelLines: ["D5: Ecosistema", "Normativo"],')
lines.append('    startAngle: 270,')
lines.append('    color: "#00695C",')
lines.append('    bgLight: "#E0F2F1",')
lines.append('    bgDark: "rgba(0,105,92,0.12)",')
lines.append('    icon: "�",')
lines.append('  },')
lines.append('];')
lines.append('')
lines.append('// ═══════════════════════════════════════════════════════════════')
lines.append('// TECHNOLOGIES (18 items)')
lines.append('// ring: 0=ADOPTAR, 1=PROBAR, 2=EVALUAR, 3=MONITOREAR')
lines.append('// sector: 0..4 = D1..D5')
lines.append('// ═══════════════════════════════════════════════════════════════')
lines.append('export const TECHNOLOGIES: Technology[] = [')

for idx, t in enumerate(techs_config):
    code = t['code']
    name = t['name']
    nl = name_lines[code]
    desc = descs[code]
    sector = t['sector']
    ring = t['ring']
    trl = t['trl']
    impact = t['impact']
    horizon = t['horizon']
    tid = f'T{idx+1:02d}'
    
    # Calcular angleOff para distribuir dentro del sector
    angle_off = 0
    if ring == 0:
        angle_off = -12 if idx % 2 == 0 else 12
    elif ring == 1:
        angle_off = -20 if idx % 2 == 0 else 20
    elif ring == 2:
        angle_off = -15 if idx % 2 == 0 else 15
    else:
        angle_off = 0
    
    lines.append(f'  // -- {code}: {name} --')
    lines.append('  {')
    lines.append(f'    id: "{tid}",')
    lines.append(f'    name: "{name}",')
    lines.append(f'    nameLines: {json.dumps(nl, ensure_ascii=False)},')
    lines.append(f'    code: "{code}",')
    lines.append(f'    sector: {sector},')
    lines.append(f'    ring: {ring},')
    lines.append(f'    angleOff: {angle_off},')
    lines.append(f'    trl: {trl},')
    lines.append(f'    desc: "{desc}",')
    lines.append(f'    impact: "{impact}",')
    lines.append(f'    horizon: "{horizon}",')
    lines.append('  },')
    lines.append('')

lines.append('];')
lines.append('')
lines.append('// ═══════════════════════════════════════════════════════════════')
lines.append('// HELPERS')
lines.append('// ═══════════════════════════════════════════════════════════════')
lines.append('export function toRad(deg: number): number {')
lines.append('  return (deg * Math.PI) / 180;')
lines.append('}')
lines.append('')
lines.append('function round4(n: number): number {')
lines.append('  return Math.round(n * 10000) / 10000;')
lines.append('}')
lines.append('')
lines.append('export function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {')
lines.append('  return {')
lines.append('    x: round4(cx + r * Math.cos(toRad(angleDeg))),')
lines.append('    y: round4(cy + r * Math.sin(toRad(angleDeg))),')
lines.append('  };')
lines.append('}')
lines.append('')
lines.append('export function getTechPosition(tech: Technology, cx: number, cy: number) {')
lines.append('  const sectorStart = SECTORS[tech.sector].startAngle;')
lines.append('  const sectorCenter = sectorStart + SECTOR_ANGLE / 2;')
lines.append('  const angleDeg = sectorCenter + tech.angleOff;')
lines.append('  let r: number;')
lines.append('  if (tech.ring === 0) r = RINGS[0].radius * 0.55;')
lines.append('  else if (tech.ring === 1) r = (RINGS[0].radius + RINGS[1].radius) / 2;')
lines.append('  else if (tech.ring === 2) r = (RINGS[1].radius + RINGS[2].radius) / 2;')
lines.append('  else r = (RINGS[2].radius + RINGS[3].radius) / 2;')
lines.append('  return {')
lines.append('    x: round4(cx + r * Math.cos(toRad(angleDeg))),')
lines.append('    y: round4(cy + r * Math.sin(toRad(angleDeg))),')
lines.append('  };')
lines.append('}')
lines.append('')
lines.append('export function getTrlColor(trl: number): string {')
lines.append('  if (trl >= 7) return "#C62828";')
lines.append('  if (trl >= 5) return "#E65100";')
lines.append('  if (trl >= 3) return "#FDC300";')
lines.append('  return "#4FC3F7";')
lines.append('}')
lines.append('')
lines.append('export function getTrlLabel(trl: number): string {')
lines.append('  if (trl >= 7) return "TRL 7-9 (Alto)";')
lines.append('  if (trl >= 5) return "TRL 5-6 (Medio)";')
lines.append('  if (trl >= 3) return "TRL 3-4 (Bajo)";')
lines.append('  return "TRL 1-2 (Inicial)";')
lines.append('}')
lines.append('')
lines.append('// ═══════════════════════════════════════════════════════════════')
lines.append('// EXCLUDED TECHNOLOGIES (Not mapped on radar)')
lines.append('// ═══════════════════════════════════════════════════════════════')
lines.append('export const EXCLUDED_TECHNOLOGIES = [')
lines.append('  // No se identificaron tecnolog�as expl�citamente excluidas en el Excel Vigilancia_CientificoTecnol�gicaV2.xlsx')
lines.append('  // Todas las 18 l�neas tecnol�gicas han sido mapeadas en el radar.')
lines.append('];')

with open(r'E:\Repositorio\radar_tecnologico_electricidad\src\lib\radar-data.ts', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('Archivo radar-data.ts generado exitosamente')
print(f'Total tecnologias: {len(techs_config)}')
print('Distribucion por anillo:')
rings_count = {}
for t in techs_config:
    r = t['ring']
    rings_count[r] = rings_count.get(r, 0) + 1
for r, c in sorted(rings_count.items()):
    names = ['ADOPTAR','PROBAR','EVALUAR','MONITOREAR']
    print(f'  {names[r]}: {c}')
