# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-regression.pw.ts >> federal bills status filter keeps displayed counts in present context
- Location: artifacts/rep/e2e/ui-regression.pw.ts:184:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByText('0–0 of 0')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('0–0 of 0')
    14 × locator resolved to <span class="text-sm text-muted-foreground text-center max-sm:text-xs">0–0 of 0</span>
       - unexpected value "hidden"

```

```yaml
- banner:
  - link "MD":
    - /url: /
  - link "Saved Bills":
    - /url: /bookmarks?from=%2Fbills%2Ffederal&name=Federal%20Bills
    - button
  - button "Open menu"
- main:
  - heading "Federal Bills" [level=1]
  - textbox "Search bills & representatives..."
  - button "Status"
  - button "Introduced"
  - button "Committee"
  - button "Floor Vote"
  - button "Passed"
  - button "Signed/Enacted"
  - button "Dead"
  - combobox: Both Chambers
  - text: 0 bills
  - paragraph: No bills found for selected status filters.
- region "Notifications (F8)":
  - list
```

# Test source

```ts
  93  |       return route.fulfill({
  94  |         json: {
  95  |           bills: list,
  96  |           totalCount: list.length,
  97  |           offset: 0,
  98  |           policyAreas: [{ name: "Taxation", count: 10, pct: 50 }],
  99  |           category,
  100 |           categoryCounts: { all: 26, bill: 26, resolution: 0, amendment: 0, other: 0 },
  101 |           fullyIngested: true,
  102 |           sourceTotalCount: 26,
  103 |         },
  104 |       });
  105 |     }
  106 |     if (path === "/api/state/members/S123") {
  107 |       return route.fulfill({
  108 |         json: {
  109 |           legislator: {
  110 |             id: "S123",
  111 |             name: "State Member",
  112 |             chamber: "House of Delegates",
  113 |             district: "6",
  114 |             party: "Democratic",
  115 |             jurisdiction: "md",
  116 |             state: "MD",
  117 |             photoUrl: "",
  118 |             openstatesUrl: "https://example.com",
  119 |           },
  120 |           cache: { stale: false, refreshFailed: false },
  121 |         },
  122 |       });
  123 |     }
  124 |     if (path === "/api/state/members/S123/bills") {
  125 |       return route.fulfill({
  126 |         json: {
  127 |           bills: Array.from({ length: 20 }).map((_, i) => ({
  128 |             id: `state-member-${i + 1}`,
  129 |             identifier: `HB ${500 + i}`,
  130 |             chamber: "lower",
  131 |             title: `State Sponsored Bill ${i + 1}`,
  132 |             latestAction: "Hearing scheduled",
  133 |             introducedDate: "2026-01-20",
  134 |           })),
  135 |           totalCount: 26,
  136 |           offset: 0,
  137 |         },
  138 |       });
  139 |     }
  140 |     if (path === "/api/state/members/S123/votes") {
  141 |       return route.fulfill({ json: { votes: [], totalCount: 0, offset: 0 } });
  142 |     }
  143 |     if (path === "/api/federal/members/F000001/house-votes" || path === "/api/federal/members/F000001/senate-votes") {
  144 |       return route.fulfill({ json: { votes: [], totalCount: 0, offset: 0 } });
  145 |     }
  146 |     if (path === "/api/federal/members/F000001/committees") {
  147 |       return route.fulfill({ json: { committees: [] } });
  148 |     }
  149 |     if (path.startsWith("/api/finance")) {
  150 |       return route.fulfill({ json: {} });
  151 |     }
  152 |     return route.fulfill({ status: 404, json: { error: `Unhandled mock for ${path}` } });
  153 |   });
  154 | }
  155 | 
  156 | test.beforeEach(async ({ page }) => {
  157 |   await mockApi(page);
  158 |   await page.addInitScript(() => {
  159 |     localStorage.setItem("civic-hub-state", "MD");
  160 |     localStorage.removeItem("civic-hub-address");
  161 |   });
  162 | });
  163 | 
  164 | test("federal bills page regression", async ({ page }) => {
  165 |   await page.goto("/bills/federal");
  166 |   await expect(page).toHaveScreenshot("federal-bills.png", { fullPage: true });
  167 | });
  168 | 
  169 | test("state bills page regression", async ({ page }) => {
  170 |   await page.goto("/bills/state");
  171 |   await expect(page).toHaveScreenshot("state-bills.png", { fullPage: true });
  172 | });
  173 | 
  174 | test("federal rep bills tab regression", async ({ page }) => {
  175 |   await page.goto("/rep/federal/F000001");
  176 |   await expect(page).toHaveScreenshot("federal-rep-bills.png", { fullPage: true });
  177 | });
  178 | 
  179 | test("state rep bills tab regression", async ({ page }) => {
  180 |   await page.goto("/rep/state/S123");
  181 |   await expect(page).toHaveScreenshot("state-rep-bills.png", { fullPage: true });
  182 | });
  183 | 
  184 | test("federal bills status filter keeps displayed counts in present context", async ({
  185 |   page,
  186 | }) => {
  187 |   await page.goto("/bills/federal");
  188 |   // Button label is "Status Off" on desktop, "Status" on mobile
  189 |   await page.getByRole("button", { name: /^Status/ }).first().click();
  190 |   await page.getByRole("button", { name: "Signed/Enacted" }).click();
  191 | 
  192 |   await expect(page.getByText("0 bills")).toBeVisible();
> 193 |   await expect(page.getByText("0–0 of 0")).toBeVisible();
      |                                            ^ Error: expect(locator).toBeVisible() failed
  194 |   await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
  195 | });
  196 | 
  197 | test("federal rep category count stays in status-filter context", async ({
  198 |   page,
  199 | }) => {
  200 |   await page.goto("/rep/federal/F000001");
  201 |   // Button label is "Status Off" on desktop, "Status" on mobile
  202 |   await page.getByRole("button", { name: /^Status/ }).first().click();
  203 |   await page.getByRole("button", { name: "Signed/Enacted" }).click();
  204 | 
  205 |   await expect(page.getByRole("button", { name: "All (0)" })).toBeVisible();
  206 |   // "0–0 of 0" lives in a desktop-only container; the category count above is sufficient
  207 | });
  208 | 
```