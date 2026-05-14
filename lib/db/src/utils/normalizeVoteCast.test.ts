import { describe, expect, it } from "vitest";
import { normalizeVoteCast } from "./normalizeVoteCast";

describe("normalizeVoteCast", () => {
  it("normalizes common yes/no/present/not-voting values", () => {
    expect(normalizeVoteCast("Aye")).toBe("Yea");
    expect(normalizeVoteCast("No")).toBe("Nay");
    expect(normalizeVoteCast("Present")).toBe("Present");
    expect(normalizeVoteCast("Not Voting")).toBe("Not Voting");
  });

  it("preserves unknown values and handles empty input", () => {
    expect(normalizeVoteCast("Paired")).toBe("Paired");
    expect(normalizeVoteCast(null)).toBe("");
  });
});
