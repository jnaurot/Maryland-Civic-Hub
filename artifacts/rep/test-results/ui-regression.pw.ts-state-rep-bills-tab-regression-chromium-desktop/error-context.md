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

  1785 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: state-rep-bills.png

Call log:
  - Expect "toHaveScreenshot(state-rep-bills.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 1785 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 1785 pixels (ratio 0.01 of all image pixels) are different.

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
            - /url: /bookmarks?from=%2Frep%2Fstate%2FS123&name=Representative
            - button [ref=e14]:
              - img
    - main [ref=e15]:
      - generic [ref=e17]:
        - link "Back to search" [ref=e18] [cursor=pointer]:
          - /url: /
          - img [ref=e19]
          - text: Back to search
        - generic [ref=e23]:
          - generic [ref=e25]: St
          - generic [ref=e27]:
            - heading "State Member" [level=1] [ref=e28]
            - generic [ref=e29]:
              - generic [ref=e30]: Democratic
              - generic [ref=e31]: House of Delegates
              - generic [ref=e32]: District 6
            - link "OpenStates Profile" [ref=e33] [cursor=pointer]:
              - /url: https://example.com
              - text: OpenStates Profile
              - img [ref=e34]
        - generic [ref=e38]:
          - tablist [ref=e40]:
            - tab "Bills" [selected] [ref=e41]:
              - img [ref=e42]
              - generic [ref=e45]: Bills
            - tab "Votes" [ref=e46]:
              - img [ref=e47]
              - generic [ref=e50]: Votes
            - tab "Committees" [ref=e51]:
              - img [ref=e52]
              - generic [ref=e57]: Committees
            - tab "Finance" [ref=e58]:
              - img [ref=e59]
              - generic [ref=e61]: Finance
          - tabpanel "Bills" [ref=e62]:
            - generic [ref=e63]:
              - generic [ref=e65]:
                - button "Sponsored" [ref=e66]
                - button "Cosponsored" [ref=e67]
                - button "Status Off" [ref=e68]:
                  - generic [ref=e69]: Status Off
                - button "Refresh bills" [ref=e70]:
                  - img
              - generic [ref=e71]:
                - img [ref=e72]
                - textbox "Search bills..." [ref=e75]
              - paragraph [ref=e76]: Sponsored Bills
              - generic [ref=e77]:
                - link "HB 500 lower State Sponsored Bill 1 Hearing scheduled 2026-01-20" [ref=e78] [cursor=pointer]:
                  - /url: /bills/state/state-member-1?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e81]:
                    - generic [ref=e82]:
                      - generic [ref=e83]:
                        - generic [ref=e84]: HB 500
                        - generic [ref=e85]: lower
                      - paragraph [ref=e86]: State Sponsored Bill 1
                      - paragraph [ref=e87]: Hearing scheduled
                    - generic [ref=e88]: 2026-01-20
                - link "HB 501 lower State Sponsored Bill 2 Hearing scheduled 2026-01-20" [ref=e89] [cursor=pointer]:
                  - /url: /bills/state/state-member-2?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e92]:
                    - generic [ref=e93]:
                      - generic [ref=e94]:
                        - generic [ref=e95]: HB 501
                        - generic [ref=e96]: lower
                      - paragraph [ref=e97]: State Sponsored Bill 2
                      - paragraph [ref=e98]: Hearing scheduled
                    - generic [ref=e99]: 2026-01-20
                - link "HB 502 lower State Sponsored Bill 3 Hearing scheduled 2026-01-20" [ref=e100] [cursor=pointer]:
                  - /url: /bills/state/state-member-3?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e103]:
                    - generic [ref=e104]:
                      - generic [ref=e105]:
                        - generic [ref=e106]: HB 502
                        - generic [ref=e107]: lower
                      - paragraph [ref=e108]: State Sponsored Bill 3
                      - paragraph [ref=e109]: Hearing scheduled
                    - generic [ref=e110]: 2026-01-20
                - link "HB 503 lower State Sponsored Bill 4 Hearing scheduled 2026-01-20" [ref=e111] [cursor=pointer]:
                  - /url: /bills/state/state-member-4?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e114]:
                    - generic [ref=e115]:
                      - generic [ref=e116]:
                        - generic [ref=e117]: HB 503
                        - generic [ref=e118]: lower
                      - paragraph [ref=e119]: State Sponsored Bill 4
                      - paragraph [ref=e120]: Hearing scheduled
                    - generic [ref=e121]: 2026-01-20
                - link "HB 504 lower State Sponsored Bill 5 Hearing scheduled 2026-01-20" [ref=e122] [cursor=pointer]:
                  - /url: /bills/state/state-member-5?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e125]:
                    - generic [ref=e126]:
                      - generic [ref=e127]:
                        - generic [ref=e128]: HB 504
                        - generic [ref=e129]: lower
                      - paragraph [ref=e130]: State Sponsored Bill 5
                      - paragraph [ref=e131]: Hearing scheduled
                    - generic [ref=e132]: 2026-01-20
                - link "HB 505 lower State Sponsored Bill 6 Hearing scheduled 2026-01-20" [ref=e133] [cursor=pointer]:
                  - /url: /bills/state/state-member-6?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e136]:
                    - generic [ref=e137]:
                      - generic [ref=e138]:
                        - generic [ref=e139]: HB 505
                        - generic [ref=e140]: lower
                      - paragraph [ref=e141]: State Sponsored Bill 6
                      - paragraph [ref=e142]: Hearing scheduled
                    - generic [ref=e143]: 2026-01-20
                - link "HB 506 lower State Sponsored Bill 7 Hearing scheduled 2026-01-20" [ref=e144] [cursor=pointer]:
                  - /url: /bills/state/state-member-7?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e147]:
                    - generic [ref=e148]:
                      - generic [ref=e149]:
                        - generic [ref=e150]: HB 506
                        - generic [ref=e151]: lower
                      - paragraph [ref=e152]: State Sponsored Bill 7
                      - paragraph [ref=e153]: Hearing scheduled
                    - generic [ref=e154]: 2026-01-20
                - link "HB 507 lower State Sponsored Bill 8 Hearing scheduled 2026-01-20" [ref=e155] [cursor=pointer]:
                  - /url: /bills/state/state-member-8?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e158]:
                    - generic [ref=e159]:
                      - generic [ref=e160]:
                        - generic [ref=e161]: HB 507
                        - generic [ref=e162]: lower
                      - paragraph [ref=e163]: State Sponsored Bill 8
                      - paragraph [ref=e164]: Hearing scheduled
                    - generic [ref=e165]: 2026-01-20
                - link "HB 508 lower State Sponsored Bill 9 Hearing scheduled 2026-01-20" [ref=e166] [cursor=pointer]:
                  - /url: /bills/state/state-member-9?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e169]:
                    - generic [ref=e170]:
                      - generic [ref=e171]:
                        - generic [ref=e172]: HB 508
                        - generic [ref=e173]: lower
                      - paragraph [ref=e174]: State Sponsored Bill 9
                      - paragraph [ref=e175]: Hearing scheduled
                    - generic [ref=e176]: 2026-01-20
                - link "HB 509 lower State Sponsored Bill 10 Hearing scheduled 2026-01-20" [ref=e177] [cursor=pointer]:
                  - /url: /bills/state/state-member-10?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e180]:
                    - generic [ref=e181]:
                      - generic [ref=e182]:
                        - generic [ref=e183]: HB 509
                        - generic [ref=e184]: lower
                      - paragraph [ref=e185]: State Sponsored Bill 10
                      - paragraph [ref=e186]: Hearing scheduled
                    - generic [ref=e187]: 2026-01-20
                - link "HB 510 lower State Sponsored Bill 11 Hearing scheduled 2026-01-20" [ref=e188] [cursor=pointer]:
                  - /url: /bills/state/state-member-11?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e191]:
                    - generic [ref=e192]:
                      - generic [ref=e193]:
                        - generic [ref=e194]: HB 510
                        - generic [ref=e195]: lower
                      - paragraph [ref=e196]: State Sponsored Bill 11
                      - paragraph [ref=e197]: Hearing scheduled
                    - generic [ref=e198]: 2026-01-20
                - link "HB 511 lower State Sponsored Bill 12 Hearing scheduled 2026-01-20" [ref=e199] [cursor=pointer]:
                  - /url: /bills/state/state-member-12?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e202]:
                    - generic [ref=e203]:
                      - generic [ref=e204]:
                        - generic [ref=e205]: HB 511
                        - generic [ref=e206]: lower
                      - paragraph [ref=e207]: State Sponsored Bill 12
                      - paragraph [ref=e208]: Hearing scheduled
                    - generic [ref=e209]: 2026-01-20
                - link "HB 512 lower State Sponsored Bill 13 Hearing scheduled 2026-01-20" [ref=e210] [cursor=pointer]:
                  - /url: /bills/state/state-member-13?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e213]:
                    - generic [ref=e214]:
                      - generic [ref=e215]:
                        - generic [ref=e216]: HB 512
                        - generic [ref=e217]: lower
                      - paragraph [ref=e218]: State Sponsored Bill 13
                      - paragraph [ref=e219]: Hearing scheduled
                    - generic [ref=e220]: 2026-01-20
                - link "HB 513 lower State Sponsored Bill 14 Hearing scheduled 2026-01-20" [ref=e221] [cursor=pointer]:
                  - /url: /bills/state/state-member-14?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e224]:
                    - generic [ref=e225]:
                      - generic [ref=e226]:
                        - generic [ref=e227]: HB 513
                        - generic [ref=e228]: lower
                      - paragraph [ref=e229]: State Sponsored Bill 14
                      - paragraph [ref=e230]: Hearing scheduled
                    - generic [ref=e231]: 2026-01-20
                - link "HB 514 lower State Sponsored Bill 15 Hearing scheduled 2026-01-20" [ref=e232] [cursor=pointer]:
                  - /url: /bills/state/state-member-15?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e235]:
                    - generic [ref=e236]:
                      - generic [ref=e237]:
                        - generic [ref=e238]: HB 514
                        - generic [ref=e239]: lower
                      - paragraph [ref=e240]: State Sponsored Bill 15
                      - paragraph [ref=e241]: Hearing scheduled
                    - generic [ref=e242]: 2026-01-20
                - link "HB 515 lower State Sponsored Bill 16 Hearing scheduled 2026-01-20" [ref=e243] [cursor=pointer]:
                  - /url: /bills/state/state-member-16?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e246]:
                    - generic [ref=e247]:
                      - generic [ref=e248]:
                        - generic [ref=e249]: HB 515
                        - generic [ref=e250]: lower
                      - paragraph [ref=e251]: State Sponsored Bill 16
                      - paragraph [ref=e252]: Hearing scheduled
                    - generic [ref=e253]: 2026-01-20
                - link "HB 516 lower State Sponsored Bill 17 Hearing scheduled 2026-01-20" [ref=e254] [cursor=pointer]:
                  - /url: /bills/state/state-member-17?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e257]:
                    - generic [ref=e258]:
                      - generic [ref=e259]:
                        - generic [ref=e260]: HB 516
                        - generic [ref=e261]: lower
                      - paragraph [ref=e262]: State Sponsored Bill 17
                      - paragraph [ref=e263]: Hearing scheduled
                    - generic [ref=e264]: 2026-01-20
                - link "HB 517 lower State Sponsored Bill 18 Hearing scheduled 2026-01-20" [ref=e265] [cursor=pointer]:
                  - /url: /bills/state/state-member-18?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e268]:
                    - generic [ref=e269]:
                      - generic [ref=e270]:
                        - generic [ref=e271]: HB 517
                        - generic [ref=e272]: lower
                      - paragraph [ref=e273]: State Sponsored Bill 18
                      - paragraph [ref=e274]: Hearing scheduled
                    - generic [ref=e275]: 2026-01-20
                - link "HB 518 lower State Sponsored Bill 19 Hearing scheduled 2026-01-20" [ref=e276] [cursor=pointer]:
                  - /url: /bills/state/state-member-19?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e279]:
                    - generic [ref=e280]:
                      - generic [ref=e281]:
                        - generic [ref=e282]: HB 518
                        - generic [ref=e283]: lower
                      - paragraph [ref=e284]: State Sponsored Bill 19
                      - paragraph [ref=e285]: Hearing scheduled
                    - generic [ref=e286]: 2026-01-20
                - link "HB 519 lower State Sponsored Bill 20 Hearing scheduled 2026-01-20" [ref=e287] [cursor=pointer]:
                  - /url: /bills/state/state-member-20?from=%2Frep%2Fstate%2FS123%3Ftype%3Dsponsored%26offset%3D0&name=State%20Member
                  - generic [ref=e290]:
                    - generic [ref=e291]:
                      - generic [ref=e292]:
                        - generic [ref=e293]: HB 519
                        - generic [ref=e294]: lower
                      - paragraph [ref=e295]: State Sponsored Bill 20
                      - paragraph [ref=e296]: Hearing scheduled
                    - generic [ref=e297]: 2026-01-20
              - generic [ref=e299]:
                - button "Previous" [disabled]
                - generic [ref=e300]: 1–20 of 26
                - button "Next" [ref=e301]
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