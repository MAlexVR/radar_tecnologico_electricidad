import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/organisms/Header';
import { AboutModal } from '@/components/molecules/AboutModal';
import { HelpModal } from '@/components/molecules/HelpModal';
import { RadarChart } from '@/components/organisms/RadarChart';
import { RINGS } from '@/lib/radar-data';
import fs from 'fs';
import path from 'path';

describe('UI Content — Electricidad CEET 2025-2035', () => {
  // ── Header ──
  it('Header should display "Electricidad CEET" subtitle', () => {
    render(<Header />);
    expect(screen.getByText(/Electricidad CEET/i)).toBeInTheDocument();
  });

  it('Header should NOT display old Telecom subtitle', () => {
    render(<Header />);
    expect(screen.queryByText(/Telecomunicaciones CEET/i)).not.toBeInTheDocument();
  });

  it('Header badge should show v1.0', () => {
    render(<Header />);
    expect(screen.getByText(/v1\.0/i)).toBeInTheDocument();
  });

  // ── AboutModal ──
  it('AboutModal should list Luz Mayerly Amaya as primary author', () => {
    render(<AboutModal open={true} onOpenChange={() => {}} />);
    expect(screen.getByText(/Luz Mayerly Amaya Romero/i)).toBeInTheDocument();
  });

  it('AboutModal should list Mauricio Vargas as co-author', () => {
    render(<AboutModal open={true} onOpenChange={() => {}} />);
    expect(screen.getByText(/Mauricio Alexander Vargas Rodríguez/i)).toBeInTheDocument();
  });

  it('AboutModal should display version 1.0', () => {
    render(<AboutModal open={true} onOpenChange={() => {}} />);
    expect(screen.getByText(/Versión 1\.0/i)).toBeInTheDocument();
  });

  it('AboutModal should mention area de Electricidad for primary author', () => {
    render(<AboutModal open={true} onOpenChange={() => {}} />);
    const matches = screen.getAllByText(/Área de Electricidad/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  // ── HelpModal ──
  it('HelpModal should reference Electricidad (not Telecomunicaciones)', () => {
    render(<HelpModal open={true} onOpenChange={() => {}} />);
    expect(screen.getByText(/Radar Tecnológico de Electricidad/i)).toBeInTheDocument();
    expect(screen.queryByText(/Telecomunicaciones/i)).not.toBeInTheDocument();
  });

  // ── RadarChart ──
  it('RadarChart should display Electricidad in SVG title', () => {
    render(
      <RadarChart
        filteredTechs={[]}
        selectedTech={null}
        hoveredTech={null}
        activeSectors={new Set([0, 1, 2, 3, 4])}
        activeRings={new Set([0, 1, 2, 3])}
        onSelect={() => {}}
        onHover={() => {}}
      />
    );
    expect(screen.getByText(/Radar Tecnológico — Electricidad CEET 2025-2035/i)).toBeInTheDocument();
  });

  // ── Layout Metadata (read as text to avoid next/font in test env) ──
  const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

  it('layout metadata title should reference Electricidad', () => {
    expect(layoutContent).toMatch(/title:.*Electricidad/);
    expect(layoutContent).not.toMatch(/title:.*Telecomunicaciones/);
  });

  it('layout metadata description should reference electricidad area', () => {
    expect(layoutContent).toContain('electricidad');
    expect(layoutContent).not.toContain('telecomunicaciones');
  });

  it('layout metadata keywords should not include telecom-specific terms', () => {
    expect(layoutContent).not.toMatch(/"telecomunicaciones"/);
    expect(layoutContent).not.toMatch(/"5G"/);
    expect(layoutContent).not.toMatch(/"6G"/);
    expect(layoutContent).toMatch(/"electricidad"/);
  });

  it('layout metadata authors should include both Luz Mayerly Amaya and Mauricio Vargas', () => {
    expect(layoutContent).toContain('Luz Mayerly Amaya Romero');
    expect(layoutContent).toContain('Mauricio Alexander Vargas Rodríguez');
  });

  // ── Manifest ──
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  it('manifest name should reference Electricidad', () => {
    expect(manifest.name).toMatch(/Electricidad/i);
    expect(manifest.name).not.toMatch(/Telecomunicaciones/i);
  });

  it('manifest description should reference electricidad area', () => {
    expect(manifest.description).toMatch(/electricidad/i);
    expect(manifest.description).not.toMatch(/telecomunicaciones/i);
  });

  it('manifest background_color should be light', () => {
    expect(manifest.background_color).not.toBe('#020617');
    expect(manifest.background_color).toMatch(/^#/);
  });

  // ── RadarChart Label Positioning ──
  it('RadarChart should vertically center multi-line labels', () => {
    const { container } = render(
      <RadarChart
        filteredTechs={[
          {
            id: 'T01',
            name: 'Microrredes Inteligentes (Microgrids)',
            nameLines: ['Microrredes Inteligentes', '(Microgrids)'],
            code: 'L01',
            sector: 0,
            ring: 1,
            angleOff: -8,
            trl: 8,
            desc: 'Test',
            impact: 'Alto',
            horizon: 'Corto',
          },
        ]}
        selectedTech={null}
        hoveredTech={null}
        activeSectors={new Set([0, 1, 2, 3, 4])}
        activeRings={new Set([0, 1, 2, 3])}
        onSelect={() => {}}
        onHover={() => {}}
      />
    );
    const tspans = container.querySelectorAll('tspan');
    // Find the first tspan of the technology label (should have dy="-0.6em" for 2 lines)
    const labelTspans = Array.from(tspans).filter((t) =>
      t.textContent?.includes('Microrredes')
    );
    expect(labelTspans.length).toBeGreaterThanOrEqual(1);
    const firstTspan = labelTspans[0];
    expect(firstTspan.getAttribute('dy')).toBe('-0.6em');
  });

  it('RadarChart should place single-line labels without tspan wrappers', () => {
    const { container } = render(
      <RadarChart
        filteredTechs={[
          {
            id: 'T02',
            name: 'BESS',
            code: 'L02',
            sector: 0,
            ring: 0,
            angleOff: 20,
            trl: 9,
            desc: 'Test',
            impact: 'Alto',
            horizon: 'Corto',
          },
        ]}
        selectedTech={null}
        hoveredTech={null}
        activeSectors={new Set([0, 1, 2, 3, 4])}
        activeRings={new Set([0, 1, 2, 3])}
        onSelect={() => {}}
        onHover={() => {}}
      />
    );
    const textNodes = container.querySelectorAll('text');
    const labelText = Array.from(textNodes).find((t) =>
      t.textContent?.includes('BESS')
    );
    expect(labelText).toBeTruthy();
    // Single-line label: no tspan children, no negative dy
    expect(labelText!.querySelectorAll('tspan').length).toBe(0);
    expect(labelText!.textContent).toBe('BESS');
  });

  // ── TRL Consistency ──
  it('ring TRL labels should reflect actual data ranges', () => {
    // ADOPTAR (ring 0): actual data is TRL 9 (within 7-9 range)
    expect(RINGS[0].trl).toBe('TRL 7-9');

    // PROBAR (ring 1): actual data range is 7-8
    expect(RINGS[1].trl).toBe('TRL 7-8');

    // EVALUAR (ring 2): actual data range is 6-7
    expect(RINGS[2].trl).toBe('TRL 6-7');

    // MONITOREAR (ring 3): placeholder for future technologies
    expect(RINGS[3].trl).toBe('TRL 1-3');
  });
});
