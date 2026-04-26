import { describe, it, expect } from 'vitest';
import { RINGS, SECTORS, TECHNOLOGIES, EXCLUDED_TECHNOLOGIES } from '@/lib/radar-data';

describe('Radar Data Structure — Electricidad CEET 2025-2035', () => {
  // ── SECTORS ──
  it('should have exactly 5 sectors', () => {
    expect(SECTORS).toHaveLength(5);
  });

  it('should have sectors D1 through D5', () => {
    const ids = SECTORS.map((s) => s.id);
    expect(ids).toEqual(['D1', 'D2', 'D3', 'D4', 'D5']);
  });

  it('should use Electricidad sector names (not Telecom)', () => {
    const labels = SECTORS.map((s) => s.label);
    expect(labels).not.toContain('Inteligencia Nativa y Redes Autónomas');
    expect(labels).not.toContain('Conectividad Extrema y Convergente');
    expect(labels).toContain('Transición Energética Hacia Sistemas Sostenibles');
    expect(labels).toContain('Automatización de Redes Hacia la Transición Digital');
    expect(labels).toContain('Flexibilidad de Red con Nuevos Modelos Operativos');
    expect(labels).toContain('Electrificación Digital Descentralizada con Gobernanza de Datos');
    expect(labels).toContain('Ecosistema Normativo');
  });

  it('should have correct technology counts per sector', () => {
    const counts = SECTORS.map((_, i) => TECHNOLOGIES.filter((t) => t.sector === i).length);
    expect(counts).toEqual([5, 4, 3, 5, 1]);
  });

  // ── TECHNOLOGIES ──
  it('should have exactly 18 technologies', () => {
    expect(TECHNOLOGIES).toHaveLength(18);
  });

  it('should have unique technology codes from L01 to L18', () => {
    const codes = TECHNOLOGIES.map((t) => t.code).sort();
    const expected = Array.from({ length: 18 }, (_, i) => `L${String(i + 1).padStart(2, '0')}`);
    expect(codes).toEqual(expected);
  });

  it('should have unique technology IDs from T01 to T18', () => {
    const ids = TECHNOLOGIES.map((t) => t.id).sort();
    const expected = Array.from({ length: 18 }, (_, i) => `T${String(i + 1).padStart(2, '0')}`);
    expect(ids).toEqual(expected);
  });

  it('should assign valid sector indices (0-4)', () => {
    for (const tech of TECHNOLOGIES) {
      expect(tech.sector).toBeGreaterThanOrEqual(0);
      expect(tech.sector).toBeLessThanOrEqual(4);
    }
  });

  it('should assign valid ring indices (0-3)', () => {
    for (const tech of TECHNOLOGIES) {
      expect(tech.ring).toBeGreaterThanOrEqual(0);
      expect(tech.ring).toBeLessThanOrEqual(3);
    }
  });

  it('should assign valid TRL values (1-9)', () => {
    for (const tech of TECHNOLOGIES) {
      expect(tech.trl).toBeGreaterThanOrEqual(1);
      expect(tech.trl).toBeLessThanOrEqual(9);
    }
  });

  it('should have required fields on every technology', () => {
    for (const tech of TECHNOLOGIES) {
      expect(tech.name).toBeTruthy();
      expect(tech.desc).toBeTruthy();
      expect(tech.impact).toBeTruthy();
      expect(tech.horizon).toBeTruthy();
    }
  });

  it('should not contain old Telecom technology names', () => {
    const names = TECHNOLOGIES.map((t) => t.name);
    expect(names).not.toContain('5G-Advanced (3GPP Releases 18-19)');
    expect(names).not.toContain('Open RAN / Desagregación de la RAN');
    expect(names).not.toContain('Blockchain para Telecomunicaciones');
  });

  // ── RINGS ──
  it('should have 4 adoption rings', () => {
    expect(RINGS).toHaveLength(4);
    const ids = RINGS.map((r) => r.id);
    expect(ids).toEqual(['adopt', 'trial', 'assess', 'monitor']);
  });

  it('should have ring TRL labels aligned with actual technology data', () => {
    // ADOPTAR (ring 0): all technologies should be TRL 8-9
    const adoptTrls = TECHNOLOGIES.filter((t) => t.ring === 0).map((t) => t.trl);
    for (const trl of adoptTrls) {
      expect(trl).toBeGreaterThanOrEqual(8);
      expect(trl).toBeLessThanOrEqual(9);
    }

    // PROBAR (ring 1): all technologies should be TRL 7-8
    const trialTrls = TECHNOLOGIES.filter((t) => t.ring === 1).map((t) => t.trl);
    for (const trl of trialTrls) {
      expect(trl).toBeGreaterThanOrEqual(7);
      expect(trl).toBeLessThanOrEqual(8);
    }

    // EVALUAR (ring 2): all technologies should be TRL 6-7
    const assessTrls = TECHNOLOGIES.filter((t) => t.ring === 2).map((t) => t.trl);
    for (const trl of assessTrls) {
      expect(trl).toBeGreaterThanOrEqual(6);
      expect(trl).toBeLessThanOrEqual(7);
    }

    // MONITOREAR (ring 3): no technologies mapped
    const monitorCount = TECHNOLOGIES.filter((t) => t.ring === 3).length;
    expect(monitorCount).toBe(0);
  });

  // ── SPACING ──
  it('should distribute technologies in same (sector, ring) with minimum angular separation', () => {
    const MIN_SEPARATION = 16; // degrees
    const groups = new Map<string, Technology[]>();
    for (const tech of TECHNOLOGIES) {
      const key = `${tech.sector}-${tech.ring}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(tech);
    }
    for (const [key, group] of groups) {
      if (group.length <= 1) continue;
      const sorted = group.map((t) => t.angleOff).sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        const diff = sorted[i] - sorted[i - 1];
        expect(diff).toBeGreaterThanOrEqual(
          MIN_SEPARATION,
          `Technologies in sector-ring ${key} have angleOff too close: ${sorted[i - 1]} and ${sorted[i]} (diff=${diff})`,
        );
      }
    }
  });

  it('should keep all angleOff within sector bounds (-30 to +30)', () => {
    for (const tech of TECHNOLOGIES) {
      expect(tech.angleOff).toBeGreaterThanOrEqual(-30);
      expect(tech.angleOff).toBeLessThanOrEqual(30);
    }
  });

  it('should have exact angleOff values for known crowded groups', () => {
    // D1 PROBAR (sector 0, ring 1): 4 technologies
    const d1Trial = TECHNOLOGIES.filter((t) => t.sector === 0 && t.ring === 1)
      .map((t) => t.angleOff)
      .sort((a, b) => a - b);
    expect(d1Trial).toEqual([-24, -8, 8, 24]);

    // D2 ADOPTAR (sector 1, ring 0): 2 technologies
    const d2Adopt = TECHNOLOGIES.filter((t) => t.sector === 1 && t.ring === 0)
      .map((t) => t.angleOff)
      .sort((a, b) => a - b);
    expect(d2Adopt).toEqual([-20, 20]);

    // D4 PROBAR (sector 3, ring 1): 4 technologies
    const d4Trial = TECHNOLOGIES.filter((t) => t.sector === 3 && t.ring === 1)
      .map((t) => t.angleOff)
      .sort((a, b) => a - b);
    expect(d4Trial).toEqual([-24, -8, 8, 24]);
  });

  it('should center solitary technologies at angleOff=0', () => {
    // T02 BESS: alone in D1 ADOPTAR
    const t02 = TECHNOLOGIES.find((t) => t.id === 'T02');
    expect(t02!.angleOff).toBe(0);

    // T08 Self-healing: alone in D2 PROBAR
    const t08 = TECHNOLOGIES.find((t) => t.id === 'T08');
    expect(t08!.angleOff).toBe(0);

    // T09 Digital Twins: alone in D2 EVALUAR
    const t09 = TECHNOLOGIES.find((t) => t.id === 'T09');
    expect(t09!.angleOff).toBe(0);

    // T16 Domótica: alone in D4 ADOPTAR
    const t16 = TECHNOLOGIES.find((t) => t.id === 'T16');
    expect(t16!.angleOff).toBe(0);

    // T18 Gobernanza: alone in D5 EVALUAR
    const t18 = TECHNOLOGIES.find((t) => t.id === 'T18');
    expect(t18!.angleOff).toBe(0);
  });

  // ── EXCLUDED ──
  it('should define EXCLUDED_TECHNOLOGIES as an array', () => {
    expect(Array.isArray(EXCLUDED_TECHNOLOGIES)).toBe(true);
  });
});
