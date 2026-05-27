# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-regression.pw.ts >> state rep bills tab regression
- Location: artifacts/rep/e2e/ui-regression.pw.ts:179:1

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  710 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: state-rep-bills.png

Call log:
  - Expect "toHaveScreenshot(state-rep-bills.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 710 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 710 pixels (ratio 0.01 of all image pixels) are different.

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
            - /url: /bookmarks?from=%2Frep%2Fstate%2FS123&name=Representative
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
          - generic [ref=e22]: St
          - generic [ref=e24]:
            - heading "State Member" [level=1] [ref=e25]
            - generic [ref=e26]:
              - generic [ref=e27]: Democratic
              - generic [ref=e28]: House of Delegates
              - generic [ref=e29]: District 6
          - link "OpenStates Profile" [ref=e31] [cursor=pointer]:
            - /url: https://example.com
            - text: OpenStates Profile
            - img [ref=e32]
        - generic [ref=e36]:
          - generic [ref=e37]:
            - tablist [ref=e38]:
              - tab [selected] [ref=e39]:
                - img [ref=e40]
              - tab [ref=e43]:
                - img [ref=e44]
              - tab [ref=e47]:
                - img [ref=e48]
              - tab [ref=e53]:
                - img [ref=e54]
            - button "Refresh data" [ref=e56]:
              - img
          - tabpanel [ref=e57]:
            - generic [ref=e58]:
              - generic [ref=e60]:
                - button "Sponsored" [ref=e61]
                - button "Cosponsored" [ref=e62]
                - button "Status" [ref=e63]:
                  - generic [ref=e64]: Status
              - generic [ref=e65]:
                - img [ref=e66]
                - textbox "Search bills..." [ref=e69]
              - paragraph [ref=e70]: Sponsored Bills
              - generic [ref=e71]:
                - link "HB 500 lower State Sponsored Bill 1 Hearing scheduled 2026-01-20" [ref=e72] [cursor=pointer]:
                  - /url: /bills/state/state-member-1?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e75]:
                    - generic [ref=e76]:
                      - generic [ref=e77]:
                        - generic [ref=e78]: HB 500
                        - generic [ref=e79]: lower
                      - paragraph [ref=e80]: State Sponsored Bill 1
                      - paragraph [ref=e81]: Hearing scheduled
                    - generic [ref=e82]: 2026-01-20
                - link "HB 501 lower State Sponsored Bill 2 Hearing scheduled 2026-01-20" [ref=e83] [cursor=pointer]:
                  - /url: /bills/state/state-member-2?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e86]:
                    - generic [ref=e87]:
                      - generic [ref=e88]:
                        - generic [ref=e89]: HB 501
                        - generic [ref=e90]: lower
                      - paragraph [ref=e91]: State Sponsored Bill 2
                      - paragraph [ref=e92]: Hearing scheduled
                    - generic [ref=e93]: 2026-01-20
                - link "HB 502 lower State Sponsored Bill 3 Hearing scheduled 2026-01-20" [ref=e94] [cursor=pointer]:
                  - /url: /bills/state/state-member-3?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e97]:
                    - generic [ref=e98]:
                      - generic [ref=e99]:
                        - generic [ref=e100]: HB 502
                        - generic [ref=e101]: lower
                      - paragraph [ref=e102]: State Sponsored Bill 3
                      - paragraph [ref=e103]: Hearing scheduled
                    - generic [ref=e104]: 2026-01-20
                - link "HB 503 lower State Sponsored Bill 4 Hearing scheduled 2026-01-20" [ref=e105] [cursor=pointer]:
                  - /url: /bills/state/state-member-4?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e108]:
                    - generic [ref=e109]:
                      - generic [ref=e110]:
                        - generic [ref=e111]: HB 503
                        - generic [ref=e112]: lower
                      - paragraph [ref=e113]: State Sponsored Bill 4
                      - paragraph [ref=e114]: Hearing scheduled
                    - generic [ref=e115]: 2026-01-20
                - link "HB 504 lower State Sponsored Bill 5 Hearing scheduled 2026-01-20" [ref=e116] [cursor=pointer]:
                  - /url: /bills/state/state-member-5?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e119]:
                    - generic [ref=e120]:
                      - generic [ref=e121]:
                        - generic [ref=e122]: HB 504
                        - generic [ref=e123]: lower
                      - paragraph [ref=e124]: State Sponsored Bill 5
                      - paragraph [ref=e125]: Hearing scheduled
                    - generic [ref=e126]: 2026-01-20
                - link "HB 505 lower State Sponsored Bill 6 Hearing scheduled 2026-01-20" [ref=e127] [cursor=pointer]:
                  - /url: /bills/state/state-member-6?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e130]:
                    - generic [ref=e131]:
                      - generic [ref=e132]:
                        - generic [ref=e133]: HB 505
                        - generic [ref=e134]: lower
                      - paragraph [ref=e135]: State Sponsored Bill 6
                      - paragraph [ref=e136]: Hearing scheduled
                    - generic [ref=e137]: 2026-01-20
                - link "HB 506 lower State Sponsored Bill 7 Hearing scheduled 2026-01-20" [ref=e138] [cursor=pointer]:
                  - /url: /bills/state/state-member-7?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e141]:
                    - generic [ref=e142]:
                      - generic [ref=e143]:
                        - generic [ref=e144]: HB 506
                        - generic [ref=e145]: lower
                      - paragraph [ref=e146]: State Sponsored Bill 7
                      - paragraph [ref=e147]: Hearing scheduled
                    - generic [ref=e148]: 2026-01-20
                - link "HB 507 lower State Sponsored Bill 8 Hearing scheduled 2026-01-20" [ref=e149] [cursor=pointer]:
                  - /url: /bills/state/state-member-8?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e152]:
                    - generic [ref=e153]:
                      - generic [ref=e154]:
                        - generic [ref=e155]: HB 507
                        - generic [ref=e156]: lower
                      - paragraph [ref=e157]: State Sponsored Bill 8
                      - paragraph [ref=e158]: Hearing scheduled
                    - generic [ref=e159]: 2026-01-20
                - link "HB 508 lower State Sponsored Bill 9 Hearing scheduled 2026-01-20" [ref=e160] [cursor=pointer]:
                  - /url: /bills/state/state-member-9?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e163]:
                    - generic [ref=e164]:
                      - generic [ref=e165]:
                        - generic [ref=e166]: HB 508
                        - generic [ref=e167]: lower
                      - paragraph [ref=e168]: State Sponsored Bill 9
                      - paragraph [ref=e169]: Hearing scheduled
                    - generic [ref=e170]: 2026-01-20
                - link "HB 509 lower State Sponsored Bill 10 Hearing scheduled 2026-01-20" [ref=e171] [cursor=pointer]:
                  - /url: /bills/state/state-member-10?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e174]:
                    - generic [ref=e175]:
                      - generic [ref=e176]:
                        - generic [ref=e177]: HB 509
                        - generic [ref=e178]: lower
                      - paragraph [ref=e179]: State Sponsored Bill 10
                      - paragraph [ref=e180]: Hearing scheduled
                    - generic [ref=e181]: 2026-01-20
                - link "HB 510 lower State Sponsored Bill 11 Hearing scheduled 2026-01-20" [ref=e182] [cursor=pointer]:
                  - /url: /bills/state/state-member-11?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e185]:
                    - generic [ref=e186]:
                      - generic [ref=e187]:
                        - generic [ref=e188]: HB 510
                        - generic [ref=e189]: lower
                      - paragraph [ref=e190]: State Sponsored Bill 11
                      - paragraph [ref=e191]: Hearing scheduled
                    - generic [ref=e192]: 2026-01-20
                - link "HB 511 lower State Sponsored Bill 12 Hearing scheduled 2026-01-20" [ref=e193] [cursor=pointer]:
                  - /url: /bills/state/state-member-12?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e196]:
                    - generic [ref=e197]:
                      - generic [ref=e198]:
                        - generic [ref=e199]: HB 511
                        - generic [ref=e200]: lower
                      - paragraph [ref=e201]: State Sponsored Bill 12
                      - paragraph [ref=e202]: Hearing scheduled
                    - generic [ref=e203]: 2026-01-20
                - link "HB 512 lower State Sponsored Bill 13 Hearing scheduled 2026-01-20" [ref=e204] [cursor=pointer]:
                  - /url: /bills/state/state-member-13?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e207]:
                    - generic [ref=e208]:
                      - generic [ref=e209]:
                        - generic [ref=e210]: HB 512
                        - generic [ref=e211]: lower
                      - paragraph [ref=e212]: State Sponsored Bill 13
                      - paragraph [ref=e213]: Hearing scheduled
                    - generic [ref=e214]: 2026-01-20
                - link "HB 513 lower State Sponsored Bill 14 Hearing scheduled 2026-01-20" [ref=e215] [cursor=pointer]:
                  - /url: /bills/state/state-member-14?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e218]:
                    - generic [ref=e219]:
                      - generic [ref=e220]:
                        - generic [ref=e221]: HB 513
                        - generic [ref=e222]: lower
                      - paragraph [ref=e223]: State Sponsored Bill 14
                      - paragraph [ref=e224]: Hearing scheduled
                    - generic [ref=e225]: 2026-01-20
                - link "HB 514 lower State Sponsored Bill 15 Hearing scheduled 2026-01-20" [ref=e226] [cursor=pointer]:
                  - /url: /bills/state/state-member-15?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e229]:
                    - generic [ref=e230]:
                      - generic [ref=e231]:
                        - generic [ref=e232]: HB 514
                        - generic [ref=e233]: lower
                      - paragraph [ref=e234]: State Sponsored Bill 15
                      - paragraph [ref=e235]: Hearing scheduled
                    - generic [ref=e236]: 2026-01-20
                - link "HB 515 lower State Sponsored Bill 16 Hearing scheduled 2026-01-20" [ref=e237] [cursor=pointer]:
                  - /url: /bills/state/state-member-16?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e240]:
                    - generic [ref=e241]:
                      - generic [ref=e242]:
                        - generic [ref=e243]: HB 515
                        - generic [ref=e244]: lower
                      - paragraph [ref=e245]: State Sponsored Bill 16
                      - paragraph [ref=e246]: Hearing scheduled
                    - generic [ref=e247]: 2026-01-20
                - link "HB 516 lower State Sponsored Bill 17 Hearing scheduled 2026-01-20" [ref=e248] [cursor=pointer]:
                  - /url: /bills/state/state-member-17?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e251]:
                    - generic [ref=e252]:
                      - generic [ref=e253]:
                        - generic [ref=e254]: HB 516
                        - generic [ref=e255]: lower
                      - paragraph [ref=e256]: State Sponsored Bill 17
                      - paragraph [ref=e257]: Hearing scheduled
                    - generic [ref=e258]: 2026-01-20
                - link "HB 517 lower State Sponsored Bill 18 Hearing scheduled 2026-01-20" [ref=e259] [cursor=pointer]:
                  - /url: /bills/state/state-member-18?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e262]:
                    - generic [ref=e263]:
                      - generic [ref=e264]:
                        - generic [ref=e265]: HB 517
                        - generic [ref=e266]: lower
                      - paragraph [ref=e267]: State Sponsored Bill 18
                      - paragraph [ref=e268]: Hearing scheduled
                    - generic [ref=e269]: 2026-01-20
                - link "HB 518 lower State Sponsored Bill 19 Hearing scheduled 2026-01-20" [ref=e270] [cursor=pointer]:
                  - /url: /bills/state/state-member-19?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e273]:
                    - generic [ref=e274]:
                      - generic [ref=e275]:
                        - generic [ref=e276]: HB 518
                        - generic [ref=e277]: lower
                      - paragraph [ref=e278]: State Sponsored Bill 19
                      - paragraph [ref=e279]: Hearing scheduled
                    - generic [ref=e280]: 2026-01-20
                - link "HB 519 lower State Sponsored Bill 20 Hearing scheduled 2026-01-20" [ref=e281] [cursor=pointer]:
                  - /url: /bills/state/state-member-20?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e284]:
                    - generic [ref=e285]:
                      - generic [ref=e286]:
                        - generic [ref=e287]: HB 519
                        - generic [ref=e288]: lower
                      - paragraph [ref=e289]: State Sponsored Bill 20
                      - paragraph [ref=e290]: Hearing scheduled
                    - generic [ref=e291]: 2026-01-20
              - generic [ref=e293]: 3/26
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
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
  176 |   await expect(page).toHaveScreenshot("federal-rep-bills.png", { fullPage: true });
  177 | });
  178 | 
  179 | test("state rep bills tab regression", async ({ page }) => {
  180 |   await page.goto("/rep/state/S123");
> 181 |   await expect(page).toHaveScreenshot("state-rep-bills.png", { fullPage: true });
      |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
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