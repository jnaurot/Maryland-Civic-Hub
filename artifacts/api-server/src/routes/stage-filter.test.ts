import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseStageQuery } from "../lib/legislationStages";

function federalSource(): string {
  return readFileSync(resolve(import.meta.dirname, "federal.ts"), "utf8");
}

function stateSource(): string {
  return readFileSync(resolve(import.meta.dirname, "state.ts"), "utf8");
}

// ─── parseStageQuery unit tests ──────────────────────────────────────────────

describe("parseStageQuery", () => {
  it("parses a single valid stage key", () => {
    expect(parseStageQuery("signed_enacted")).toEqual(["signed_enacted"]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseStageQuery("")).toEqual([]);
  });

  it("returns an empty array for null", () => {
    expect(parseStageQuery(null)).toEqual([]);
  });

  it("silently drops unknown stage names", () => {
    expect(parseStageQuery("signed_enacted,unknown_stage")).toEqual(["signed_enacted"]);
  });

  it("handles all valid stage keys", () => {
    expect(parseStageQuery("introduced")).toEqual(["introduced"]);
    expect(parseStageQuery("committee")).toEqual(["committee"]);
    expect(parseStageQuery("floor_vote")).toEqual(["floor_vote"]);
    expect(parseStageQuery("passed")).toEqual(["passed"]);
    expect(parseStageQuery("signed_enacted")).toEqual(["signed_enacted"]);
    expect(parseStageQuery("dead")).toEqual(["dead"]);
  });

  it("trims whitespace around stage names", () => {
    expect(parseStageQuery(" signed_enacted ")).toEqual(["signed_enacted"]);
  });
});

// ─── Federal bills list route (GET /federal/bills) stage integration ──────────

describe("GET /federal/bills — stage filtering integration", () => {
  const src = federalSource();

  it("GetFederalBillsQueryParams is parsed and stages is destructured", () => {
    expect(src).toContain("const { chamber, policyArea, offset, limit, stages } = parsed.data;");
  });

  it("stages are parsed into selectedStages via parseStageQuery", () => {
    expect(src).toContain("const selectedStages = parseStageQuery(stages);");
  });

  it("a stageCondition is built when selectedStages are present", () => {
    expect(src).toContain(
      "federalBillStageConditions(selectedStages, federalBillsTable.latestAction)",
    );
  });

  it("stageCondition is spread into dbConditions", () => {
    expect(src).toContain("...(stageCondition ? [stageCondition] : []),");
  });

  it("stage filtering forces the DB path (skips Congress.gov API)", () => {
    expect(src).toContain("selectedStages.length > 0");
  });

  it("stages value is included in the response log", () => {
    expect(src).toContain("stages,");
  });
});

// ─── federalBillStageConditions SQL patterns ──────────────────────────────────

describe("federalBillStageConditions — SQL regex patterns", () => {
  const src = federalSource();

  it("signed_enacted pattern covers relevant action text", () => {
    expect(src).toContain(
      "signed|became public law|became law|public law|enacted|approved by the governor",
    );
  });

  it("passed pattern guards against 'not agreed to' false positive", () => {
    expect(src).toContain("not (coalesce(${col}, '') ~* ${NOT_AGREED_TO})");
  });

  it("dead stage matches 'not agreed to' as well as explicit dead keywords", () => {
    expect(src).toContain("coalesce(${col}, '') ~* ${NOT_AGREED_TO}");
    expect(src).toContain("died|dead|failed|vetoed|tabled indefinitely|indefinitely postponed|withdrawn");
  });

  it("committee pattern covers referred and reported", () => {
    expect(src).toContain("committee|referred|reported");
  });

  it("floor_vote pattern uses word-boundary anchors", () => {
    // Source file stores the string as "\\m..." (escaped), so readFileSync sees two backslashes.
    expect(src).toContain("\\\\m(roll|yea|nay|vote|floor)\\\\M|agreed to");
  });
});

// ─── State bills list route (GET /state/bills) stage integration ─────────────

describe("GET /state/bills — stage filtering integration", () => {
  const src = stateSource();

  it("GetStateBillsQueryParams includes stages field", () => {
    // stages is parsed from the query params object
    expect(src).toContain("stages");
  });

  it("state bills route builds a stageCondition from selectedStages", () => {
    expect(src).toContain("stateStageColumn");
  });

  it("state route includes stage boolean columns in DB conditions", () => {
    expect(src).toContain("stageIntroduced");
    expect(src).toContain("stageCommittee");
    expect(src).toContain("stageFloorVote");
    expect(src).toContain("stagePassed");
    expect(src).toContain("stageSignedEnacted");
    expect(src).toContain("stageDead");
  });
});

// ─── State bills search route (GET /state/bills/search) stage integration ────

describe("GET /state/bills/search — stage filtering integration", () => {
  const src = stateSource();

  it("search route parses selectedStages from query params", () => {
    expect(src).toContain("parseStageQuery(stages)");
  });

  it("search route builds a stageCondition from selectedStages", () => {
    expect(src).toContain("stateStageColumn(stage)");
  });

  it("search route includes stageCondition in conditions array", () => {
    expect(src).toContain("...(stageCondition ? [stageCondition] : [])");
  });

  it("OpenStates fallback applies stage filtering in memory when stages are active", () => {
    expect(src).toContain("computeLegislationStageFlags");
    expect(src).toContain("selectedStages.some((stage) => flags[stage])");
  });
});
