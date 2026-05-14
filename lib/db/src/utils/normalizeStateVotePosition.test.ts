import { describe, expect, it } from "vitest";
import { normalizeStateVotePosition } from "./normalizeStateVotePosition";

describe("normalizeStateVotePosition", () => {
  it("normalizes OpenStates vote position variants", () => {
    expect(normalizeStateVotePosition("yes")).toBe("Yea");
    expect(normalizeStateVotePosition("no")).toBe("Nay");
    expect(normalizeStateVotePosition("excused")).toBe("Not Voting");
    expect(normalizeStateVotePosition("present")).toBe("Present");
  });

  it("returns Other for missing or unrecognized values", () => {
    expect(normalizeStateVotePosition(undefined)).toBe("Other");
    expect(normalizeStateVotePosition("paired")).toBe("Other");
  });
});
