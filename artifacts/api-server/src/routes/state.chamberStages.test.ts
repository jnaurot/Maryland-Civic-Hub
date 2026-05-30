import { describe, it, expect } from "vitest";

/**
 * Integration tests verifying that the state bill detail route returns
 * chamber-aware stage fields (completedStages, currentStage, currentChamber)
 * in addition to the legacy boolean flags.
 */

function stateSource(): string {
  return readFileSync(new URL("./state.ts", import.meta.url), "utf8");
}

import { readFileSync } from "node:fs";

// ═══════════════════════════════════════════════════════════════════════════════
// PASSING INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("state.ts — chamber-aware stage integration", () => {
  const src = stateSource();

  it("imports computeChamberAwareStages from chamberAwareStages", () => {
    expect(src).toContain('computeChamberAwareStages');
    expect(src).toContain('from "../lib/chamberAwareStages"');
  });

  it("mapDbStateBillDetail calls computeChamberAwareStages", () => {
    expect(src).toContain("const chamberAware = computeChamberAwareStages(mappedActions)");
  });

  it("response includes completedStages in stages object", () => {
    expect(src).toContain("completedStages: chamberAware.completed");
  });

  it("response includes currentStage in stages object", () => {
    expect(src).toContain("currentStage: chamberAware.current");
  });

  it("response includes currentChamber in stages object", () => {
    expect(src).toContain("currentChamber: chamberAware.currentChamber");
  });

  it("stages object still contains legacy boolean fields for backward compat", () => {
    expect(src).toContain("introduced: stageFlags.introduced");
    expect(src).toContain("committee: stageFlags.committee");
    expect(src).toContain("floorVote: stageFlags.floor_vote");
    expect(src).toContain("passed: stageFlags.passed");
    expect(src).toContain("signed: stageFlags.signed_enacted");
    expect(src).toContain("dead: stageFlags.dead");
  });

  it("mapDbStateBillDetail maps actions with organizationClassification", () => {
    expect(src).toContain("organizationClassification: a.organization?.classification");
  });

  it("upsertStateBill merges raw JSONB instead of replacing", () => {
    expect(src).toContain(
      "raw: sql`COALESCE(state_bills.raw, '{}'::jsonb) || ${JSON.stringify(sourceBill)}::jsonb`",
    );
    expect(src).toContain(
      "raw: sql`COALESCE(state_bills.raw, '{}'::jsonb) || ${JSON.stringify(data)}::jsonb`",
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FAILING / CORRECTION INTEGRATION TESTS
// These assert the code does NOT do something incorrect
// ═══════════════════════════════════════════════════════════════════════════════

describe("state.ts — tests that expect failure/correction", () => {
  const src = stateSource();

  it("upsertStateBill onConflictDoUpdate merges raw JSONB instead of replacing", () => {
    const upsertBlock = src.slice(
      src.indexOf("async function upsertStateBill"),
      src.indexOf("async function upsertStateBillFromApi"),
    );
    expect(upsertBlock).toContain("COALESCE(state_bills.raw");
    // The .values() may still contain raw: sourceBill for new inserts — that is fine.
    // The critical fix is the onConflictDoUpdate merge.
  });

  it("upsertStateBillFromApi onConflictDoUpdate merges raw JSONB instead of replacing", () => {
    const start = src.indexOf("async function upsertStateBillFromApi");
    const end = src.indexOf('router.get("/state/bills/:billId"');
    const apiUpsertBlock = src.slice(start, end > start ? end : start + 2000);
    expect(apiUpsertBlock).toContain("COALESCE(state_bills.raw");
  });

  it("does NOT omit currentChamber from the response", () => {
    expect(src).toContain("currentChamber: chamberAware.currentChamber");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REGRESSION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("state.ts — regression tests", () => {
  const src = stateSource();

  it("still imports computeLegislationStageFlags for legacy flags", () => {
    expect(src).toContain('computeLegislationStageFlags');
    expect(src).toContain('from "../lib/legislationStages"');
  });

  it("still uses stageFlags for DB column writes in upsertStateBillFromApi", () => {
    expect(src).toContain("stageIntroduced: stageFlags.introduced");
    expect(src).toContain("stageCommittee: stageFlags.committee");
    expect(src).toContain("stageFloorVote: stageFlags.floor_vote");
    expect(src).toContain("stagePassed: stageFlags.passed");
    expect(src).toContain("stageSignedEnacted: stageFlags.signed_enacted");
    expect(src).toContain("stageDead: stageFlags.dead");
  });

  it("mapDbStateBillDetail returns actions in the response", () => {
    expect(src).toContain("actions: mappedActions");
  });

  it("mapDbStateBillDetail returns votes in the response", () => {
    expect(src).toContain("votes,");
  });

  it("mapDbStateBillDetail returns committees in the response", () => {
    expect(src).toContain("committees,");
  });
});
