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

  2023 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: federal-rep-bills.png

Call log:
  - Expect "toHaveScreenshot(federal-rep-bills.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 2023 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 2023 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "MD Maryland Representatives" [ref=e6] [cursor=pointer]:
          - /url: /
          - generic [ref=e7]: MD
          - generic [ref=e8]: Maryland Representatives
        - navigation [ref=e9]:
          - link "Home" [ref=e10] [cursor=pointer]:
            - /url: /
          - link "Federal Bills" [ref=e11] [cursor=pointer]:
            - /url: /bills/federal
          - link "State Bills" [ref=e12] [cursor=pointer]:
            - /url: /bills/state
          - link "Saved Bills" [ref=e13] [cursor=pointer]:
            - /url: /bookmarks?from=%2Frep%2Ffederal%2FF000001&name=Representative
            - button [ref=e14]:
              - img
    - main [ref=e15]:
      - generic [ref=e17]:
        - link "Back to search" [ref=e18] [cursor=pointer]:
          - /url: /
          - img [ref=e19]
          - text: Back to search
        - generic [ref=e23]:
          - generic [ref=e25]: Fe
          - generic [ref=e27]:
            - heading "Federal Member" [level=1] [ref=e28]
            - generic [ref=e29]:
              - generic [ref=e30]: Democratic
              - generic [ref=e32]: House
              - generic [ref=e34]: Maryland
              - generic [ref=e36]: District 2
            - generic [ref=e37]:
              - generic [ref=e39]: "Top Sponsored Issues:"
              - generic [ref=e41]: Taxation
            - link "Official Website" [ref=e42] [cursor=pointer]:
              - /url: https://example.com
              - text: Official Website
              - img [ref=e43]
        - generic [ref=e47]:
          - tablist [ref=e49]:
            - tab "Bills" [selected] [ref=e50]:
              - img [ref=e51]
              - generic [ref=e54]: Bills
            - tab "Votes" [ref=e55]:
              - img [ref=e56]
              - generic [ref=e59]: Votes
            - tab "Committees" [ref=e60]:
              - img [ref=e61]
              - generic [ref=e66]: Committees
            - tab "Finance" [ref=e67]:
              - img [ref=e68]
              - generic [ref=e70]: Finance
          - tabpanel "Bills" [ref=e71]:
            - generic [ref=e72]:
              - generic [ref=e73]:
                - generic [ref=e74]:
                  - generic [ref=e75]:
                    - button "Sponsored" [ref=e76]
                    - button "Cosponsored" [ref=e77]
                  - generic [ref=e78]:
                    - button "List" [ref=e79]
                    - button "Policy Area" [ref=e80]
                    - button "Status Off" [ref=e81]:
                      - generic [ref=e82]: Status Off
                    - button "Refresh legislation" [ref=e83]:
                      - img
                - generic [ref=e84]:
                  - button "All (26)" [ref=e85]
                  - button "Bills (26)" [ref=e86]
                  - button "Resolutions (0)" [ref=e87]
                  - button "Amendments (0)" [ref=e88]
                - generic [ref=e89]:
                  - img [ref=e90]
                  - textbox "Search bills..." [ref=e93]
              - generic [ref=e94]:
                - paragraph [ref=e95]: Sponsored Legislation
                - generic [ref=e97]:
                  - link "HRES 700 resolution House Sponsored Legislation 1 Referred to Committee 2026-03-01" [ref=e98] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/700?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e101]:
                      - generic [ref=e102]:
                        - generic [ref=e103]:
                          - generic [ref=e104]: HRES 700
                          - generic [ref=e105]: resolution
                          - generic [ref=e106]: House
                        - paragraph [ref=e107]: Sponsored Legislation 1
                        - paragraph [ref=e108]: Referred to Committee
                      - generic [ref=e109]: 2026-03-01
                  - link "HR 4001 bill House Sponsored Legislation 2 Referred to Committee 2026-03-01" [ref=e110] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4001?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e113]:
                      - generic [ref=e114]:
                        - generic [ref=e115]:
                          - generic [ref=e116]: HR 4001
                          - generic [ref=e117]: bill
                          - generic [ref=e118]: House
                        - paragraph [ref=e119]: Sponsored Legislation 2
                        - paragraph [ref=e120]: Referred to Committee
                      - generic [ref=e121]: 2026-03-01
                  - link "HR 4002 bill House Sponsored Legislation 3 Referred to Committee 2026-03-01" [ref=e122] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4002?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e125]:
                      - generic [ref=e126]:
                        - generic [ref=e127]:
                          - generic [ref=e128]: HR 4002
                          - generic [ref=e129]: bill
                          - generic [ref=e130]: House
                        - paragraph [ref=e131]: Sponsored Legislation 3
                        - paragraph [ref=e132]: Referred to Committee
                      - generic [ref=e133]: 2026-03-01
                  - link "HRES 703 resolution House Sponsored Legislation 4 Referred to Committee 2026-03-01" [ref=e134] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/703?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e137]:
                      - generic [ref=e138]:
                        - generic [ref=e139]:
                          - generic [ref=e140]: HRES 703
                          - generic [ref=e141]: resolution
                          - generic [ref=e142]: House
                        - paragraph [ref=e143]: Sponsored Legislation 4
                        - paragraph [ref=e144]: Referred to Committee
                      - generic [ref=e145]: 2026-03-01
                  - link "HR 4004 bill House Sponsored Legislation 5 Referred to Committee 2026-03-01" [ref=e146] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4004?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e149]:
                      - generic [ref=e150]:
                        - generic [ref=e151]:
                          - generic [ref=e152]: HR 4004
                          - generic [ref=e153]: bill
                          - generic [ref=e154]: House
                        - paragraph [ref=e155]: Sponsored Legislation 5
                        - paragraph [ref=e156]: Referred to Committee
                      - generic [ref=e157]: 2026-03-01
                  - link "HR 4005 bill House Sponsored Legislation 6 Referred to Committee 2026-03-01" [ref=e158] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4005?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e161]:
                      - generic [ref=e162]:
                        - generic [ref=e163]:
                          - generic [ref=e164]: HR 4005
                          - generic [ref=e165]: bill
                          - generic [ref=e166]: House
                        - paragraph [ref=e167]: Sponsored Legislation 6
                        - paragraph [ref=e168]: Referred to Committee
                      - generic [ref=e169]: 2026-03-01
                  - link "HRES 706 resolution House Sponsored Legislation 7 Referred to Committee 2026-03-01" [ref=e170] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/706?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e173]:
                      - generic [ref=e174]:
                        - generic [ref=e175]:
                          - generic [ref=e176]: HRES 706
                          - generic [ref=e177]: resolution
                          - generic [ref=e178]: House
                        - paragraph [ref=e179]: Sponsored Legislation 7
                        - paragraph [ref=e180]: Referred to Committee
                      - generic [ref=e181]: 2026-03-01
                  - link "HR 4007 bill House Sponsored Legislation 8 Referred to Committee 2026-03-01" [ref=e182] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4007?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e185]:
                      - generic [ref=e186]:
                        - generic [ref=e187]:
                          - generic [ref=e188]: HR 4007
                          - generic [ref=e189]: bill
                          - generic [ref=e190]: House
                        - paragraph [ref=e191]: Sponsored Legislation 8
                        - paragraph [ref=e192]: Referred to Committee
                      - generic [ref=e193]: 2026-03-01
                  - link "HR 4008 bill House Sponsored Legislation 9 Referred to Committee 2026-03-01" [ref=e194] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4008?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e197]:
                      - generic [ref=e198]:
                        - generic [ref=e199]:
                          - generic [ref=e200]: HR 4008
                          - generic [ref=e201]: bill
                          - generic [ref=e202]: House
                        - paragraph [ref=e203]: Sponsored Legislation 9
                        - paragraph [ref=e204]: Referred to Committee
                      - generic [ref=e205]: 2026-03-01
                  - link "HRES 709 resolution House Sponsored Legislation 10 Referred to Committee 2026-03-01" [ref=e206] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/709?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e209]:
                      - generic [ref=e210]:
                        - generic [ref=e211]:
                          - generic [ref=e212]: HRES 709
                          - generic [ref=e213]: resolution
                          - generic [ref=e214]: House
                        - paragraph [ref=e215]: Sponsored Legislation 10
                        - paragraph [ref=e216]: Referred to Committee
                      - generic [ref=e217]: 2026-03-01
                  - link "HR 4010 bill House Sponsored Legislation 11 Referred to Committee 2026-03-01" [ref=e218] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4010?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e221]:
                      - generic [ref=e222]:
                        - generic [ref=e223]:
                          - generic [ref=e224]: HR 4010
                          - generic [ref=e225]: bill
                          - generic [ref=e226]: House
                        - paragraph [ref=e227]: Sponsored Legislation 11
                        - paragraph [ref=e228]: Referred to Committee
                      - generic [ref=e229]: 2026-03-01
                  - link "HR 4011 bill House Sponsored Legislation 12 Referred to Committee 2026-03-01" [ref=e230] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4011?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e233]:
                      - generic [ref=e234]:
                        - generic [ref=e235]:
                          - generic [ref=e236]: HR 4011
                          - generic [ref=e237]: bill
                          - generic [ref=e238]: House
                        - paragraph [ref=e239]: Sponsored Legislation 12
                        - paragraph [ref=e240]: Referred to Committee
                      - generic [ref=e241]: 2026-03-01
                  - link "HRES 712 resolution House Sponsored Legislation 13 Referred to Committee 2026-03-01" [ref=e242] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/712?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e245]:
                      - generic [ref=e246]:
                        - generic [ref=e247]:
                          - generic [ref=e248]: HRES 712
                          - generic [ref=e249]: resolution
                          - generic [ref=e250]: House
                        - paragraph [ref=e251]: Sponsored Legislation 13
                        - paragraph [ref=e252]: Referred to Committee
                      - generic [ref=e253]: 2026-03-01
                  - link "HR 4013 bill House Sponsored Legislation 14 Referred to Committee 2026-03-01" [ref=e254] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4013?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e257]:
                      - generic [ref=e258]:
                        - generic [ref=e259]:
                          - generic [ref=e260]: HR 4013
                          - generic [ref=e261]: bill
                          - generic [ref=e262]: House
                        - paragraph [ref=e263]: Sponsored Legislation 14
                        - paragraph [ref=e264]: Referred to Committee
                      - generic [ref=e265]: 2026-03-01
                  - link "HR 4014 bill House Sponsored Legislation 15 Referred to Committee 2026-03-01" [ref=e266] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4014?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e269]:
                      - generic [ref=e270]:
                        - generic [ref=e271]:
                          - generic [ref=e272]: HR 4014
                          - generic [ref=e273]: bill
                          - generic [ref=e274]: House
                        - paragraph [ref=e275]: Sponsored Legislation 15
                        - paragraph [ref=e276]: Referred to Committee
                      - generic [ref=e277]: 2026-03-01
                  - link "HRES 715 resolution House Sponsored Legislation 16 Referred to Committee 2026-03-01" [ref=e278] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/715?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e281]:
                      - generic [ref=e282]:
                        - generic [ref=e283]:
                          - generic [ref=e284]: HRES 715
                          - generic [ref=e285]: resolution
                          - generic [ref=e286]: House
                        - paragraph [ref=e287]: Sponsored Legislation 16
                        - paragraph [ref=e288]: Referred to Committee
                      - generic [ref=e289]: 2026-03-01
                  - link "HR 4016 bill House Sponsored Legislation 17 Referred to Committee 2026-03-01" [ref=e290] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4016?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e293]:
                      - generic [ref=e294]:
                        - generic [ref=e295]:
                          - generic [ref=e296]: HR 4016
                          - generic [ref=e297]: bill
                          - generic [ref=e298]: House
                        - paragraph [ref=e299]: Sponsored Legislation 17
                        - paragraph [ref=e300]: Referred to Committee
                      - generic [ref=e301]: 2026-03-01
                  - link "HR 4017 bill House Sponsored Legislation 18 Referred to Committee 2026-03-01" [ref=e302] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4017?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e305]:
                      - generic [ref=e306]:
                        - generic [ref=e307]:
                          - generic [ref=e308]: HR 4017
                          - generic [ref=e309]: bill
                          - generic [ref=e310]: House
                        - paragraph [ref=e311]: Sponsored Legislation 18
                        - paragraph [ref=e312]: Referred to Committee
                      - generic [ref=e313]: 2026-03-01
                  - link "HRES 718 resolution House Sponsored Legislation 19 Referred to Committee 2026-03-01" [ref=e314] [cursor=pointer]:
                    - /url: /bills/federal/119/hres/718?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e317]:
                      - generic [ref=e318]:
                        - generic [ref=e319]:
                          - generic [ref=e320]: HRES 718
                          - generic [ref=e321]: resolution
                          - generic [ref=e322]: House
                        - paragraph [ref=e323]: Sponsored Legislation 19
                        - paragraph [ref=e324]: Referred to Committee
                      - generic [ref=e325]: 2026-03-01
                  - link "HR 4019 bill House Sponsored Legislation 20 Referred to Committee 2026-03-01" [ref=e326] [cursor=pointer]:
                    - /url: /bills/federal/119/hr/4019?from=%2Frep%2Ffederal%2FF000001%3FbillView%3Dlist%26category%3Dall%26offset%3D0&name=Federal%20Member
                    - generic [ref=e329]:
                      - generic [ref=e330]:
                        - generic [ref=e331]:
                          - generic [ref=e332]: HR 4019
                          - generic [ref=e333]: bill
                          - generic [ref=e334]: House
                        - paragraph [ref=e335]: Sponsored Legislation 20
                        - paragraph [ref=e336]: Referred to Committee
                      - generic [ref=e337]: 2026-03-01
                - generic [ref=e339]:
                  - button "Previous" [disabled]
                  - generic [ref=e340]: 1–20 of 20
                  - button "Next" [disabled]
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