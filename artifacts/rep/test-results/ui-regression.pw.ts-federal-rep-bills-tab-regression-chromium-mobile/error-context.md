# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-regression.pw.ts >> federal rep bills tab regression
- Location: artifacts/rep/e2e/ui-regression.pw.ts:174:1

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  793 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: federal-rep-bills.png

Call log:
  - Expect "toHaveScreenshot(federal-rep-bills.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 793 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 793 pixels (ratio 0.01 of all image pixels) are different.

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
            - /url: /bookmarks?from=%2Frep%2Ffederal%2FF000001&name=Representative
            - button [ref=e10]:
              - img
          - button "Open menu" [ref=e11]:
            - img
    - main [ref=e12]:
      - generic [ref=e14]:
        - link "Back to search" [ref=e15] [cursor=pointer]:
          - /url: /
          - img [ref=e16]
          - text: Back to search
        - generic [ref=e20]:
          - generic [ref=e22]: Fe
          - generic [ref=e24]:
            - heading "Federal Member" [level=1] [ref=e25]
            - generic [ref=e26]:
              - generic [ref=e27]: Democratic
              - generic [ref=e29]: House
              - generic [ref=e31]: MD
              - generic [ref=e33]: Dist. 2
            - generic [ref=e34]:
              - generic [ref=e36]: "Top Sponsored Issues:"
              - generic [ref=e38]: Taxation
          - link "Official Website" [ref=e40] [cursor=pointer]:
            - /url: https://example.com
            - text: Official Website
            - img [ref=e41]
        - generic [ref=e45]:
          - generic [ref=e46]:
            - tablist [ref=e47]:
              - tab [selected] [ref=e48]:
                - img [ref=e49]
              - tab [ref=e52]:
                - img [ref=e53]
              - tab [ref=e56]:
                - img [ref=e57]
              - tab [ref=e62]:
                - img [ref=e63]
            - button "Refresh data" [ref=e65]:
              - img
          - tabpanel [ref=e66]:
            - generic [ref=e67]:
              - generic [ref=e68]:
                - generic [ref=e69]:
                  - generic [ref=e70]:
                    - button "Sponsored" [ref=e71]
                    - button "Cosponsored" [ref=e72]
                  - generic [ref=e73]:
                    - button "List" [ref=e74]
                    - button "Policy Area" [ref=e75]
                    - button "Status" [ref=e76]:
                      - generic [ref=e77]: Status
                - generic [ref=e78]:
                  - button "All (26)" [ref=e79]
                  - button "Bills (26)" [ref=e80]
                  - button "Resolutions (0)" [ref=e81]
                  - button "Amendments (0)" [ref=e82]
                - generic [ref=e83]:
                  - img [ref=e84]
                  - textbox "Search bills..." [ref=e87]
              - generic [ref=e88]:
                - paragraph [ref=e89]: Sponsored Legislation
                - generic [ref=e91]:
                  - link "HRES 700 resolution House Sponsored Legislation 1 Referred to Committee 2026-03-01" [ref=e92] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/700?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e95]:
                      - generic [ref=e96]:
                        - generic [ref=e97]:
                          - generic [ref=e98]: HRES 700
                          - generic [ref=e99]: resolution
                          - generic [ref=e100]: House
                        - paragraph [ref=e101]: Sponsored Legislation 1
                        - paragraph [ref=e102]: Referred to Committee
                      - generic [ref=e103]: 2026-03-01
                  - link "HR 4001 bill House Sponsored Legislation 2 Referred to Committee 2026-03-01" [ref=e104] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4001?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e107]:
                      - generic [ref=e108]:
                        - generic [ref=e109]:
                          - generic [ref=e110]: HR 4001
                          - generic [ref=e111]: bill
                          - generic [ref=e112]: House
                        - paragraph [ref=e113]: Sponsored Legislation 2
                        - paragraph [ref=e114]: Referred to Committee
                      - generic [ref=e115]: 2026-03-01
                  - link "HR 4002 bill House Sponsored Legislation 3 Referred to Committee 2026-03-01" [ref=e116] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4002?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e119]:
                      - generic [ref=e120]:
                        - generic [ref=e121]:
                          - generic [ref=e122]: HR 4002
                          - generic [ref=e123]: bill
                          - generic [ref=e124]: House
                        - paragraph [ref=e125]: Sponsored Legislation 3
                        - paragraph [ref=e126]: Referred to Committee
                      - generic [ref=e127]: 2026-03-01
                  - link "HRES 703 resolution House Sponsored Legislation 4 Referred to Committee 2026-03-01" [ref=e128] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/703?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e131]:
                      - generic [ref=e132]:
                        - generic [ref=e133]:
                          - generic [ref=e134]: HRES 703
                          - generic [ref=e135]: resolution
                          - generic [ref=e136]: House
                        - paragraph [ref=e137]: Sponsored Legislation 4
                        - paragraph [ref=e138]: Referred to Committee
                      - generic [ref=e139]: 2026-03-01
                  - link "HR 4004 bill House Sponsored Legislation 5 Referred to Committee 2026-03-01" [ref=e140] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4004?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e143]:
                      - generic [ref=e144]:
                        - generic [ref=e145]:
                          - generic [ref=e146]: HR 4004
                          - generic [ref=e147]: bill
                          - generic [ref=e148]: House
                        - paragraph [ref=e149]: Sponsored Legislation 5
                        - paragraph [ref=e150]: Referred to Committee
                      - generic [ref=e151]: 2026-03-01
                  - link "HR 4005 bill House Sponsored Legislation 6 Referred to Committee 2026-03-01" [ref=e152] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4005?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e155]:
                      - generic [ref=e156]:
                        - generic [ref=e157]:
                          - generic [ref=e158]: HR 4005
                          - generic [ref=e159]: bill
                          - generic [ref=e160]: House
                        - paragraph [ref=e161]: Sponsored Legislation 6
                        - paragraph [ref=e162]: Referred to Committee
                      - generic [ref=e163]: 2026-03-01
                  - link "HRES 706 resolution House Sponsored Legislation 7 Referred to Committee 2026-03-01" [ref=e164] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/706?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e167]:
                      - generic [ref=e168]:
                        - generic [ref=e169]:
                          - generic [ref=e170]: HRES 706
                          - generic [ref=e171]: resolution
                          - generic [ref=e172]: House
                        - paragraph [ref=e173]: Sponsored Legislation 7
                        - paragraph [ref=e174]: Referred to Committee
                      - generic [ref=e175]: 2026-03-01
                  - link "HR 4007 bill House Sponsored Legislation 8 Referred to Committee 2026-03-01" [ref=e176] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4007?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e179]:
                      - generic [ref=e180]:
                        - generic [ref=e181]:
                          - generic [ref=e182]: HR 4007
                          - generic [ref=e183]: bill
                          - generic [ref=e184]: House
                        - paragraph [ref=e185]: Sponsored Legislation 8
                        - paragraph [ref=e186]: Referred to Committee
                      - generic [ref=e187]: 2026-03-01
                  - link "HR 4008 bill House Sponsored Legislation 9 Referred to Committee 2026-03-01" [ref=e188] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4008?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e191]:
                      - generic [ref=e192]:
                        - generic [ref=e193]:
                          - generic [ref=e194]: HR 4008
                          - generic [ref=e195]: bill
                          - generic [ref=e196]: House
                        - paragraph [ref=e197]: Sponsored Legislation 9
                        - paragraph [ref=e198]: Referred to Committee
                      - generic [ref=e199]: 2026-03-01
                  - link "HRES 709 resolution House Sponsored Legislation 10 Referred to Committee 2026-03-01" [ref=e200] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/709?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e203]:
                      - generic [ref=e204]:
                        - generic [ref=e205]:
                          - generic [ref=e206]: HRES 709
                          - generic [ref=e207]: resolution
                          - generic [ref=e208]: House
                        - paragraph [ref=e209]: Sponsored Legislation 10
                        - paragraph [ref=e210]: Referred to Committee
                      - generic [ref=e211]: 2026-03-01
                  - link "HR 4010 bill House Sponsored Legislation 11 Referred to Committee 2026-03-01" [ref=e212] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4010?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e215]:
                      - generic [ref=e216]:
                        - generic [ref=e217]:
                          - generic [ref=e218]: HR 4010
                          - generic [ref=e219]: bill
                          - generic [ref=e220]: House
                        - paragraph [ref=e221]: Sponsored Legislation 11
                        - paragraph [ref=e222]: Referred to Committee
                      - generic [ref=e223]: 2026-03-01
                  - link "HR 4011 bill House Sponsored Legislation 12 Referred to Committee 2026-03-01" [ref=e224] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4011?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e227]:
                      - generic [ref=e228]:
                        - generic [ref=e229]:
                          - generic [ref=e230]: HR 4011
                          - generic [ref=e231]: bill
                          - generic [ref=e232]: House
                        - paragraph [ref=e233]: Sponsored Legislation 12
                        - paragraph [ref=e234]: Referred to Committee
                      - generic [ref=e235]: 2026-03-01
                  - link "HRES 712 resolution House Sponsored Legislation 13 Referred to Committee 2026-03-01" [ref=e236] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/712?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e239]:
                      - generic [ref=e240]:
                        - generic [ref=e241]:
                          - generic [ref=e242]: HRES 712
                          - generic [ref=e243]: resolution
                          - generic [ref=e244]: House
                        - paragraph [ref=e245]: Sponsored Legislation 13
                        - paragraph [ref=e246]: Referred to Committee
                      - generic [ref=e247]: 2026-03-01
                  - link "HR 4013 bill House Sponsored Legislation 14 Referred to Committee 2026-03-01" [ref=e248] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4013?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e251]:
                      - generic [ref=e252]:
                        - generic [ref=e253]:
                          - generic [ref=e254]: HR 4013
                          - generic [ref=e255]: bill
                          - generic [ref=e256]: House
                        - paragraph [ref=e257]: Sponsored Legislation 14
                        - paragraph [ref=e258]: Referred to Committee
                      - generic [ref=e259]: 2026-03-01
                  - link "HR 4014 bill House Sponsored Legislation 15 Referred to Committee 2026-03-01" [ref=e260] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4014?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e263]:
                      - generic [ref=e264]:
                        - generic [ref=e265]:
                          - generic [ref=e266]: HR 4014
                          - generic [ref=e267]: bill
                          - generic [ref=e268]: House
                        - paragraph [ref=e269]: Sponsored Legislation 15
                        - paragraph [ref=e270]: Referred to Committee
                      - generic [ref=e271]: 2026-03-01
                  - link "HRES 715 resolution House Sponsored Legislation 16 Referred to Committee 2026-03-01" [ref=e272] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/715?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e275]:
                      - generic [ref=e276]:
                        - generic [ref=e277]:
                          - generic [ref=e278]: HRES 715
                          - generic [ref=e279]: resolution
                          - generic [ref=e280]: House
                        - paragraph [ref=e281]: Sponsored Legislation 16
                        - paragraph [ref=e282]: Referred to Committee
                      - generic [ref=e283]: 2026-03-01
                  - link "HR 4016 bill House Sponsored Legislation 17 Referred to Committee 2026-03-01" [ref=e284] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4016?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e287]:
                      - generic [ref=e288]:
                        - generic [ref=e289]:
                          - generic [ref=e290]: HR 4016
                          - generic [ref=e291]: bill
                          - generic [ref=e292]: House
                        - paragraph [ref=e293]: Sponsored Legislation 17
                        - paragraph [ref=e294]: Referred to Committee
                      - generic [ref=e295]: 2026-03-01
                  - link "HR 4017 bill House Sponsored Legislation 18 Referred to Committee 2026-03-01" [ref=e296] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4017?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e299]:
                      - generic [ref=e300]:
                        - generic [ref=e301]:
                          - generic [ref=e302]: HR 4017
                          - generic [ref=e303]: bill
                          - generic [ref=e304]: House
                        - paragraph [ref=e305]: Sponsored Legislation 18
                        - paragraph [ref=e306]: Referred to Committee
                      - generic [ref=e307]: 2026-03-01
                  - link "HRES 718 resolution House Sponsored Legislation 19 Referred to Committee 2026-03-01" [ref=e308] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/718?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e311]:
                      - generic [ref=e312]:
                        - generic [ref=e313]:
                          - generic [ref=e314]: HRES 718
                          - generic [ref=e315]: resolution
                          - generic [ref=e316]: House
                        - paragraph [ref=e317]: Sponsored Legislation 19
                        - paragraph [ref=e318]: Referred to Committee
                      - generic [ref=e319]: 2026-03-01
                  - link "HR 4019 bill House Sponsored Legislation 20 Referred to Committee 2026-03-01" [ref=e320] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4019?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e323]:
                      - generic [ref=e324]:
                        - generic [ref=e325]:
                          - generic [ref=e326]: HR 4019
                          - generic [ref=e327]: bill
                          - generic [ref=e328]: House
                        - paragraph [ref=e329]: Sponsored Legislation 20
                        - paragraph [ref=e330]: Referred to Committee
                      - generic [ref=e331]: 2026-03-01
                - generic [ref=e333]: 2/20
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
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
> 176 |   await expect(page).toHaveScreenshot("federal-rep-bills.png", { fullPage: true });
      |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
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