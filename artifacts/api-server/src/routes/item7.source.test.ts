/**
 * Source guard tests for item 7 — expose stage flags; remove frontend re-derivation.
 *
 * The state bill detail endpoint already computes stageFlags but does NOT include them
 * in the JSON response. The frontend StateBillProgressBar re-derives stages from raw
 * action text. After the fix:
 *   - state.ts bill detail response includes a `stages` object
 *   - openapi.yaml StateBillDetail schema includes `stages`
 *   - StateBillProgressBar accepts a `stages` prop and does NOT re-derive from action text
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const stateSrc = readFileSync(resolve(import.meta.dirname, "./state.ts"), "utf8");

const stateBillDetailSrc = readFileSync(
  resolve(import.meta.dirname, "../../../rep/src/pages/StateBillDetail.tsx"),
  "utf8",
);

const openApiSrc = readFileSync(
  resolve(import.meta.dirname, "../../../../lib/api-spec/openapi.yaml"),
  "utf8",
);

// ── state.ts — bill detail response ──────────────────────────────────────────

describe("state.ts source guards — item 7 stage flags in response", () => {
  it("state bill detail res.json includes a stages property", () => {
    // The JSON response returned by the /state/bills/:billId route must include stages.
    expect(stateSrc).toMatch(/return res\.json\([\s\S]{0,6000}stages:/);
  });
});

// ── openapi.yaml ──────────────────────────────────────────────────────────────

describe("openapi.yaml source guards — StateBillDetail has stages", () => {
  it("StateBillDetail schema includes a stages property", () => {
    expect(openApiSrc).toMatch(/StateBillDetail:[\s\S]{0,2000}stages:/);
  });
});

// ── StateBillDetail.tsx — frontend progress bar ───────────────────────────────

describe("StateBillDetail.tsx source guards — item 7 no inline re-derivation", () => {
  it("StateBillProgressBar does not derive stages from action texts inline", () => {
    // The old pattern: compute stages by scanning action text with .some(...)
    // After the fix, the component reads from a `stages` prop instead.
    expect(stateBillDetailSrc).not.toContain("actionTexts.some(");
  });

  it("StateBillProgressBar signature accepts a stages parameter", () => {
    expect(stateBillDetailSrc).toMatch(/StateBillProgressBar.*\{[\s\S]{0,200}stages/);
  });

  it("StateBillProgressBar no longer builds actionTexts from actions array", () => {
    // Old code: const actionTexts = (actions ?? []).map(...)
    // After fix: this variable should be gone from StateBillProgressBar
    expect(stateBillDetailSrc).not.toMatch(
      /StateBillProgressBar[\s\S]{0,600}actionTexts\s*=/,
    );
  });
});
