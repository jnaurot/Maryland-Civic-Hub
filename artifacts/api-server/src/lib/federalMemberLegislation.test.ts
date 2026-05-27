import { describe, expect, it } from "vitest";
import {
  classifyFederalLegislationItem,
  getFederalLegislationDisplayNumber,
  getFederalLegislationItemId,
  getFederalLegislationTitle,
  mapFederalLegislationForResponse,
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

  it("returns a canonical congress-type-number id", () => {
    expect(
      getFederalLegislationItemId({
        url: "https://api.congress.gov/v3/amendment/119/samdt/4954?format=json",
      }),
    ).toBe("119-SAMDT-4954");
    expect(
      getFederalLegislationItemId({ congress: 119, type: "HR", number: "1234" }),
    ).toBe("119-HR-1234");
    expect(
      getFederalLegislationItemId({
        url: "https://api.congress.gov/v3/bill/119/hr/1234?format=json",
      }),
    ).toBe("119-HR-1234");
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

  it("does not resume ingestion when cachedCount is zero (cold start handled separately)", () => {
    expect(
      shouldResumeMemberLegislationIngestion({
        cachedCount: 0,
        cacheStatus: null,
        active: false,
      }),
    ).toBe(false);
  });

  it("resumes ingestion when cache exists but is not fully ingested", () => {
    expect(
      shouldResumeMemberLegislationIngestion({
        cachedCount: 250,
        cacheStatus: { fullyIngested: false },
        active: false,
      }),
    ).toBe(true);
  });
});

describe("mapFederalLegislationForResponse", () => {
  const baseRow = {
    id: "119-hr-1234",
    title: "A Test Bill",
    number: "HR 1234",
    congress: 119,
    introducedDate: "2025-01-15",
    latestAction: "Referred to committee",
    latestActionDate: "2025-01-20",
    stageIntroduced: true,
    stageCommittee: true,
    stageFloorVote: false,
    stagePassed: false,
    stageSignedEnacted: false,
    stageDead: false,
    policyArea: "Health",
    url: "https://congress.gov/bill/119th-congress/house-bill/1234",
    category: "bill",
    type: "HR",
  };

  it("maps all fields correctly for a standard bill", () => {
    const result = mapFederalLegislationForResponse(baseRow);
    expect(result.id).toBe("119-hr-1234");
    expect(result.title).toBe("A Test Bill");
    expect(result.itemCategory).toBe("bill");
    expect(result.chamber).toBe("House");
    expect(result.stageIntroduced).toBe(true);
    expect(result.stageCommittee).toBe(true);
    expect(result.stageFloorVote).toBe(false);
  });

  it("defaults null category to 'other'", () => {
    const result = mapFederalLegislationForResponse({ ...baseRow, category: null });
    expect(result.itemCategory).toBe("other");
  });

  it("derives chamber from type prefix", () => {
    expect(
      mapFederalLegislationForResponse({ ...baseRow, type: "HR" }).chamber,
    ).toBe("House");
    expect(
      mapFederalLegislationForResponse({ ...baseRow, type: "S" }).chamber,
    ).toBe("Senate");
    expect(
      mapFederalLegislationForResponse({ ...baseRow, type: "HJRES" }).chamber,
    ).toBe("House");
    expect(
      mapFederalLegislationForResponse({ ...baseRow, type: null }).chamber,
    ).toBeUndefined();
  });

  it("converts null optional fields to undefined", () => {
    const result = mapFederalLegislationForResponse({
      ...baseRow,
      introducedDate: null,
      latestAction: null,
      latestActionDate: null,
      policyArea: null,
      url: null,
    });
    expect(result.introducedDate).toBeUndefined();
    expect(result.latestAction).toBeUndefined();
    expect(result.latestActionDate).toBeUndefined();
    expect(result.policyArea).toBeUndefined();
    expect(result.url).toBeUndefined();
  });
});
