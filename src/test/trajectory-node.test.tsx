/**
 * TrajectoryNode — RTL unit tests
 * Uses a fully SYNTHETIC dataset (drvA/drvB, lyr1-lyr4) to verify
 * the component is data-domain-agnostic.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { TrajectoryItem, TrajectoryConfig } from "@/lib/trajectory";
import { TrajectoryProvider } from "@/components/trajectory/TrajectoryProvider";
import { TrajectoryNode } from "@/components/trajectory/TrajectoryNode";

// ── Synthetic fixtures ────────────────────────────────────────────────────────

const syntheticItem: TrajectoryItem = {
  id: "item-001",
  layer: "lyr1",
  driver: "drvA",
  horizon: "corto",
  title: "Quantum Mesh",
  detail: "A synthetic technology node for testing.",
  metric: { label: "TRL", value: 5 },
  gap: "critical",
};

const syntheticConfig: TrajectoryConfig = {
  drivers: [
    { key: "drvA", label: "Driver A" },
    { key: "drvB", label: "Driver B" },
  ],
  layers: [
    { key: "lyr1", label: "Layer 1", order: 1 },
    { key: "lyr2", label: "Layer 2", order: 2 },
    { key: "lyr3", label: "Layer 3", order: 3 },
    { key: "lyr4", label: "Layer 4", order: 4 },
  ],
  horizonBuckets: [
    { key: "ahora", label: "Now", order: 1 },
    { key: "corto", label: "Short", order: 2 },
    { key: "medio1", label: "Mid 1", order: 3 },
    { key: "medio2", label: "Mid 2", order: 4 },
    { key: "largo", label: "Long", order: 5 },
  ],
  colorFor: (item) => (item.gap === "critical" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"),
  labelFor: (item) => item.title,
  metricBadge: (item) => (item.metric ? `${item.metric.label} ${item.metric.value}` : null),
};

// ── Helper: renders node with provider ───────────────────────────────────────

function renderNode(item: TrajectoryItem, overrides: Partial<TrajectoryConfig> = {}, onSelect?: (item: TrajectoryItem) => void) {
  const config = { ...syntheticConfig, ...overrides };
  return render(
    <TrajectoryProvider config={config}>
      <TrajectoryNode item={item} onSelect={onSelect} />
    </TrajectoryProvider>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("TrajectoryNode", () => {
  it("renders as a button element", () => {
    renderNode(syntheticItem);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("displays the item title via labelFor", () => {
    renderNode(syntheticItem);
    expect(screen.getByText("Quantum Mesh")).toBeInTheDocument();
  });

  it("has a descriptive aria-label containing layer, horizon, and title", () => {
    renderNode(syntheticItem);
    const btn = screen.getByRole("button");
    const label = btn.getAttribute("aria-label") ?? "";
    expect(label).toContain("Layer 1");  // layer label
    expect(label).toContain("Short");    // horizon label
    expect(label).toContain("Quantum Mesh"); // title
  });

  it("applies colorFor class from config to the button", () => {
    renderNode(syntheticItem);
    const btn = screen.getByRole("button");
    // The item has gap: "critical" → colorFor returns "bg-red-100 text-red-800"
    expect(btn.className).toMatch(/bg-red-100/);
  });

  it("shows metricBadge when config.metricBadge returns a string", () => {
    renderNode(syntheticItem);
    expect(screen.getByText("TRL 5")).toBeInTheDocument();
  });

  it("does NOT show metricBadge when metricBadge returns null", () => {
    const itemNoMetric: TrajectoryItem = { ...syntheticItem, metric: undefined };
    renderNode(itemNoMetric);
    expect(screen.queryByText(/TRL/)).toBeNull();
  });

  it("does NOT show metricBadge when config.metricBadge is undefined", () => {
    // Pass a complete config with metricBadge explicitly set to undefined
    renderNode(syntheticItem, { metricBadge: undefined });
    expect(screen.queryByText(/TRL/)).toBeNull();
  });

  it("calls onSelect with the item when clicked", () => {
    const onSelect = vi.fn();
    renderNode(syntheticItem, {}, onSelect);
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(syntheticItem);
  });

  it("does not throw when onSelect is not provided", () => {
    renderNode(syntheticItem);
    expect(() => fireEvent.click(screen.getByRole("button"))).not.toThrow();
  });

  it("aria-label contains the state/gap when item has gap", () => {
    renderNode(syntheticItem);
    const btn = screen.getByRole("button");
    const label = btn.getAttribute("aria-label") ?? "";
    expect(label).toContain("critical");
  });

  it("renders a gap indicator dot for gap='critica'", () => {
    const itemCritica: TrajectoryItem = { ...syntheticItem, gap: "critica" };
    renderNode(itemCritica);
    // The dot has title="Brecha Crítica" and aria-hidden
    const dot = document.querySelector('[title="Brecha Crítica"]');
    expect(dot).toBeInTheDocument();
  });

  it("renders a gap indicator dot for gap='alta'", () => {
    const itemAlta: TrajectoryItem = { ...syntheticItem, gap: "alta" };
    renderNode(itemAlta);
    const dot = document.querySelector('[title="Brecha Alta"]');
    expect(dot).toBeInTheDocument();
  });

  it("does NOT render a gap dot for gaps without a configured severity", () => {
    const itemModerate: TrajectoryItem = { ...syntheticItem, gap: "moderada" };
    renderNode(itemModerate);
    expect(document.querySelector('[title="Brecha Crítica"]')).toBeNull();
    expect(document.querySelector('[title="Brecha Alta"]')).toBeNull();
  });

  it("has aria-pressed=true when selected prop is true", () => {
    const config = { ...syntheticConfig };
    render(
      <TrajectoryProvider config={config}>
        <TrajectoryNode item={syntheticItem} selected={true} />
      </TrajectoryProvider>
    );
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true");
  });

  it("has aria-pressed=false when selected prop is false (default)", () => {
    renderNode(syntheticItem);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("false");
  });
});
