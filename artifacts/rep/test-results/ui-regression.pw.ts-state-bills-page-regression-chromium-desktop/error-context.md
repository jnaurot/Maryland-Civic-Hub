# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-regression.pw.ts >> state bills page regression
- Location: artifacts/rep/e2e/ui-regression.pw.ts:169:1

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  2289 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: state-bills.png

Call log:
  - Expect "toHaveScreenshot(state-bills.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 2289 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 2289 pixels (ratio 0.01 of all image pixels) are different.

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
            - /url: /bookmarks?from=%2Fbills%2Fstate&name=State%20Bills
            - button [ref=e14]:
              - img
    - main [ref=e15]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - heading "Maryland State Bills" [level=1] [ref=e19]
          - paragraph [ref=e20]: Bills being considered in the Maryland legislature
        - generic [ref=e21]:
          - generic [ref=e23]:
            - img [ref=e24]
            - textbox "Search bills & representatives..." [ref=e27]
          - button "Status Off" [ref=e28]:
            - generic [ref=e29]: Status Off
        - generic [ref=e30]:
          - combobox [ref=e31]:
            - generic: All Chambers
            - img [ref=e32]
          - generic [ref=e34]: 37 bills
        - generic [ref=e36]:
          - 'link "HB 100 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 1 Latest: In committee Sponsor: Del. Example" [ref=e37] [cursor=pointer]':
            - /url: /bills/state/state-1?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e40]:
              - generic [ref=e41]:
                - generic [ref=e42]:
                  - generic [ref=e43]: HB 100
                  - generic [ref=e44]: House of Delegates
                  - generic [ref=e45]: Session 2026
                  - generic [ref=e46]: Introduced 2026-01-10
                - paragraph [ref=e47]: State Bill Title 1
                - paragraph [ref=e48]: "Latest: In committee"
                - paragraph [ref=e49]: "Sponsor: Del. Example"
              - img [ref=e50]
          - 'link "HB 101 Senate Session 2026 Introduced 2026-01-10 State Bill Title 2 Latest: In committee Sponsor: Del. Example" [ref=e52] [cursor=pointer]':
            - /url: /bills/state/state-2?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e55]:
              - generic [ref=e56]:
                - generic [ref=e57]:
                  - generic [ref=e58]: HB 101
                  - generic [ref=e59]: Senate
                  - generic [ref=e60]: Session 2026
                  - generic [ref=e61]: Introduced 2026-01-10
                - paragraph [ref=e62]: State Bill Title 2
                - paragraph [ref=e63]: "Latest: In committee"
                - paragraph [ref=e64]: "Sponsor: Del. Example"
              - img [ref=e65]
          - 'link "HB 102 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 3 Latest: In committee Sponsor: Del. Example" [ref=e67] [cursor=pointer]':
            - /url: /bills/state/state-3?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e70]:
              - generic [ref=e71]:
                - generic [ref=e72]:
                  - generic [ref=e73]: HB 102
                  - generic [ref=e74]: House of Delegates
                  - generic [ref=e75]: Session 2026
                  - generic [ref=e76]: Introduced 2026-01-10
                - paragraph [ref=e77]: State Bill Title 3
                - paragraph [ref=e78]: "Latest: In committee"
                - paragraph [ref=e79]: "Sponsor: Del. Example"
              - img [ref=e80]
          - 'link "HB 103 Senate Session 2026 Introduced 2026-01-10 State Bill Title 4 Latest: In committee Sponsor: Del. Example" [ref=e82] [cursor=pointer]':
            - /url: /bills/state/state-4?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e85]:
              - generic [ref=e86]:
                - generic [ref=e87]:
                  - generic [ref=e88]: HB 103
                  - generic [ref=e89]: Senate
                  - generic [ref=e90]: Session 2026
                  - generic [ref=e91]: Introduced 2026-01-10
                - paragraph [ref=e92]: State Bill Title 4
                - paragraph [ref=e93]: "Latest: In committee"
                - paragraph [ref=e94]: "Sponsor: Del. Example"
              - img [ref=e95]
          - 'link "HB 104 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 5 Latest: In committee Sponsor: Del. Example" [ref=e97] [cursor=pointer]':
            - /url: /bills/state/state-5?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e100]:
              - generic [ref=e101]:
                - generic [ref=e102]:
                  - generic [ref=e103]: HB 104
                  - generic [ref=e104]: House of Delegates
                  - generic [ref=e105]: Session 2026
                  - generic [ref=e106]: Introduced 2026-01-10
                - paragraph [ref=e107]: State Bill Title 5
                - paragraph [ref=e108]: "Latest: In committee"
                - paragraph [ref=e109]: "Sponsor: Del. Example"
              - img [ref=e110]
          - 'link "HB 105 Senate Session 2026 Introduced 2026-01-10 State Bill Title 6 Latest: In committee Sponsor: Del. Example" [ref=e112] [cursor=pointer]':
            - /url: /bills/state/state-6?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e115]:
              - generic [ref=e116]:
                - generic [ref=e117]:
                  - generic [ref=e118]: HB 105
                  - generic [ref=e119]: Senate
                  - generic [ref=e120]: Session 2026
                  - generic [ref=e121]: Introduced 2026-01-10
                - paragraph [ref=e122]: State Bill Title 6
                - paragraph [ref=e123]: "Latest: In committee"
                - paragraph [ref=e124]: "Sponsor: Del. Example"
              - img [ref=e125]
          - 'link "HB 106 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 7 Latest: In committee Sponsor: Del. Example" [ref=e127] [cursor=pointer]':
            - /url: /bills/state/state-7?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e130]:
              - generic [ref=e131]:
                - generic [ref=e132]:
                  - generic [ref=e133]: HB 106
                  - generic [ref=e134]: House of Delegates
                  - generic [ref=e135]: Session 2026
                  - generic [ref=e136]: Introduced 2026-01-10
                - paragraph [ref=e137]: State Bill Title 7
                - paragraph [ref=e138]: "Latest: In committee"
                - paragraph [ref=e139]: "Sponsor: Del. Example"
              - img [ref=e140]
          - 'link "HB 107 Senate Session 2026 Introduced 2026-01-10 State Bill Title 8 Latest: In committee Sponsor: Del. Example" [ref=e142] [cursor=pointer]':
            - /url: /bills/state/state-8?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e145]:
              - generic [ref=e146]:
                - generic [ref=e147]:
                  - generic [ref=e148]: HB 107
                  - generic [ref=e149]: Senate
                  - generic [ref=e150]: Session 2026
                  - generic [ref=e151]: Introduced 2026-01-10
                - paragraph [ref=e152]: State Bill Title 8
                - paragraph [ref=e153]: "Latest: In committee"
                - paragraph [ref=e154]: "Sponsor: Del. Example"
              - img [ref=e155]
          - 'link "HB 108 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 9 Latest: In committee Sponsor: Del. Example" [ref=e157] [cursor=pointer]':
            - /url: /bills/state/state-9?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e160]:
              - generic [ref=e161]:
                - generic [ref=e162]:
                  - generic [ref=e163]: HB 108
                  - generic [ref=e164]: House of Delegates
                  - generic [ref=e165]: Session 2026
                  - generic [ref=e166]: Introduced 2026-01-10
                - paragraph [ref=e167]: State Bill Title 9
                - paragraph [ref=e168]: "Latest: In committee"
                - paragraph [ref=e169]: "Sponsor: Del. Example"
              - img [ref=e170]
          - 'link "HB 109 Senate Session 2026 Introduced 2026-01-10 State Bill Title 10 Latest: In committee Sponsor: Del. Example" [ref=e172] [cursor=pointer]':
            - /url: /bills/state/state-10?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e175]:
              - generic [ref=e176]:
                - generic [ref=e177]:
                  - generic [ref=e178]: HB 109
                  - generic [ref=e179]: Senate
                  - generic [ref=e180]: Session 2026
                  - generic [ref=e181]: Introduced 2026-01-10
                - paragraph [ref=e182]: State Bill Title 10
                - paragraph [ref=e183]: "Latest: In committee"
                - paragraph [ref=e184]: "Sponsor: Del. Example"
              - img [ref=e185]
          - 'link "HB 110 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 11 Latest: In committee Sponsor: Del. Example" [ref=e187] [cursor=pointer]':
            - /url: /bills/state/state-11?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e190]:
              - generic [ref=e191]:
                - generic [ref=e192]:
                  - generic [ref=e193]: HB 110
                  - generic [ref=e194]: House of Delegates
                  - generic [ref=e195]: Session 2026
                  - generic [ref=e196]: Introduced 2026-01-10
                - paragraph [ref=e197]: State Bill Title 11
                - paragraph [ref=e198]: "Latest: In committee"
                - paragraph [ref=e199]: "Sponsor: Del. Example"
              - img [ref=e200]
          - 'link "HB 111 Senate Session 2026 Introduced 2026-01-10 State Bill Title 12 Latest: In committee Sponsor: Del. Example" [ref=e202] [cursor=pointer]':
            - /url: /bills/state/state-12?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e205]:
              - generic [ref=e206]:
                - generic [ref=e207]:
                  - generic [ref=e208]: HB 111
                  - generic [ref=e209]: Senate
                  - generic [ref=e210]: Session 2026
                  - generic [ref=e211]: Introduced 2026-01-10
                - paragraph [ref=e212]: State Bill Title 12
                - paragraph [ref=e213]: "Latest: In committee"
                - paragraph [ref=e214]: "Sponsor: Del. Example"
              - img [ref=e215]
          - 'link "HB 112 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 13 Latest: In committee Sponsor: Del. Example" [ref=e217] [cursor=pointer]':
            - /url: /bills/state/state-13?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e220]:
              - generic [ref=e221]:
                - generic [ref=e222]:
                  - generic [ref=e223]: HB 112
                  - generic [ref=e224]: House of Delegates
                  - generic [ref=e225]: Session 2026
                  - generic [ref=e226]: Introduced 2026-01-10
                - paragraph [ref=e227]: State Bill Title 13
                - paragraph [ref=e228]: "Latest: In committee"
                - paragraph [ref=e229]: "Sponsor: Del. Example"
              - img [ref=e230]
          - 'link "HB 113 Senate Session 2026 Introduced 2026-01-10 State Bill Title 14 Latest: In committee Sponsor: Del. Example" [ref=e232] [cursor=pointer]':
            - /url: /bills/state/state-14?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e235]:
              - generic [ref=e236]:
                - generic [ref=e237]:
                  - generic [ref=e238]: HB 113
                  - generic [ref=e239]: Senate
                  - generic [ref=e240]: Session 2026
                  - generic [ref=e241]: Introduced 2026-01-10
                - paragraph [ref=e242]: State Bill Title 14
                - paragraph [ref=e243]: "Latest: In committee"
                - paragraph [ref=e244]: "Sponsor: Del. Example"
              - img [ref=e245]
          - 'link "HB 114 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 15 Latest: In committee Sponsor: Del. Example" [ref=e247] [cursor=pointer]':
            - /url: /bills/state/state-15?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e250]:
              - generic [ref=e251]:
                - generic [ref=e252]:
                  - generic [ref=e253]: HB 114
                  - generic [ref=e254]: House of Delegates
                  - generic [ref=e255]: Session 2026
                  - generic [ref=e256]: Introduced 2026-01-10
                - paragraph [ref=e257]: State Bill Title 15
                - paragraph [ref=e258]: "Latest: In committee"
                - paragraph [ref=e259]: "Sponsor: Del. Example"
              - img [ref=e260]
          - 'link "HB 115 Senate Session 2026 Introduced 2026-01-10 State Bill Title 16 Latest: In committee Sponsor: Del. Example" [ref=e262] [cursor=pointer]':
            - /url: /bills/state/state-16?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e265]:
              - generic [ref=e266]:
                - generic [ref=e267]:
                  - generic [ref=e268]: HB 115
                  - generic [ref=e269]: Senate
                  - generic [ref=e270]: Session 2026
                  - generic [ref=e271]: Introduced 2026-01-10
                - paragraph [ref=e272]: State Bill Title 16
                - paragraph [ref=e273]: "Latest: In committee"
                - paragraph [ref=e274]: "Sponsor: Del. Example"
              - img [ref=e275]
          - 'link "HB 116 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 17 Latest: In committee Sponsor: Del. Example" [ref=e277] [cursor=pointer]':
            - /url: /bills/state/state-17?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e280]:
              - generic [ref=e281]:
                - generic [ref=e282]:
                  - generic [ref=e283]: HB 116
                  - generic [ref=e284]: House of Delegates
                  - generic [ref=e285]: Session 2026
                  - generic [ref=e286]: Introduced 2026-01-10
                - paragraph [ref=e287]: State Bill Title 17
                - paragraph [ref=e288]: "Latest: In committee"
                - paragraph [ref=e289]: "Sponsor: Del. Example"
              - img [ref=e290]
          - 'link "HB 117 Senate Session 2026 Introduced 2026-01-10 State Bill Title 18 Latest: In committee Sponsor: Del. Example" [ref=e292] [cursor=pointer]':
            - /url: /bills/state/state-18?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e295]:
              - generic [ref=e296]:
                - generic [ref=e297]:
                  - generic [ref=e298]: HB 117
                  - generic [ref=e299]: Senate
                  - generic [ref=e300]: Session 2026
                  - generic [ref=e301]: Introduced 2026-01-10
                - paragraph [ref=e302]: State Bill Title 18
                - paragraph [ref=e303]: "Latest: In committee"
                - paragraph [ref=e304]: "Sponsor: Del. Example"
              - img [ref=e305]
          - 'link "HB 118 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 19 Latest: In committee Sponsor: Del. Example" [ref=e307] [cursor=pointer]':
            - /url: /bills/state/state-19?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e310]:
              - generic [ref=e311]:
                - generic [ref=e312]:
                  - generic [ref=e313]: HB 118
                  - generic [ref=e314]: House of Delegates
                  - generic [ref=e315]: Session 2026
                  - generic [ref=e316]: Introduced 2026-01-10
                - paragraph [ref=e317]: State Bill Title 19
                - paragraph [ref=e318]: "Latest: In committee"
                - paragraph [ref=e319]: "Sponsor: Del. Example"
              - img [ref=e320]
          - 'link "HB 119 Senate Session 2026 Introduced 2026-01-10 State Bill Title 20 Latest: In committee Sponsor: Del. Example" [ref=e322] [cursor=pointer]':
            - /url: /bills/state/state-20?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e325]:
              - generic [ref=e326]:
                - generic [ref=e327]:
                  - generic [ref=e328]: HB 119
                  - generic [ref=e329]: Senate
                  - generic [ref=e330]: Session 2026
                  - generic [ref=e331]: Introduced 2026-01-10
                - paragraph [ref=e332]: State Bill Title 20
                - paragraph [ref=e333]: "Latest: In committee"
                - paragraph [ref=e334]: "Sponsor: Del. Example"
              - img [ref=e335]
        - generic [ref=e338]:
          - button "Previous" [disabled]
          - generic [ref=e339]: 1–20 of 37
          - button "Next" [ref=e340]
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
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
  166 |   await expect(page).toHaveScreenshot("federal-bills.png", { fullPage: true });
  167 | });
  168 | 
  169 | test("state bills page regression", async ({ page }) => {
  170 |   await page.goto("/bills/state");
> 171 |   await expect(page).toHaveScreenshot("state-bills.png", { fullPage: true });
      |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
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