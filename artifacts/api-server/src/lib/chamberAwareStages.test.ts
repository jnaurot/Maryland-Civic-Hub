import { describe, it, expect } from "vitest";
import {
  computeChamberAwareStages,
  type ChamberAwareStages,
  type StageKey,
} from "./chamberAwareStages";

// ─── Helper: build minimal action ────────────────────────────────────────────
function action(
  text: string,
  type?: string,
  org?: string,
): { text: string; type?: string; organizationClassification?: string } {
  return { text, type, organizationClassification: org };
}

function expectStages(
  result: ChamberAwareStages,
  expected: {
    completed: StageKey[];
    current: StageKey | null;
    currentChamber: string | null;
    dead: boolean;
  },
) {
  expect(result.completed).toEqual(expected.completed);
  expect(result.current).toBe(expected.current);
  expect(result.currentChamber).toBe(expected.currentChamber);
  expect(result.dead).toBe(expected.dead);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PASSING INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("computeChamberAwareStages — passing integration tests", () => {
  it("freshly-introduced bill: only introduced complete, committee is current (both)", () => {
    const result = computeChamberAwareStages([
      action("First Reading Economic Matters", "referral-committee", "lower"),
    ]);
    expectStages(result, {
      completed: ["introduced"],
      current: "committee",
      currentChamber: "both",
      dead: false,
    });
  });

  it("house cleared committee, senate still in committee: current is committee (upper)", () => {
    const result = computeChamberAwareStages([
      action("First Reading Economic Matters", "referral-committee", "lower"),
      action(
        "Favorable Report by Economic Matters",
        "committee-passage-favorable",
        "lower",
      ),
    ]);
    expectStages(result, {
      completed: ["introduced"],
      current: "committee",
      currentChamber: "upper",
      dead: false,
    });
  });

  it("both chambers cleared committee: current is floorVote (both)", () => {
    const result = computeChamberAwareStages([
      action("First Reading Economic Matters", "referral-committee", "lower"),
      action(
        "Favorable Report by Economic Matters",
        "committee-passage-favorable",
        "lower",
      ),
      action("Referred Finance", "referral-committee", "upper"),
      action(
        "Favorable Report by Finance",
        "committee-passage-favorable",
        "upper",
      ),
    ]);
    expectStages(result, {
      completed: ["introduced", "committee"],
      current: "floorVote",
      currentChamber: "both",
      dead: false,
    });
  });

  it("house passed floor vote, senate has not: current is floorVote (upper)", () => {
    const result = computeChamberAwareStages([
      action(
        "Favorable Report by Economic Matters",
        "committee-passage-favorable",
        "lower",
      ),
      action(
        "Favorable Report by Finance",
        "committee-passage-favorable",
        "upper",
      ),
      action("Third Reading Passed", "passage", "lower"),
    ]);
    expectStages(result, {
      completed: ["introduced", "committee"],
      current: "floorVote",
      currentChamber: "upper",
      dead: false,
    });
  });

  it("both chambers had floor votes: both floorVote and passed are complete", () => {
    // "Third Reading Passed" is both floor vote AND passage in most legislatures
    const result = computeChamberAwareStages([
      action(
        "Favorable Report by Economic Matters",
        "committee-passage-favorable",
        "lower",
      ),
      action(
        "Favorable Report by Finance",
        "committee-passage-favorable",
        "upper",
      ),
      action("Third Reading Passed", "passage", "lower"),
      action("Third Reading Passed", "passage", "upper"),
    ]);
    expectStages(result, {
      completed: ["introduced", "committee", "floorVote", "passed"],
      current: "signed",
      currentChamber: "executive",
      dead: false,
    });
  });

  it("both chambers passed: current is signed (executive)", () => {
    const result = computeChamberAwareStages([
      action("Third Reading Passed", "passage", "lower"),
      action("Third Reading Passed", "passage", "upper"),
      action("Returned Passed", undefined, "lower"),
      action("Returned Passed", undefined, "upper"),
    ]);
    expectStages(result, {
      completed: ["introduced", "committee", "floorVote", "passed"],
      current: "signed",
      currentChamber: "executive",
      dead: false,
    });
  });

  it("fully enacted: all stages complete, no current stage", () => {
    const result = computeChamberAwareStages([
      action("Third Reading Passed", "passage", "lower"),
      action("Third Reading Passed", "passage", "upper"),
      action(
        "Approved by the Governor - Chapter 514",
        "executive-signature",
        "executive",
      ),
    ]);
    expectStages(result, {
      completed: ["introduced", "committee", "floorVote", "passed", "signed"],
      current: null,
      currentChamber: null,
      dead: false,
    });
  });

  it("dead bill: dead is true, current is null", () => {
    const result = computeChamberAwareStages([
      action("First Reading Economic Matters", "referral-committee", "lower"),
      action("Tabled indefinitely", undefined, "lower"),
    ]);
    expectStages(result, {
      completed: ["introduced"],
      current: null,
      currentChamber: null,
      dead: true,
    });
  });

  it("bill with no actions is introduced only, current committee (both)", () => {
    const result = computeChamberAwareStages([]);
    expectStages(result, {
      completed: ["introduced"],
      current: "committee",
      currentChamber: "both",
      dead: false,
    });
  });

  it("senate cleared committee before house: current is committee (lower)", () => {
    const result = computeChamberAwareStages([
      action("Referred Finance", "referral-committee", "upper"),
      action(
        "Favorable Report by Finance",
        "committee-passage-favorable",
        "upper",
      ),
    ]);
    expectStages(result, {
      completed: ["introduced"],
      current: "committee",
      currentChamber: "lower",
      dead: false,
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FAILING INTEGRATION TESTS (tests that assert the function does NOT do X)
// ═══════════════════════════════════════════════════════════════════════════════

describe("computeChamberAwareStages — tests that expect failure/correction", () => {
  it("does NOT mark committee complete when only one chamber cleared it", () => {
    const result = computeChamberAwareStages([
      action(
        "Favorable Report by Economic Matters",
        "committee-passage-favorable",
        "lower",
      ),
    ]);
    // If the function incorrectly marked committee as complete, this would fail
    expect(result.completed).not.toContain("committee");
    expect(result.current).toBe("committee");
    expect(result.currentChamber).toBe("upper");
  });

  it("does NOT mark floorVote complete when only house voted", () => {
    const result = computeChamberAwareStages([
      action(
        "Favorable Report by Economic Matters",
        "committee-passage-favorable",
        "lower",
      ),
      action(
        "Favorable Report by Finance",
        "committee-passage-favorable",
        "upper",
      ),
      action("Third Reading Passed", "passage", "lower"),
    ]);
    expect(result.completed).not.toContain("floorVote");
    expect(result.current).toBe("floorVote");
    expect(result.currentChamber).toBe("upper");
  });

  it("does NOT mark passed complete when only one chamber passed", () => {
    const result = computeChamberAwareStages([
      action("Third Reading Passed", "passage", "lower"),
      action("Returned Passed", undefined, "lower"),
    ]);
    // Only lower chamber has acted; upper hasn't even cleared committee
    expect(result.completed).not.toContain("passed");
    expect(result.current).toBe("committee");
    expect(result.currentChamber).toBe("upper");
  });

  it("does NOT mark signed complete without executive action", () => {
    const result = computeChamberAwareStages([
      action("Third Reading Passed", "passage", "lower"),
      action("Third Reading Passed", "passage", "upper"),
      action("Returned Passed", undefined, "lower"),
      action("Returned Passed", undefined, "upper"),
    ]);
    expect(result.completed).not.toContain("signed");
    expect(result.current).toBe("signed");
    expect(result.currentChamber).toBe("executive");
  });

  it("does NOT treat referral-to-committee as clearing committee", () => {
    const result = computeChamberAwareStages([
      action("First Reading Economic Matters", "referral-committee", "lower"),
      action("Referred Finance", "referral-committee", "upper"),
    ]);
    // Referral alone should NOT count as clearing committee
    expect(result.completed).not.toContain("committee");
    expect(result.current).toBe("committee");
    expect(result.currentChamber).toBe("both");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REGRESSION TESTS — ensure existing behavior is not broken
// ═══════════════════════════════════════════════════════════════════════════════

describe("computeChamberAwareStages — regression tests", () => {
  it("handles actions with empty text gracefully", () => {
    const result = computeChamberAwareStages([
      { text: "", organizationClassification: "lower" },
    ]);
    expectStages(result, {
      completed: ["introduced"],
      current: "committee",
      currentChamber: "both",
      dead: false,
    });
  });

  it("handles actions with missing organizationClassification", () => {
    const result = computeChamberAwareStages([
      { text: "First Reading" },
      { text: "Favorable Report", type: "committee-passage-favorable" },
    ]);
    // Without chamber classification, neither chamber is considered cleared
    expectStages(result, {
      completed: ["introduced"],
      current: "committee",
      currentChamber: "both",
      dead: false,
    });
  });

  it("preserves order in completed stages", () => {
    const result = computeChamberAwareStages([
      action(
        "Favorable Report by Economic Matters",
        "committee-passage-favorable",
        "lower",
      ),
      action(
        "Favorable Report by Finance",
        "committee-passage-favorable",
        "upper",
      ),
      action("Third Reading Passed", "passage", "lower"),
      action("Third Reading Passed", "passage", "upper"),
      action("Returned Passed", undefined, "lower"),
      action("Returned Passed", undefined, "upper"),
      action(
        "Approved by the Governor",
        "executive-signature",
        "executive",
      ),
    ]);
    expect(result.completed).toEqual([
      "introduced",
      "committee",
      "floorVote",
      "passed",
      "signed",
    ]);
  });

  it("detects 'not agreed to' as dead", () => {
    const result = computeChamberAwareStages([
      action("Not agreed to in Senate", undefined, "upper"),
    ]);
    expect(result.dead).toBe(true);
  });

  it("detects 'vetoed' as dead", () => {
    const result = computeChamberAwareStages([
      action("Vetoed by Governor", undefined, "executive"),
    ]);
    expect(result.dead).toBe(true);
  });
});
