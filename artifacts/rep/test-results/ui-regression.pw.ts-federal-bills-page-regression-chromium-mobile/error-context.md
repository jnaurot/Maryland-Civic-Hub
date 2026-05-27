# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-regression.pw.ts >> federal bills page regression
- Location: artifacts/rep/e2e/ui-regression.pw.ts:164:1

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  1501 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: federal-bills.png

Call log:
  - Expect "toHaveScreenshot(federal-bills.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 1501 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 1501 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "MD" [ref=e6] [cursor=pointer]:
          - /url: /
          - generic [ref=e7]: MD
        - generic [ref=e8]:
          - link "Saved Bills" [ref=e9] [cursor=pointer]:
            - /url: /bookmarks?from=%2Fbills%2Ffederal&name=Federal%20Bills
            - button [ref=e10]:
              - img
          - button "Open menu" [ref=e11]:
            - img
    - main [ref=e12]:
      - generic [ref=e14]:
        - heading "Federal Bills" [level=1] [ref=e16]
        - generic [ref=e17]:
          - generic [ref=e19]:
            - img [ref=e20]
            - textbox "Search bills & representatives..." [ref=e23]
          - button "Status" [ref=e24]:
            - generic [ref=e25]: Status
        - generic [ref=e26]:
          - combobox [ref=e27]:
            - generic: Both Chambers
            - img [ref=e28]
          - generic [ref=e30]: 48 bills
        - generic [ref=e32]:
          - 'link "HR 1000 House Introduced 2026-01-15 Federal Bill Title 1 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e33] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1000?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e36]:
              - generic [ref=e37]:
                - generic [ref=e38]:
                  - generic [ref=e39]: HR 1000
                  - generic [ref=e40]: House
                  - generic [ref=e41]: Introduced 2026-01-15
                - paragraph [ref=e42]: Federal Bill Title 1
                - paragraph [ref=e43]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e44]: "Sponsor: Jane Doe"
              - img [ref=e45]
          - 'link "HR 1001 Senate Introduced 2026-01-15 Federal Bill Title 2 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e47] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1001?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e50]:
              - generic [ref=e51]:
                - generic [ref=e52]:
                  - generic [ref=e53]: HR 1001
                  - generic [ref=e54]: Senate
                  - generic [ref=e55]: Introduced 2026-01-15
                - paragraph [ref=e56]: Federal Bill Title 2
                - paragraph [ref=e57]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e58]: "Sponsor: Jane Doe"
              - img [ref=e59]
          - 'link "HR 1002 House Introduced 2026-01-15 Federal Bill Title 3 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e61] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1002?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e64]:
              - generic [ref=e65]:
                - generic [ref=e66]:
                  - generic [ref=e67]: HR 1002
                  - generic [ref=e68]: House
                  - generic [ref=e69]: Introduced 2026-01-15
                - paragraph [ref=e70]: Federal Bill Title 3
                - paragraph [ref=e71]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e72]: "Sponsor: Jane Doe"
              - img [ref=e73]
          - 'link "HR 1003 Senate Introduced 2026-01-15 Federal Bill Title 4 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e75] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1003?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e78]:
              - generic [ref=e79]:
                - generic [ref=e80]:
                  - generic [ref=e81]: HR 1003
                  - generic [ref=e82]: Senate
                  - generic [ref=e83]: Introduced 2026-01-15
                - paragraph [ref=e84]: Federal Bill Title 4
                - paragraph [ref=e85]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e86]: "Sponsor: Jane Doe"
              - img [ref=e87]
          - 'link "HR 1004 House Introduced 2026-01-15 Federal Bill Title 5 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e89] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1004?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e92]:
              - generic [ref=e93]:
                - generic [ref=e94]:
                  - generic [ref=e95]: HR 1004
                  - generic [ref=e96]: House
                  - generic [ref=e97]: Introduced 2026-01-15
                - paragraph [ref=e98]: Federal Bill Title 5
                - paragraph [ref=e99]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e100]: "Sponsor: Jane Doe"
              - img [ref=e101]
          - 'link "HR 1005 Senate Introduced 2026-01-15 Federal Bill Title 6 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e103] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1005?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e106]:
              - generic [ref=e107]:
                - generic [ref=e108]:
                  - generic [ref=e109]: HR 1005
                  - generic [ref=e110]: Senate
                  - generic [ref=e111]: Introduced 2026-01-15
                - paragraph [ref=e112]: Federal Bill Title 6
                - paragraph [ref=e113]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e114]: "Sponsor: Jane Doe"
              - img [ref=e115]
          - 'link "HR 1006 House Introduced 2026-01-15 Federal Bill Title 7 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e117] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1006?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e120]:
              - generic [ref=e121]:
                - generic [ref=e122]:
                  - generic [ref=e123]: HR 1006
                  - generic [ref=e124]: House
                  - generic [ref=e125]: Introduced 2026-01-15
                - paragraph [ref=e126]: Federal Bill Title 7
                - paragraph [ref=e127]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e128]: "Sponsor: Jane Doe"
              - img [ref=e129]
          - 'link "HR 1007 Senate Introduced 2026-01-15 Federal Bill Title 8 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e131] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1007?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e134]:
              - generic [ref=e135]:
                - generic [ref=e136]:
                  - generic [ref=e137]: HR 1007
                  - generic [ref=e138]: Senate
                  - generic [ref=e139]: Introduced 2026-01-15
                - paragraph [ref=e140]: Federal Bill Title 8
                - paragraph [ref=e141]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e142]: "Sponsor: Jane Doe"
              - img [ref=e143]
          - 'link "HR 1008 House Introduced 2026-01-15 Federal Bill Title 9 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e145] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1008?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e148]:
              - generic [ref=e149]:
                - generic [ref=e150]:
                  - generic [ref=e151]: HR 1008
                  - generic [ref=e152]: House
                  - generic [ref=e153]: Introduced 2026-01-15
                - paragraph [ref=e154]: Federal Bill Title 9
                - paragraph [ref=e155]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e156]: "Sponsor: Jane Doe"
              - img [ref=e157]
          - 'link "HR 1009 Senate Introduced 2026-01-15 Federal Bill Title 10 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e159] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1009?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e162]:
              - generic [ref=e163]:
                - generic [ref=e164]:
                  - generic [ref=e165]: HR 1009
                  - generic [ref=e166]: Senate
                  - generic [ref=e167]: Introduced 2026-01-15
                - paragraph [ref=e168]: Federal Bill Title 10
                - paragraph [ref=e169]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e170]: "Sponsor: Jane Doe"
              - img [ref=e171]
          - 'link "HR 1010 House Introduced 2026-01-15 Federal Bill Title 11 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e173] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1010?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e176]:
              - generic [ref=e177]:
                - generic [ref=e178]:
                  - generic [ref=e179]: HR 1010
                  - generic [ref=e180]: House
                  - generic [ref=e181]: Introduced 2026-01-15
                - paragraph [ref=e182]: Federal Bill Title 11
                - paragraph [ref=e183]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e184]: "Sponsor: Jane Doe"
              - img [ref=e185]
          - 'link "HR 1011 Senate Introduced 2026-01-15 Federal Bill Title 12 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e187] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1011?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e190]:
              - generic [ref=e191]:
                - generic [ref=e192]:
                  - generic [ref=e193]: HR 1011
                  - generic [ref=e194]: Senate
                  - generic [ref=e195]: Introduced 2026-01-15
                - paragraph [ref=e196]: Federal Bill Title 12
                - paragraph [ref=e197]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e198]: "Sponsor: Jane Doe"
              - img [ref=e199]
          - 'link "HR 1012 House Introduced 2026-01-15 Federal Bill Title 13 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e201] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1012?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e204]:
              - generic [ref=e205]:
                - generic [ref=e206]:
                  - generic [ref=e207]: HR 1012
                  - generic [ref=e208]: House
                  - generic [ref=e209]: Introduced 2026-01-15
                - paragraph [ref=e210]: Federal Bill Title 13
                - paragraph [ref=e211]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e212]: "Sponsor: Jane Doe"
              - img [ref=e213]
          - 'link "HR 1013 Senate Introduced 2026-01-15 Federal Bill Title 14 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e215] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1013?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e218]:
              - generic [ref=e219]:
                - generic [ref=e220]:
                  - generic [ref=e221]: HR 1013
                  - generic [ref=e222]: Senate
                  - generic [ref=e223]: Introduced 2026-01-15
                - paragraph [ref=e224]: Federal Bill Title 14
                - paragraph [ref=e225]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e226]: "Sponsor: Jane Doe"
              - img [ref=e227]
          - 'link "HR 1014 House Introduced 2026-01-15 Federal Bill Title 15 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e229] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1014?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e232]:
              - generic [ref=e233]:
                - generic [ref=e234]:
                  - generic [ref=e235]: HR 1014
                  - generic [ref=e236]: House
                  - generic [ref=e237]: Introduced 2026-01-15
                - paragraph [ref=e238]: Federal Bill Title 15
                - paragraph [ref=e239]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e240]: "Sponsor: Jane Doe"
              - img [ref=e241]
          - 'link "HR 1015 Senate Introduced 2026-01-15 Federal Bill Title 16 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e243] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1015?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e246]:
              - generic [ref=e247]:
                - generic [ref=e248]:
                  - generic [ref=e249]: HR 1015
                  - generic [ref=e250]: Senate
                  - generic [ref=e251]: Introduced 2026-01-15
                - paragraph [ref=e252]: Federal Bill Title 16
                - paragraph [ref=e253]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e254]: "Sponsor: Jane Doe"
              - img [ref=e255]
          - 'link "HR 1016 House Introduced 2026-01-15 Federal Bill Title 17 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e257] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1016?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e260]:
              - generic [ref=e261]:
                - generic [ref=e262]:
                  - generic [ref=e263]: HR 1016
                  - generic [ref=e264]: House
                  - generic [ref=e265]: Introduced 2026-01-15
                - paragraph [ref=e266]: Federal Bill Title 17
                - paragraph [ref=e267]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e268]: "Sponsor: Jane Doe"
              - img [ref=e269]
          - 'link "HR 1017 Senate Introduced 2026-01-15 Federal Bill Title 18 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e271] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1017?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e274]:
              - generic [ref=e275]:
                - generic [ref=e276]:
                  - generic [ref=e277]: HR 1017
                  - generic [ref=e278]: Senate
                  - generic [ref=e279]: Introduced 2026-01-15
                - paragraph [ref=e280]: Federal Bill Title 18
                - paragraph [ref=e281]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e282]: "Sponsor: Jane Doe"
              - img [ref=e283]
          - 'link "HR 1018 House Introduced 2026-01-15 Federal Bill Title 19 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e285] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1018?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e288]:
              - generic [ref=e289]:
                - generic [ref=e290]:
                  - generic [ref=e291]: HR 1018
                  - generic [ref=e292]: House
                  - generic [ref=e293]: Introduced 2026-01-15
                - paragraph [ref=e294]: Federal Bill Title 19
                - paragraph [ref=e295]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e296]: "Sponsor: Jane Doe"
              - img [ref=e297]
          - 'link "HR 1019 Senate Introduced 2026-01-15 Federal Bill Title 20 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e299] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1019?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e302]:
              - generic [ref=e303]:
                - generic [ref=e304]:
                  - generic [ref=e305]: HR 1019
                  - generic [ref=e306]: Senate
                  - generic [ref=e307]: Introduced 2026-01-15
                - paragraph [ref=e308]: Federal Bill Title 20
                - paragraph [ref=e309]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e310]: "Sponsor: Jane Doe"
              - img [ref=e311]
        - generic [ref=e314]: 4/48
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
  66  |             party: "Democratic",
  67  |             photoUrl: "",
  68  |             website: "https://example.com",
  69  |           },
  70  |           cache: { stale: false, refreshedAt: "2026-05-01T00:00:00.000Z" },
  71  |         },
  72  |       });
  73  |     }
  74  |     if (path === "/api/federal/members/F000001/bills") {
  75  |       const q = url.searchParams.get("q");
  76  |       const category = url.searchParams.get("category") ?? "all";
  77  |       const stages = url.searchParams.get("stages") ?? "";
  78  |       if (stages) {
  79  |         return route.fulfill({
  80  |           json: {
  81  |             bills: [],
  82  |             totalCount: 0,
  83  |             offset: 0,
  84  |             policyAreas: [],
  85  |             category,
  86  |             categoryCounts: { all: 0, bill: 0, resolution: 0, amendment: 0, other: 0 },
  87  |             fullyIngested: true,
  88  |             sourceTotalCount: 26,
  89  |           },
  90  |         });
  91  |       }
  92  |       const list = q ? sponsoredBills.filter((b) => b.title.toLowerCase().includes(q.toLowerCase())) : sponsoredBills;
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
> 166 |   await expect(page).toHaveScreenshot("federal-bills.png", { fullPage: true });
      |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
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
  193 |   await expect(page.getByText("0–0 of 0")).toBeVisible();
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