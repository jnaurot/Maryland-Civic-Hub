import { describe, expect, it } from "vitest";
import {
  classifyFederalLegislationItem,
  getFederalLegislationDisplayNumber,
  getFederalLegislationItemId,
  getFederalLegislationTitle,
  shouldResumeMemberLegislationIngestion,
} from "./federalMemberLegislation";

describe("federal member legislation helpers", () => {
  it("classifies bills, resolutions, amendments, and other records", () => {
    expect(classifyFederalLegislationItem({ type: "S", number: "1" })).toBe(
      "bill",
    );
    expect(classifyFederalLegislationItem({ type: "HJRES", number: "1" })).toBe(
      "resolution",
    );
    expect(
      classifyFederalLegislationItem({ amendmentNumber: "4954", type: null }),
    ).toBe("amendment");
    expect(classifyFederalLegislationItem({ type: null })).toBe("other");
  });

  it("uses the Congress.gov URL as the stable canonical item id", () => {
    expect(
      getFederalLegislationItemId({
        url: "https://api.congress.gov/v3/amendment/119/samdt/4954?format=json",
      }),
    ).toBe("https://api.congress.gov/v3/amendment/119/samdt/4954");
  });

  it("builds useful display numbers and titles for amendment records", () => {
    const item = {
      amendmentNumber: "4954",
      url: "https://api.congress.gov/v3/amendment/119/samdt/4954?format=json",
    };
    expect(getFederalLegislationDisplayNumber(item)).toBe("SAMDT 4954");
    expect(getFederalLegislationTitle(item)).toBe("SAMDT 4954");
  });

  it("resumes ingestion for partial caches that have no cache status row", () => {
    expect(
      shouldResumeMemberLegislationIngestion({
        cachedCount: 1,
        cacheStatus: null,
        active: false,
      }),
    ).toBe(true);
  });

  it("does not resume ingestion for complete or already-running caches", () => {
    expect(
      shouldResumeMemberLegislationIngestion({
        cachedCount: 20,
        cacheStatus: { fullyIngested: true },
        active: false,
      }),
    ).toBe(false);
    expect(
      shouldResumeMemberLegislationIngestion({
        cachedCount: 20,
        cacheStatus: { fullyIngested: false },
        active: true,
      }),
    ).toBe(false);
  });
});
