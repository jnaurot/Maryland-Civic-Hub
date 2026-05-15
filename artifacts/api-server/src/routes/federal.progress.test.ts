import { describe, expect, it } from "vitest";
import { computeFederalBillProgress } from "../lib/federalBillProgress";

describe("computeFederalBillProgress", () => {
  it("marks enacted/signed/passed for public law actions", () => {
    const progress = computeFederalBillProgress({
      congress: "119",
      latestAction: "Became Public Law No: 119-27.",
      laws: [{ number: "119-27", type: "Public Law" }],
      actions: [
        { type: "IntroReferral", text: "Introduced in Senate" },
        { type: "Floor", text: "Passed/agreed to in House." },
        { type: "President", text: "Signed by President." },
        { type: "BecameLaw", text: "Became Public Law No: 119-27." },
      ],
    });

    expect(progress.introduced).toBe(true);
    expect(progress.committee).toBe(true);
    expect(progress.floorVote).toBe(true);
    expect(progress.passed).toBe(true);
    expect(progress.signed).toBe(true);
    expect(progress.enacted).toBe(true);
    expect(progress.dead).toBe(false);
  });

  it("marks prior-congress non-enacted bills as dead", () => {
    const progress = computeFederalBillProgress({
      congress: "118",
      latestAction: "Referred to the Committee on Ways and Means.",
      actions: [{ type: "IntroReferral", text: "Introduced in House" }],
    });

    expect(progress.introduced).toBe(true);
    expect(progress.enacted).toBe(false);
    expect(progress.dead).toBe(true);
  });
});
