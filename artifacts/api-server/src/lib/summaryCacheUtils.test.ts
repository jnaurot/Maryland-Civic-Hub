import { describe, expect, it } from "vitest";
import { shouldFetchSummary } from "./summaryCacheUtils";

describe("shouldFetchSummary", () => {
  it("fetches when summary has never been fetched", () => {
    expect(shouldFetchSummary({ summaryFetchedAt: null, billUpdateDate: "2025-01-01" })).toBe(true);
    expect(shouldFetchSummary({ summaryFetchedAt: undefined, billUpdateDate: null })).toBe(true);
  });

  it("fetches when bill was updated after the last summary fetch", () => {
    const fetchedAt = new Date("2025-01-01T00:00:00Z");
    expect(
      shouldFetchSummary({ summaryFetchedAt: fetchedAt, billUpdateDate: "2025-06-01T00:00:00Z" }),
    ).toBe(true);
  });

  it("skips fetch when bill has not changed since last summary fetch", () => {
    const fetchedAt = new Date("2025-06-01T00:00:00Z");
    expect(
      shouldFetchSummary({ summaryFetchedAt: fetchedAt, billUpdateDate: "2025-01-01T00:00:00Z" }),
    ).toBe(false);
  });

  it("skips fetch when bill updateDate equals summary fetchedAt", () => {
    const date = new Date("2025-03-15T12:00:00Z");
    expect(
      shouldFetchSummary({ summaryFetchedAt: date, billUpdateDate: "2025-03-15T12:00:00Z" }),
    ).toBe(false);
  });

  it("skips fetch when summary was fetched but bill has no updateDate (congress.gov gap)", () => {
    const fetchedAt = new Date("2025-01-01T00:00:00Z");
    expect(
      shouldFetchSummary({ summaryFetchedAt: fetchedAt, billUpdateDate: null }),
    ).toBe(false);
  });
});
