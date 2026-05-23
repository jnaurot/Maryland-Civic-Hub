import { describe, expect, it } from "vitest";
import { shouldRefetchField } from "./summaryCacheUtils";

describe("shouldRefetchField", () => {
  it("fetches when field has never been fetched", () => {
    expect(shouldRefetchField({ fetchedAt: null, billUpdateDate: "2025-01-01" })).toBe(true);
    expect(shouldRefetchField({ fetchedAt: undefined, billUpdateDate: null })).toBe(true);
  });

  it("fetches when bill was updated after the last field fetch", () => {
    const fetchedAt = new Date("2025-01-01T00:00:00Z");
    expect(
      shouldRefetchField({ fetchedAt, billUpdateDate: "2025-06-01T00:00:00Z" }),
    ).toBe(true);
  });

  it("skips fetch when bill has not changed since last field fetch", () => {
    const fetchedAt = new Date("2025-06-01T00:00:00Z");
    expect(
      shouldRefetchField({ fetchedAt, billUpdateDate: "2025-01-01T00:00:00Z" }),
    ).toBe(false);
  });

  it("skips fetch when bill updateDate equals field fetchedAt", () => {
    const date = new Date("2025-03-15T12:00:00Z");
    expect(
      shouldRefetchField({ fetchedAt: date, billUpdateDate: "2025-03-15T12:00:00Z" }),
    ).toBe(false);
  });

  it("skips fetch when field was fetched but bill has no updateDate (congress.gov gap)", () => {
    const fetchedAt = new Date("2025-01-01T00:00:00Z");
    expect(
      shouldRefetchField({ fetchedAt, billUpdateDate: null }),
    ).toBe(false);
  });
});
