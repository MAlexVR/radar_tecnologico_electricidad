/**
 * TrajectoryMap — RTL integration tests
 * Uses a fully SYNTHETIC dataset (drvA/drvB, lyr1-lyr4) to verify
 * the component is data-domain-agnostic.
 *
 * Covers:
 *  - Renders nodes as buttons with aria-labels
 *  - Driver tab switching filters displayed items
 *  - Empty state when driver has no items
 *  - onSelect fires when a node is clicked
 *  - Horizon bucket column headers are rendered
 *  - Layer (swimlane) labels are rendered
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TrajectoryConfig, TrajectoryDataset, TrajectoryItem } from "@/lib/trajectory";
import { TrajectoryMap } from "@/components/trajectory/TrajectoryMap";

// ── Synthetic fixtures ────────────────────────────────────────────────────────

const syntheticConfig: TrajectoryConfig = {
  drivers: [
    { key: "drvA", label: "Driver Alpha" },
    { key: "drvB", label: "Driver Beta" },
  ],
  layers: [
    { key: "lyr1", label: "Layer 1", order: 1 },
    { key: "lyr2", label: "Layer 2", order: 2 },
    { key: "lyr3", label: "Layer 3", order: 3 },
    { key: "lyr4", label: "Layer 4", order: 4 },
  ],
  horizonBuckets: [
    { key: "ahora", label: "Now",   order: 1 },
    { key: "corto", label: "Short", order: 2 },
    { key: "medio1", label: "Mid 1", order: 3 },
    { key: "medio2", label: "Mid 2", order: 4 },
    { key: "largo", label: "Long",  order: 5 },
  ],
  colorFor: () => "bg-gray-100 text-gray-800",
  labelFor: (item) => item.title,
  metricBadge: (item) => (item.metric ? `${item.metric.label} ${item.metric.value}` : null),
};

const itemsForDrvA: TrajectoryItem[] = [
  { id: "a1", layer: "lyr1", driver: "drvA", horizon: "ahora",  title: "Alpha Node 1", detail: "detail a1" },
  { id: "a2", layer: "lyr2", driver: "drvA", horizon: "corto",  title: "Alpha Node 2", detail: "detail a2" },
  { id: "a3", layer: "lyr3", driver: "drvA", horizon: "medio1", title: "Alpha Node 3", detail: "detail a3" },
  { id: "a4", layer: "lyr4", driver: "drvA", horizon: "largo",  title: "Alpha Node 4", detail: "detail a4" },
];

const itemsForDrvB: TrajectoryItem[] = [
  { id: "b1", layer: "lyr1", driver: "drvB", horizon: "medio2", title: "Beta Node 1", detail: "detail b1" },
  { id: "b2", layer: "lyr2", driver: "drvB", horizon: "largo",  title: "Beta Node 2", detail: "detail b2" },
];

const syntheticDataset: TrajectoryDataset = {
  items: [...itemsForDrvA, ...itemsForDrvB],
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("TrajectoryMap", () => {
  it("renders the driver tabs", () => {
    render(<TrajectoryMap config={syntheticConfig} dataset={syntheticDataset} />);
    // Tab text has two spans: key (bold) + label. The accessible name is their concatenation
    // (jsdom may or may not add a space between spans — use regex to be version-agnostic).
    expect(screen.getByRole("tab", { name: /drvA.*Driver Alpha/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /drvB.*Driver Beta/i })).toBeInTheDocument();
  });

  it("renders horizon bucket column headers", () => {
    render(<TrajectoryMap config={syntheticConfig} dataset={syntheticDataset} />);
    // Column headers are in the grid (role=columnheader), distinct from legend text
    const headers = screen.getAllByRole("columnheader");
    const headerTexts = headers.map((h) => h.textContent?.trim()).filter(Boolean);
    expect(headerTexts).toContain("Now");
    expect(headerTexts).toContain("Short");
    expect(headerTexts).toContain("Mid 1");
    expect(headerTexts).toContain("Mid 2");
    expect(headerTexts).toContain("Long");
  });

  it("renders layer labels (swimlane row headers)", () => {
    render(<TrajectoryMap config={syntheticConfig} dataset={syntheticDataset} />);
    const rowHeaders = screen.getAllByRole("rowheader");
    const labelTexts = rowHeaders.map((h) => h.textContent?.trim()).filter(Boolean);
    expect(labelTexts).toContain("Layer 1");
    expect(labelTexts).toContain("Layer 2");
  });

  it("renders items for the initial (first) driver as buttons", () => {
    render(<TrajectoryMap config={syntheticConfig} dataset={syntheticDataset} />);
    // drvA is first → all 4 alpha nodes should be visible (accessible).
    // getAllByRole is used because both desktop and mobile views render the same nodes.
    expect(screen.getAllByRole("button", { name: /Alpha Node 1/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /Alpha Node 2/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /Alpha Node 3/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /Alpha Node 4/i }).length).toBeGreaterThan(0);
  });

  it("does NOT render items of the non-selected driver initially (hidden in inactive tab)", () => {
    render(<TrajectoryMap config={syntheticConfig} dataset={syntheticDataset} />);
    // drvB tab panel is inactive (hidden) → its buttons are not accessible
    expect(screen.queryByRole("button", { name: /Beta Node 1/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Beta Node 2/i })).toBeNull();
  });

  it("switches to Driver Beta when its tab is clicked, showing only Beta nodes", async () => {
    const user = userEvent.setup();
    render(<TrajectoryMap config={syntheticConfig} dataset={syntheticDataset} />);
    await user.click(screen.getByRole("tab", { name: /drvB.*Driver Beta/i }));
    // Beta nodes become accessible after tab switch
    expect((await screen.findAllByRole("button", { name: /Beta Node 1/i })).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /Beta Node 2/i }).length).toBeGreaterThan(0);
    // Alpha nodes should no longer be accessible (their tab panel is now inactive/hidden)
    expect(screen.queryByRole("button", { name: /Alpha Node 1/i })).toBeNull();
  });

  it("shows empty state when selected driver has no items", async () => {
    const user = userEvent.setup();
    const emptyDataset: TrajectoryDataset = {
      items: itemsForDrvA, // no drvB items
    };
    render(<TrajectoryMap config={syntheticConfig} dataset={emptyDataset} />);
    await user.click(screen.getByRole("tab", { name: /drvB.*Driver Beta/i }));
    // No node buttons for drvB
    expect(screen.queryByRole("button", { name: /Beta Node/i })).toBeNull();
    // Empty state container should be present
    const emptyMsg = await screen.findByTestId("trajectory-empty-state");
    expect(emptyMsg).toBeInTheDocument();
  });

  it("calls onSelect with the item when a node button is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <TrajectoryMap config={syntheticConfig} dataset={syntheticDataset} onSelect={onSelect} />
    );
    // Use first() because desktop+mobile both render the same node
    const btns = screen.getAllByRole("button", { name: /Alpha Node 1/i });
    await user.click(btns[0]);
    expect(onSelect).toHaveBeenCalledWith(itemsForDrvA[0]);
  });

  it("node buttons have aria-labels containing layer and horizon info", () => {
    render(<TrajectoryMap config={syntheticConfig} dataset={syntheticDataset} />);
    // Use first button that matches (desktop or mobile, same aria-label)
    const btns = screen.getAllByRole("button", { name: /Alpha Node 1/i });
    const label = btns[0].getAttribute("aria-label") ?? "";
    expect(label).toContain("Layer 1");
    expect(label).toContain("Now");
    expect(label).toContain("Alpha Node 1");
  });
});
