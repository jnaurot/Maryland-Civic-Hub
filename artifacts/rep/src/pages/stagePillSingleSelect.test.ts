import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BILL_STAGE_OPTIONS = [
  "Introduced",
  "Committee",
  "Floor Vote",
  "Passed",
  "Signed/Enacted",
  "Dead",
] as const;

type BillStage = (typeof BILL_STAGE_OPTIONS)[number];

const BILL_STAGE_QUERY_KEYS: Record<BillStage, string> = {
  Introduced: "introduced",
  Committee: "committee",
  "Floor Vote": "floor_vote",
  Passed: "passed",
  "Signed/Enacted": "signed_enacted",
  Dead: "dead",
};

const pagesDir = resolve(import.meta.dirname);

function pageSource(filename: string): string {
  return readFileSync(resolve(pagesDir, filename), "utf8");
}

// ─── Single-select toggle reducer (logic extracted from all 4 pages) ──────────

// This is the exact reducer used in every onToggleStage handler.
function singleSelectToggle(prev: BillStage[], stage: BillStage): BillStage[] {
  return prev.includes(stage) ? [] : [stage];
}

describe("singleSelectToggle — single-select reducer behaviour", () => {
  it("selecting a stage from empty state returns [stage]", () => {
    expect(singleSelectToggle([], "Passed")).toEqual(["Passed"]);
  });

  it("selecting a different stage replaces the current selection", () => {
    expect(singleSelectToggle(["Passed"], "Signed/Enacted")).toEqual(["Signed/Enacted"]);
  });

  it("selecting the currently active stage deselects it (returns [])", () => {
    expect(singleSelectToggle(["Committee"], "Committee")).toEqual([]);
  });

  it("result never contains more than one stage", () => {
    for (const first of BILL_STAGE_OPTIONS) {
      for (const second of BILL_STAGE_OPTIONS) {
        const result = singleSelectToggle([first], second);
        expect(result.length).toBeLessThanOrEqual(1);
      }
    }
  });

  it("result is always a subset of BILL_STAGE_OPTIONS", () => {
    for (const stage of BILL_STAGE_OPTIONS) {
      const selected = singleSelectToggle([], stage);
      expect(BILL_STAGE_OPTIONS).toContain(selected[0] ?? stage);
    }
  });
});

// ─── BILL_STAGE_QUERY_KEYS maps every display name to exactly one API key ────

describe("BILL_STAGE_QUERY_KEYS", () => {
  it("every display stage has a corresponding API key", () => {
    for (const stage of BILL_STAGE_OPTIONS) {
      expect(BILL_STAGE_QUERY_KEYS[stage]).toBeDefined();
      expect(typeof BILL_STAGE_QUERY_KEYS[stage]).toBe("string");
    }
  });

  it("API keys are the snake_case names accepted by the server", () => {
    expect(BILL_STAGE_QUERY_KEYS["Signed/Enacted"]).toBe("signed_enacted");
    expect(BILL_STAGE_QUERY_KEYS["Floor Vote"]).toBe("floor_vote");
    expect(BILL_STAGE_QUERY_KEYS["Passed"]).toBe("passed");
    expect(BILL_STAGE_QUERY_KEYS["Committee"]).toBe("committee");
    expect(BILL_STAGE_QUERY_KEYS["Introduced"]).toBe("introduced");
    expect(BILL_STAGE_QUERY_KEYS["Dead"]).toBe("dead");
  });

  it("a single-selected stage produces a single-segment stages query param", () => {
    for (const stage of BILL_STAGE_OPTIONS) {
      const selected: BillStage[] = [stage];
      const queryParam = selected.map((s) => BILL_STAGE_QUERY_KEYS[s]).join(",");
      expect(queryParam).not.toContain(",");
      expect(queryParam).toBe(BILL_STAGE_QUERY_KEYS[stage]);
    }
  });
});

// ─── Regression: all 4 page files use the single-select pattern ───────────────

const PAGE_FILES = [
  "FederalBills.tsx",
  "StateBills.tsx",
  "FederalRepDetail.tsx",
  "StateRepDetail.tsx",
] as const;

// The single-select pattern: prev.includes(stage) ? [] : [stage]
// Multi-select would be: [...prev, stage]
const SINGLE_SELECT_PATTERN = /prev\.includes\(stage\)\s*\?\s*\[\]\s*:\s*\[stage\]/;
const MULTI_SELECT_PATTERN = /\[\.\.\.prev,\s*stage\]/;

describe("Regression: stage pill toggle is single-select in all pages", () => {
  for (const file of PAGE_FILES) {
    it(`${file} uses single-select toggle (prev.includes(stage) ? [] : [stage])`, () => {
      const src = pageSource(file);
      expect(SINGLE_SELECT_PATTERN.test(src)).toBe(true);
    });

    it(`${file} does NOT use multi-select accumulation ([...prev, stage])`, () => {
      const src = pageSource(file);
      expect(MULTI_SELECT_PATTERN.test(src)).toBe(false);
    });
  }
});

// ─── Regression: stageQuery is always a single-item string ───────────────────

describe("Regression: stageQuery computation from single selectedStages", () => {
  it("joining a single-element selectedStages array produces no comma", () => {
    const selected: BillStage[] = ["Signed/Enacted"];
    const stageQuery = selected.map((s) => BILL_STAGE_QUERY_KEYS[s]).join(",");
    expect(stageQuery).toBe("signed_enacted");
    expect(stageQuery.includes(",")).toBe(false);
  });

  it("an empty selectedStages array produces an empty stageQuery (no filter sent)", () => {
    const selected: BillStage[] = [];
    const stageQuery = selected.map((s) => BILL_STAGE_QUERY_KEYS[s]).join(",");
    expect(stageQuery).toBe("");
  });
});
