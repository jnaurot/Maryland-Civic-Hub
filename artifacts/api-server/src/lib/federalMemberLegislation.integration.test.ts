import { describe, expect, it } from "vitest";
import { classifyFederalLegislationItem } from "./federalMemberLegislation";

const maybeDescribe = process.env.CONGRESS_API_KEY ? describe : describe.skip;

maybeDescribe("Congress.gov member sponsored-legislation integration", () => {
  it("returns many Van Hollen sponsored records and includes amendment-shaped items", async () => {
    const url = new URL(
      "https://api.congress.gov/v3/member/V000128/sponsored-legislation",
    );
    url.searchParams.set("api_key", process.env.CONGRESS_API_KEY!);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "20");

    const response = await fetch(url);
    expect(response.ok).toBe(true);

    const data = (await response.json()) as {
      pagination?: { count?: number };
      sponsoredLegislation?: Array<{
        amendmentNumber?: string;
        type?: string | null;
        url?: string;
      }>;
    };

    expect(data.pagination?.count ?? 0).toBeGreaterThan(20);
    expect(
      data.sponsoredLegislation?.some(
        (item) => classifyFederalLegislationItem(item) === "amendment",
      ),
    ).toBe(true);
  });
});
