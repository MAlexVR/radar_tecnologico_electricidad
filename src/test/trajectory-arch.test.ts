/**
 * Architectural test: verifies that neither `src/lib/trajectory/**`
 * nor `src/components/trajectory/**` import any forbidden domain symbols.
 *
 * Forbidden imports:
 *   - @/lib/radar-data
 *   - @/lib/trajectory-data.electricidad
 *   - next-intl
 *
 * NOTE: `@/core` is NOT forbidden here because the destination project
 * does not use that path. The engine must remain domain-agnostic regardless.
 *
 * Allowed:
 *   - `import type` from React (structural/type-only)
 *   - Internal imports within the trajectory engine itself
 */

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Recursively collects all .ts/.tsx files under a directory.
 * Uses path.join for cross-platform compatibility (Windows safe).
 */
function collectFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Returns all non-type import lines from a file's content.
 * Excludes `import type` lines as they carry no runtime coupling.
 * Also excludes comment lines.
 */
function extractRuntimeImports(content: string): string[] {
  return content
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      // Skip blank lines and comments
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*")) {
        return false;
      }
      // Only consider actual import statements
      return trimmed.startsWith("import ");
    })
    .filter((line) => {
      // Exclude `import type` — no runtime coupling
      return !line.trim().startsWith("import type");
    });
}

// ── Forbidden patterns ────────────────────────────────────────────────────────

const FORBIDDEN = [
  "@/lib/radar-data",
  "@/lib/trajectory-data.electricidad",
  "next-intl",
];

// ── Directories under test ────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const TRAJECTORY_LIB = path.join(PROJECT_ROOT, "src", "lib", "trajectory");
const TRAJECTORY_UI = path.join(PROJECT_ROOT, "src", "components", "trajectory");

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Architecture: trajectory engine isolation", () => {
  describe("src/lib/trajectory — no domain imports", () => {
    const libFiles = collectFiles(TRAJECTORY_LIB).filter(
      // Exclude test files themselves from the check (they may import test helpers)
      (f) => !f.endsWith(".test.ts") && !f.endsWith(".test.tsx")
    );

    it("should find at least one library file to check", () => {
      expect(libFiles.length).toBeGreaterThan(0);
    });

    for (const forbidden of FORBIDDEN) {
      it(`should NOT import "${forbidden}" in any lib file`, () => {
        const violations: string[] = [];
        for (const file of libFiles) {
          const content = fs.readFileSync(file, "utf-8");
          const imports = extractRuntimeImports(content);
          const matching = imports.filter((line) => line.includes(forbidden));
          if (matching.length > 0) {
            violations.push(
              `${path.relative(PROJECT_ROOT, file)}:\n  ${matching.join("\n  ")}`
            );
          }
        }
        if (violations.length > 0) {
          throw new Error(
            `Forbidden import "${forbidden}" found in lib files:\n\n${violations.join("\n\n")}`
          );
        }
        expect(violations).toHaveLength(0);
      });
    }
  });

  describe("src/components/trajectory — no domain imports", () => {
    const uiFiles = collectFiles(TRAJECTORY_UI).filter(
      (f) => !f.endsWith(".test.ts") && !f.endsWith(".test.tsx")
    );

    it("should find at least one UI file to check", () => {
      // The motor has been ported — the directory must have component files.
      expect(uiFiles.length).toBeGreaterThan(0);
    });

    for (const forbidden of FORBIDDEN) {
      it(`should NOT import "${forbidden}" in any UI component file`, () => {
        const violations: string[] = [];
        for (const file of uiFiles) {
          const content = fs.readFileSync(file, "utf-8");
          const imports = extractRuntimeImports(content);
          const matching = imports.filter((line) => line.includes(forbidden));
          if (matching.length > 0) {
            violations.push(
              `${path.relative(PROJECT_ROOT, file)}:\n  ${matching.join("\n  ")}`
            );
          }
        }
        if (violations.length > 0) {
          throw new Error(
            `Forbidden import "${forbidden}" found in UI files:\n\n${violations.join("\n\n")}`
          );
        }
        expect(violations).toHaveLength(0);
      });
    }
  });
});
