import json

with open(r'E:\Repositorio\radar_tecnologico_electricidad\parsed_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

ring_map = {
    'L01': 1, 'L02': 0, 'L03': 1, 'L04': 1, 'L05': 1,
    'L06': 0, 'L07': 0, 'L08': 1, 'L09': 2,
    'L10': 1, 'L11': 1, 'L12': 0,
    'L13': 1, 'L14': 1, 'L15': 1, 'L16': 0, 'L17': 1,
    'L18': 2
}

impact_map = {
    'L01': 'Alto', 'L02': 'Alto', 'L03': 'Disruptivo', 'L04': 'Social Alto', 'L05': 'Alto',
    'L06': 'Alto', 'L07': 'Alto', 'L08': 'Alto', 'L09': 'Alto',
    'L10': 'Muy Alto', 'L11': 'Muy Alto', 'L12': 'Alto',
    'L13': 'Critico', 'L14': 'Alto', 'L15': 'Alto', 'L16': 'Alto', 'L17': 'Medio',
    'L18': 'Regulatorio'
}

horizon_map = {
    'L01': 'Corto (1-3 anos)', 'L02': 'Corto (1-3 anos)', 'L03': 'Corto-mediano (2025-2030)',
    'L04': 'Medio (2-5 anos)', 'L05': 'Corto (1-3 anos)',
    'L06': 'Corto (1-3 anos)', 'L07': 'Corto (1-3 anos)', 'L08': 'Corto-mediano (2-5 anos)',
    'L09': 'Medio (2-5 anos)',
    'L10': 'Corto (1-3 anos)', 'L11': 'Corto (1-3 anos)', 'L12': 'Corto (1-3 anos)',
    'L13': 'Corto-mediano (2025-2030)', 'L14': 'Corto (1-3 anos)', 'L15': 'Corto (1-3 anos)',
    'L16': 'Corto (1-3 anos)', 'L17': 'Corto (1-3 anos)', 'L18': 'Medio (2-5 anos)'
}

desc_map = {}
name_lines_map = {}
sector_map = {'D1': 0, 'D2': 1, 'D3': 2, 'D4': 3, 'D5': 4}

for l in lines:
    code = l['codigo']
    d = l['descripcion']
    if d.startswith('Familia de procesos, productos y servicios'):
        d = d.split('. ', 1)[1] if '. ' in d else d
    desc_map[code] = d
    
    name = l['linea_tecnologica']
    if len(name) > 30:
        parts = name.split(' (')
        if len(parts) == 2:
            name_lines_map[code] = [parts[0], '(' + parts[1]]
        else:
            mid = len(name) // 2
            sp = name.rfind(' ', 0, mid)
            if sp == -1: sp = mid
            name_lines_map[code] = [name[:sp], name[sp+1:]]
    else:
        name_lines_map[code] = [name, '']

out = []
out.append('import { Ring, Sector, Technology } from \"@/types/radar\";')
out.append('')
out.append('export const RINGS: Ring[] = [')
out.append('  { id: \"adopt\", label: \"ADOPTAR\", radius: 110, color: \"#2E7D32\", fillColor: \"#C8E6C9\", borderColor: \"#81C784\", labelColor: \"#2E7D32\", desc: \"Implementacion inmediata\", trl: \"TRL 7-9\" },')
out.append('  { id: \"trial\", label: \"PROBAR\", radius: 210, color: \"#558B2F\", fillColor: \"#E1F0C4\", borderColor: \"#AED581\", labelColor: \"#688C36\", desc: \"Pilotos y capacitacion\", trl: \"TRL 5-7\" },')
out.append('  { id: \"assess\", label: \"EVALUAR\", radius: 305, color: \"#F9A825\", fillColor: \"#FFF3CD\", borderColor: \"#FFD54F\", labelColor: \"#B48C14\", desc: \"Investigacion / formacion\", trl: \"TRL 3-5\" },')
out.append('  { id: \"monitor\", label: \"MONITOREAR\", radius: 400, color: \"#E64A19\", fillColor: \"#FFE0D2\", borderColor: \"#FFAB91\", labelColor: \"#BE643C\", desc: \"Seguimiento largo plazo\", trl: \"TRL 1-3\" },')
out.append('];')
out.append('')
out.append('export const SECTOR_ANGLE = 72;')
out.append('')
out.append('export const SECTORS: Sector[] = [')
out.append('  { id: \"D1\", label: \"Transicion Energetica Hacia Sistemas Sostenibles\", shortLabel: \"D1: Transicion Energetica Hacia Sistemas Sostenibles\", labelLines: [\"D1: Transicion Energetica\", \"Hacia Sistemas Sostenibles\"], startAngle: -18, color: \"#1565C0\", bgLight: \"#E3F2FD\", bgDark: \"rgba(21,101,192,0.12)\", icon: \"ZAP\" },')
out.append('  { id: \"D2\", label: \"Automatizacion de Redes Hacia la Transicion Digital\", shortLabel: \"D2: Automatizacion de Redes Hacia la Transicion Digital\", labelLines: [\"D2: Automatizacion de Redes\", \"Hacia la Transicion Digital\"], startAngle: 54, color: \"#C62828\", bgLight: \"#FFEBEE\", bgDark: \"rgba(198,40,40,0.12)\", icon: \"ELECTRIC_PLUG\" },')
out.append('  { id: \"D3\", label: \"Flexibilidad de Red con Nuevos Modelos Operativos\", shortLabel: \"D3: Flexibilidad de Red con Nuevos Modelos Operativos\", labelLines: [\"D3: Flexibilidad de Red\", \"con Nuevos Modelos Operativos\"], startAngle: 126, color: \"#F57F17\", bgLight: \"#FFF3E0\", bgDark: \"rgba(245,127,23,0.12)\", icon: \"BATTERY\" },')
out.append('  { id: \"D4\", label: \"Electrificacion Digital Descentralizada con Gobernanza de Datos\", shortLabel: \"D4: Electrificacion Digital Descentralizada con Gobernanza de Datos\", labelLines: [\"D4: Electrificacion Digital\", \"Descentralizada con Gobernanza\"], startAngle: 198, color: \"#6A1B9A\", bgLight: \"#F3E5F5\", bgDark: \"rgba(106,27,154,0.12)\", icon: \"HOUSE\" },')
out.append('  { id: \"D5\", label: \"Ecosistema Normativo\", shortLabel: \"D5: Ecosistema Normativo\", labelLines: [\"D5: Ecosistema\", \"Normativo\"], startAngle: 270, color: \"#00695C\", bgLight: \"#E0F2F1\", bgDark: \"rgba(0,105,92,0.12)\", icon: \"SCROLL\" },')
out.append('];')
out.append('')
out.append('export const TECHNOLOGIES: Technology[] = [')

for idx, l in enumerate(lines):
    code = l['codigo']
    name = l['linea_tecnologica']
    nl = name_lines_map[code]
    desc = desc_map[code]
    sector = sector_map[l['direccionador_id']]
    ring = ring_map[code]
    trl = l['trl']
    impact = impact_map[code]
    horizon = horizon_map[code]
    tid = 'T' + str(idx+1).zfill(2)
    
    angle_off = 0
    if ring == 0: angle_off = -12 if idx % 2 == 0 else 12
    elif ring == 1: angle_off = -20 if idx % 2 == 0 else 20
    elif ring == 2: angle_off = -15 if idx % 2 == 0 else 15
    
    out.append('  {')
    out.append('    id: "' + tid + '",')
    out.append('    name: "' + name + '",')
    out.append('    nameLines: ' + json.dumps(nl, ensure_ascii=False) + ',')
    out.append('    code: "' + code + '",')
    out.append('    sector: ' + str(sector) + ',')
    out.append('    ring: ' + str(ring) + ',')
    out.append('    angleOff: ' + str(angle_off) + ',')
    out.append('    trl: ' + str(trl) + ',')
    out.append('    desc: "' + desc + '",')
    out.append('    impact: "' + impact + '",')
    out.append('    horizon: "' + horizon + '",')
    out.append('  },')
    out.append('')

out.append('];')
out.append('')
out.append('export function toRad(deg: number): number { return (deg * Math.PI) / 180; }')
out.append('function round4(n: number): number { return Math.round(n * 10000) / 10000; }')
out.append('export function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {')
out.append('  return { x: round4(cx + r * Math.cos(toRad(angleDeg))), y: round4(cy + r * Math.sin(toRad(angleDeg))) };')
out.append('}')
out.append('export function getTechPosition(tech: Technology, cx: number, cy: number) {')
out.append('  const sectorStart = SECTORS[tech.sector].startAngle;')
out.append('  const sectorCenter = sectorStart + SECTOR_ANGLE / 2;')
out.append('  const angleDeg = sectorCenter + tech.angleOff;')
out.append('  let r: number;')
out.append('  if (tech.ring === 0) r = RINGS[0].radius * 0.55;')
out.append('  else if (tech.ring === 1) r = (RINGS[0].radius + RINGS[1].radius) / 2;')
out.append('  else if (tech.ring === 2) r = (RINGS[1].radius + RINGS[2].radius) / 2;')
out.append('  else r = (RINGS[2].radius + RINGS[3].radius) / 2;')
out.append('  return { x: round4(cx + r * Math.cos(toRad(angleDeg))), y: round4(cy + r * Math.sin(toRad(angleDeg))) };')
out.append('}')
out.append('export function getTrlColor(trl: number): string {')
out.append('  if (trl >= 7) return "#C62828"; if (trl >= 5) return "#E65100"; if (trl >= 3) return "#FDC300"; return "#4FC3F7";')
out.append('}')
out.append('export function getTrlLabel(trl: number): string {')
out.append('  if (trl >= 7) return "TRL 7-9 (Alto)"; if (trl >= 5) return "TRL 5-6 (Medio)"; if (trl >= 3) return "TRL 3-4 (Bajo)"; return "TRL 1-2 (Inicial)";')
out.append('}')
out.append('export const EXCLUDED_TECHNOLOGIES = [')
out.append('  // No se identificaron tecnologias excluidas en el Excel. Todas las 18 lineas fueron mapeadas.')
out.append('];')

with open(r'E:\Repositorio\radar_tecnologico_electricidad\src\lib\radar-data.ts', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))

print('OK')
