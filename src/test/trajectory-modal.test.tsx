/**
 * TrajectoryModal — RTL integration tests
 *
 * Covers:
 *  - open=true renders the modal title and map content
 *  - open=false does not render the modal
 *  - Export PDF button is present when open=true
 *
 * No NextIntlClientProvider — this project has NO i18n (strings are plain Spanish literals).
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrajectoryModal } from "@/components/molecules/TrajectoryModal";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Suppress html-to-image / jsPDF dynamic imports in JSDOM — they are browser-only.
vi.mock("html-to-image", () => ({
  toPng: vi.fn().mockResolvedValue("data:image/png;base64,test"),
}));

vi.mock("jspdf", () => ({
  default: vi.fn().mockImplementation(() => ({
    setProperties: vi.fn(),
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("TrajectoryModal", () => {
  it("renders the modal title when open=true", () => {
    render(<TrajectoryModal open={true} onOpenChange={vi.fn()} />);
    // DialogTitle is the dialog label — use getAllByRole since intro h3 also matches the pattern
    const headings = screen.getAllByRole("heading", { name: /Mapa de Trayectoria Tecnológica/i });
    expect(headings.length).toBeGreaterThan(0);
  });

  it("renders map content (driver tabs) when open=true", () => {
    render(<TrajectoryModal open={true} onOpenChange={vi.fn()} />);
    // The TrajectoryMap renders driver tabs — there are 5 drivers in electricidadConfig
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThan(0);
  });

  it("does NOT render modal content when open=false", () => {
    render(<TrajectoryModal open={false} onOpenChange={vi.fn()} />);
    // Radix Dialog does not mount content when closed
    expect(
      screen.queryByRole("heading", { name: /Mapa de Trayectoria Tecnológica/i })
    ).toBeNull();
  });

  it("renders the Export PDF button when open=true", () => {
    render(<TrajectoryModal open={true} onOpenChange={vi.fn()} />);
    expect(
      screen.getByTestId("trajectory-export-btn")
    ).toBeInTheDocument();
  });

  it("export button has accessible label 'Exportar PDF'", () => {
    render(<TrajectoryModal open={true} onOpenChange={vi.fn()} />);
    const exportBtn = screen.getByTestId("trajectory-export-btn");
    expect(exportBtn).toHaveAttribute("aria-label", "Exportar PDF");
  });

  it("intro text references Electricidad domain", () => {
    render(<TrajectoryModal open={true} onOpenChange={vi.fn()} />);
    // Use getAllByText since multiple elements may contain this substring
    const matches = screen.getAllByText(/área de Electricidad/i);
    expect(matches.length).toBeGreaterThan(0);
  });
});
