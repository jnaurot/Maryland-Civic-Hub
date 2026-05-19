import { expect, test, type Page } from "@playwright/test";

const federalBills = Array.from({ length: 20 }).map((_, i) => ({
  id: `bill-${i + 1}`,
  title: `Federal Bill Title ${i + 1}`,
  number: `HR ${1000 + i}`,
  congress: "119",
  chamber: i % 2 ? "Senate" : "House",
  introducedDate: "2026-01-15",
  latestAction: "Referred to Committee",
  latestActionDate: "2026-02-01",
  sponsors: ["Jane Doe"],
}));

const sponsoredBills = Array.from({ length: 20 }).map((_, i) => ({
  id: `sponsored-${i + 1}`,
  title: `Sponsored Legislation ${i + 1}`,
  number: i % 3 ? `HR ${4000 + i}` : `HRES ${700 + i}`,
  congress: "119",
  chamber: "House",
  introducedDate: "2026-03-01",
  latestAction: "Referred to Committee",
  itemCategory: i % 3 ? "bill" : "resolution",
}));

async function mockApi(page: Page) {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path === "/api/federal/bills/search") {
      return route.fulfill({ json: { bills: federalBills.slice(0, 5), totalCount: 24, offset: 0 } });
    }
    if (path === "/api/federal/bills") {
      return route.fulfill({ json: { bills: federalBills, totalCount: 48, offset: 0 } });
    }
    if (path === "/api/state/bills") {
      return route.fulfill({
        json: {
          bills: federalBills.map((b, i) => ({
            id: `state-${i + 1}`,
            title: `State Bill Title ${i + 1}`,
            identifier: `HB ${100 + i}`,
            chamber: i % 2 ? "upper" : "lower",
            introducedDate: "2026-01-10",
            latestAction: "In committee",
            sponsors: ["Del. Example"],
            session: "2026",
          })),
          totalCount: 37,
          offset: 0,
        },
      });
    }
    if (path === "/api/federal/members/F000001") {
      return route.fulfill({
        json: {
          member: {
            bioguideId: "F000001",
            name: "Federal Member",
            chamber: "House",
            state: "Maryland",
            district: "2",
            party: "Democratic",
            photoUrl: "",
            website: "https://example.com",
          },
          cache: { stale: false, refreshedAt: "2026-05-01T00:00:00.000Z" },
        },
      });
    }
    if (path === "/api/federal/members/F000001/bills") {
      const q = url.searchParams.get("q");
      const category = url.searchParams.get("category") ?? "all";
      const list = q ? sponsoredBills.filter((b) => b.title.toLowerCase().includes(q.toLowerCase())) : sponsoredBills;
      return route.fulfill({
        json: {
          bills: list,
          totalCount: list.length,
          offset: 0,
          policyAreas: [{ name: "Taxation", count: 10, pct: 50 }],
          category,
          categoryCounts: { all: 26, bill: 26, resolution: 0, amendment: 0, other: 0 },
          fullyIngested: true,
          sourceTotalCount: 26,
        },
      });
    }
    if (path === "/api/state/members/S123") {
      return route.fulfill({
        json: {
          legislator: {
            id: "S123",
            name: "State Member",
            chamber: "House of Delegates",
            district: "6",
            party: "Democratic",
            jurisdiction: "md",
            state: "MD",
            photoUrl: "",
            openstatesUrl: "https://example.com",
          },
          cache: { stale: false, refreshFailed: false },
        },
      });
    }
    if (path === "/api/state/members/S123/bills") {
      return route.fulfill({
        json: {
          bills: Array.from({ length: 20 }).map((_, i) => ({
            id: `state-member-${i + 1}`,
            identifier: `HB ${500 + i}`,
            chamber: "lower",
            title: `State Sponsored Bill ${i + 1}`,
            latestAction: "Hearing scheduled",
            introducedDate: "2026-01-20",
          })),
          totalCount: 26,
          offset: 0,
        },
      });
    }
    if (path === "/api/state/members/S123/votes") {
      return route.fulfill({ json: { votes: [], totalCount: 0, offset: 0 } });
    }
    if (path === "/api/federal/members/F000001/house-votes" || path === "/api/federal/members/F000001/senate-votes") {
      return route.fulfill({ json: { votes: [], totalCount: 0, offset: 0 } });
    }
    if (path === "/api/federal/members/F000001/committees") {
      return route.fulfill({ json: { committees: [] } });
    }
    if (path.startsWith("/api/finance")) {
      return route.fulfill({ json: {} });
    }
    return route.fulfill({ status: 404, json: { error: `Unhandled mock for ${path}` } });
  });
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await page.addInitScript(() => {
    localStorage.setItem("civic-hub-state", "MD");
    localStorage.removeItem("civic-hub-address");
  });
});

test("federal bills page regression", async ({ page }) => {
  await page.goto("/bills/federal");
  await expect(page).toHaveScreenshot("federal-bills.png", { fullPage: true });
});

test("state bills page regression", async ({ page }) => {
  await page.goto("/bills/state");
  await expect(page).toHaveScreenshot("state-bills.png", { fullPage: true });
});

test("federal rep bills tab regression", async ({ page }) => {
  await page.goto("/rep/federal/F000001");
  await expect(page).toHaveScreenshot("federal-rep-bills.png", { fullPage: true });
});

test("state rep bills tab regression", async ({ page }) => {
  await page.goto("/rep/state/S123");
  await expect(page).toHaveScreenshot("state-rep-bills.png", { fullPage: true });
});

test("federal bills status filter keeps displayed counts in present context", async ({
  page,
}) => {
  await page.goto("/bills/federal");
  await page.getByRole("button", { name: "Status Off" }).click();
  await page.getByRole("button", { name: "Signed/Enacted" }).click();

  await expect(page.getByText("0 bills")).toBeVisible();
  await expect(page.getByText("0–0 of 0")).toBeVisible();
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
});

test("federal rep category count stays in status-filter context", async ({
  page,
}) => {
  await page.goto("/rep/federal/F000001");
  await page.getByRole("button", { name: "Status Off" }).click();
  await page.getByRole("button", { name: "Signed/Enacted" }).click();

  await expect(page.getByRole("button", { name: "All (0)" })).toBeVisible();
  await expect(page.getByText("0–0 of 0")).toBeVisible();
});
