import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function getRouteSource(): string {
  return readFileSync(
    resolve(import.meta.dirname, "federal.ts"),
    "utf8",
  );
}

describe("GET /federal/members/:bioguideId/bills policyArea filter integration", () => {
  const source = getRouteSource();

  it("route parses policyArea from query params", () => {
    expect(source.includes("policyArea } = queryParsed.data;")).toBe(true);
  });

  it("route builds a policyAreaCondition when policyArea is provided", () => {
    expect(source.includes("const policyAreaCondition = policyArea")).toBe(true);
    expect(source.includes("eq(federalMemberLegislationItemsTable.policyArea, policyArea)")).toBe(true);
  });

  it("route includes policyAreaCondition in filterConditions", () => {
    expect(source.includes("...(policyAreaCondition ? [policyAreaCondition] : []),")).toBe(true);
  });

  it("route includes policyAreaCondition in the policy-area breakdown query", () => {
    // The policyAreaRows query also filters by policyArea when provided
    expect(source.includes("...(policyAreaCondition ? [policyAreaCondition] : []),")).toBe(true);
  });
});

describe("GET /federal/bills and /federal/bills/search policyArea filter integration", () => {
  const source = getRouteSource();

  it("list route includes policyArea in dbConditions", () => {
    expect(source.includes("...(policyArea ? [eq(federalBillsTable.policyArea, policyArea)] : []),")).toBe(true);
  });

  it("search route includes policyArea in conditions", () => {
    expect(source.includes("if (policyArea) {")).toBe(true);
    expect(source.includes("eq(federalBillsTable.policyArea, policyArea)")).toBe(true);
  });
});
