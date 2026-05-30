/**
 * Chamber-aware legislative stage computation.
 *
 * For bicameral legislatures, a stage is only "complete" when both
 * chambers have cleared it. The "current" stage is the first stage
 * that is not yet complete, annotated with the chamber that is
 * blocking (or "both" if neither has cleared it).
 */

export type Chamber = "lower" | "upper" | "executive";

export type StageKey =
  | "introduced"
  | "committee"
  | "floorVote"
  | "passed"
  | "signed"
  | "dead";

export interface ChamberAwareStages {
  /** Stages fully complete in both chambers */
  completed: StageKey[];
  /** The current blocking stage (first incomplete) */
  current: StageKey | null;
  /** Which chamber is blocking at the current stage */
  currentChamber: Chamber | "both" | null;
  /** True if the bill is dead */
  dead: boolean;
}

interface BillAction {
  date?: string;
  text?: string;
  type?: string;
  organizationClassification?: string;
}

/** Map an action's org classification to a chamber */
function classifyActionChamber(action: BillAction): Chamber | null {
  const c = action.organizationClassification?.toLowerCase();
  if (c === "lower") return "lower";
  if (c === "upper") return "upper";
  if (c === "executive") return "executive";
  return null;
}

/** Determine whether a chamber has cleared the floor-vote stage */
function chamberHadFloorVote(
  actions: BillAction[],
  chamber: Chamber,
): boolean {
  if (chamber === "executive") return false;
  return actions.some((a) => {
    if (classifyActionChamber(a) !== chamber) return false;
    const type = a.type?.toLowerCase() ?? "";
    const text = a.text?.toLowerCase() ?? "";
    return (
      type === "passage" ||
      /third reading passed|second reading passed|favorable adopted second reading passed/i.test(
        text,
      )
    );
  });
}

/** Determine whether a chamber has cleared the "passed" stage */
function chamberPassedBill(
  actions: BillAction[],
  chamber: Chamber,
): boolean {
  if (chamber === "executive") return false;
  return actions.some((a) => {
    if (classifyActionChamber(a) !== chamber) return false;
    const text = a.text?.toLowerCase() ?? "";
    return /passed|adopted|agreed to|returned passed/i.test(text);
  });
}

/** Determine whether a chamber has cleared the committee stage */
function chamberPassedCommittee(
  actions: BillAction[],
  chamber: Chamber,
): boolean {
  if (chamber === "executive") return false;
  // Explicit favorable report
  const hasFavorable = actions.some((a) => {
    if (classifyActionChamber(a) !== chamber) return false;
    const type = a.type?.toLowerCase() ?? "";
    const text = a.text?.toLowerCase() ?? "";
    return (
      type.includes("committee-passage") ||
      type.includes("favorable") ||
      /favorable report|committee passage/i.test(text)
    );
  });
  // Implicit: if chamber has reached floor vote or passed, committee is cleared
  const hasFloorOrPassed =
    chamberHadFloorVote(actions, chamber) || chamberPassedBill(actions, chamber);
  return hasFavorable || hasFloorOrPassed;
}

/** Determine whether the bill has been signed/enacted */
function isSignedOrEnacted(actions: BillAction[]): boolean {
  return actions.some((a) => {
    const type = a.type?.toLowerCase() ?? "";
    const text = a.text?.toLowerCase() ?? "";
    return (
      type === "executive-signature" ||
      /signed by governor|approved by the governor|became law/i.test(text)
    );
  });
}

/** Determine whether the bill is dead */
function isDead(actions: BillAction[]): boolean {
  const allText = actions.map((a) => a.text?.toLowerCase() ?? "").join(" ");
  return (
    /\bnot agreed to\b/i.test(allText) ||
    /died|dead|failed|vetoed|tabled indefinitely|indefinitely postponed|withdrawn/i.test(
      allText,
    )
  );
}

/**
 * Compute chamber-aware stages from a bill's action history.
 */
export function computeChamberAwareStages(
  actions: BillAction[],
): ChamberAwareStages {
  const dead = isDead(actions);

  const lowerPassedCommittee = chamberPassedCommittee(actions, "lower");
  const upperPassedCommittee = chamberPassedCommittee(actions, "upper");
  const committeeComplete = lowerPassedCommittee && upperPassedCommittee;

  const lowerHadFloorVote = chamberHadFloorVote(actions, "lower");
  const upperHadFloorVote = chamberHadFloorVote(actions, "upper");
  const floorVoteComplete = lowerHadFloorVote && upperHadFloorVote;

  const lowerPassed = chamberPassedBill(actions, "lower");
  const upperPassed = chamberPassedBill(actions, "upper");
  const passedComplete = lowerPassed && upperPassed;

  const signed = isSignedOrEnacted(actions);

  const completed: StageKey[] = ["introduced"];
  if (committeeComplete) completed.push("committee");
  if (floorVoteComplete) completed.push("floorVote");
  if (passedComplete) completed.push("passed");
  if (signed) completed.push("signed");

  // When dead, nothing is currently happening
  if (dead) {
    return { completed, current: null, currentChamber: null, dead };
  }

  // Determine current blocking stage
  let current: StageKey | null = null;
  let currentChamber: Chamber | "both" | null = null;

  if (!committeeComplete) {
    current = "committee";
    if (!lowerPassedCommittee && !upperPassedCommittee) {
      currentChamber = "both";
    } else if (!lowerPassedCommittee) {
      currentChamber = "lower";
    } else {
      currentChamber = "upper";
    }
  } else if (!floorVoteComplete) {
    current = "floorVote";
    if (!lowerHadFloorVote && !upperHadFloorVote) {
      currentChamber = "both";
    } else if (!lowerHadFloorVote) {
      currentChamber = "lower";
    } else {
      currentChamber = "upper";
    }
  } else if (!passedComplete) {
    current = "passed";
    if (!lowerPassed && !upperPassed) {
      currentChamber = "both";
    } else if (!lowerPassed) {
      currentChamber = "lower";
    } else {
      currentChamber = "upper";
    }
  } else if (!signed) {
    current = "signed";
    currentChamber = "executive";
  }

  return { completed, current, currentChamber, dead };
}
