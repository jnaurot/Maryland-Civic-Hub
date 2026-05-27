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

  1626 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: state-bills.png

Call log:
  - Expect "toHaveScreenshot(state-bills.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 1626 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 1626 pixels (ratio 0.01 of all image pixels) are different.

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
            - /url: /bookmarks?from=%2Fbills%2Fstate&name=State%20Bills
            - button [ref=e10]:
              - img
          - button "Open menu" [ref=e11]:
            - img
    - main [ref=e12]:
      - generic [ref=e14]:
        - heading "Maryland State Bills" [level=1] [ref=e16]
        - generic [ref=e17]:
          - generic [ref=e19]:
            - img [ref=e20]
            - textbox "Search bills & representatives..." [ref=e23]
          - button "Status" [ref=e24]:
            - generic [ref=e25]: Status
        - generic [ref=e26]:
          - combobox [ref=e27]:
            - generic: All Chambers
            - img [ref=e28]
          - generic [ref=e30]: 37 bills
        - generic [ref=e32]:
          - 'link "HB 100 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 1 Latest: In committee Sponsor: Del. Example" [ref=e33] [cursor=pointer]':
            - /url: /bills/state/state-1?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e36]:
              - generic [ref=e37]:
                - generic [ref=e38]:
                  - generic [ref=e39]: HB 100
                  - generic [ref=e40]: House of Delegates
                  - generic [ref=e41]: Session 2026
                  - generic [ref=e42]: Introduced 2026-01-10
                - paragraph [ref=e43]: State Bill Title 1
                - paragraph [ref=e44]: "Latest: In committee"
                - paragraph [ref=e45]: "Sponsor: Del. Example"
              - img [ref=e46]
          - 'link "HB 101 Senate Session 2026 Introduced 2026-01-10 State Bill Title 2 Latest: In committee Sponsor: Del. Example" [ref=e48] [cursor=pointer]':
            - /url: /bills/state/state-2?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e51]:
              - generic [ref=e52]:
                - generic [ref=e53]:
                  - generic [ref=e54]: HB 101
                  - generic [ref=e55]: Senate
                  - generic [ref=e56]: Session 2026
                  - generic [ref=e57]: Introduced 2026-01-10
                - paragraph [ref=e58]: State Bill Title 2
                - paragraph [ref=e59]: "Latest: In committee"
                - paragraph [ref=e60]: "Sponsor: Del. Example"
              - img [ref=e61]
          - 'link "HB 102 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 3 Latest: In committee Sponsor: Del. Example" [ref=e63] [cursor=pointer]':
            - /url: /bills/state/state-3?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e66]:
              - generic [ref=e67]:
                - generic [ref=e68]:
                  - generic [ref=e69]: HB 102
                  - generic [ref=e70]: House of Delegates
                  - generic [ref=e71]: Session 2026
                  - generic [ref=e72]: Introduced 2026-01-10
                - paragraph [ref=e73]: State Bill Title 3
                - paragraph [ref=e74]: "Latest: In committee"
                - paragraph [ref=e75]: "Sponsor: Del. Example"
              - img [ref=e76]
          - 'link "HB 103 Senate Session 2026 Introduced 2026-01-10 State Bill Title 4 Latest: In committee Sponsor: Del. Example" [ref=e78] [cursor=pointer]':
            - /url: /bills/state/state-4?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e81]:
              - generic [ref=e82]:
                - generic [ref=e83]:
                  - generic [ref=e84]: HB 103
                  - generic [ref=e85]: Senate
                  - generic [ref=e86]: Session 2026
                  - generic [ref=e87]: Introduced 2026-01-10
                - paragraph [ref=e88]: State Bill Title 4
                - paragraph [ref=e89]: "Latest: In committee"
                - paragraph [ref=e90]: "Sponsor: Del. Example"
              - img [ref=e91]
          - 'link "HB 104 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 5 Latest: In committee Sponsor: Del. Example" [ref=e93] [cursor=pointer]':
            - /url: /bills/state/state-5?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e96]:
              - generic [ref=e97]:
                - generic [ref=e98]:
                  - generic [ref=e99]: HB 104
                  - generic [ref=e100]: House of Delegates
                  - generic [ref=e101]: Session 2026
                  - generic [ref=e102]: Introduced 2026-01-10
                - paragraph [ref=e103]: State Bill Title 5
                - paragraph [ref=e104]: "Latest: In committee"
                - paragraph [ref=e105]: "Sponsor: Del. Example"
              - img [ref=e106]
          - 'link "HB 105 Senate Session 2026 Introduced 2026-01-10 State Bill Title 6 Latest: In committee Sponsor: Del. Example" [ref=e108] [cursor=pointer]':
            - /url: /bills/state/state-6?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e111]:
              - generic [ref=e112]:
                - generic [ref=e113]:
                  - generic [ref=e114]: HB 105
                  - generic [ref=e115]: Senate
                  - generic [ref=e116]: Session 2026
                  - generic [ref=e117]: Introduced 2026-01-10
                - paragraph [ref=e118]: State Bill Title 6
                - paragraph [ref=e119]: "Latest: In committee"
                - paragraph [ref=e120]: "Sponsor: Del. Example"
              - img [ref=e121]
          - 'link "HB 106 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 7 Latest: In committee Sponsor: Del. Example" [ref=e123] [cursor=pointer]':
            - /url: /bills/state/state-7?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e126]:
              - generic [ref=e127]:
                - generic [ref=e128]:
                  - generic [ref=e129]: HB 106
                  - generic [ref=e130]: House of Delegates
                  - generic [ref=e131]: Session 2026
                  - generic [ref=e132]: Introduced 2026-01-10
                - paragraph [ref=e133]: State Bill Title 7
                - paragraph [ref=e134]: "Latest: In committee"
                - paragraph [ref=e135]: "Sponsor: Del. Example"
              - img [ref=e136]
          - 'link "HB 107 Senate Session 2026 Introduced 2026-01-10 State Bill Title 8 Latest: In committee Sponsor: Del. Example" [ref=e138] [cursor=pointer]':
            - /url: /bills/state/state-8?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e141]:
              - generic [ref=e142]:
                - generic [ref=e143]:
                  - generic [ref=e144]: HB 107
                  - generic [ref=e145]: Senate
                  - generic [ref=e146]: Session 2026
                  - generic [ref=e147]: Introduced 2026-01-10
                - paragraph [ref=e148]: State Bill Title 8
                - paragraph [ref=e149]: "Latest: In committee"
                - paragraph [ref=e150]: "Sponsor: Del. Example"
              - img [ref=e151]
          - 'link "HB 108 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 9 Latest: In committee Sponsor: Del. Example" [ref=e153] [cursor=pointer]':
            - /url: /bills/state/state-9?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e156]:
              - generic [ref=e157]:
                - generic [ref=e158]:
                  - generic [ref=e159]: HB 108
                  - generic [ref=e160]: House of Delegates
                  - generic [ref=e161]: Session 2026
                  - generic [ref=e162]: Introduced 2026-01-10
                - paragraph [ref=e163]: State Bill Title 9
                - paragraph [ref=e164]: "Latest: In committee"
                - paragraph [ref=e165]: "Sponsor: Del. Example"
              - img [ref=e166]
          - 'link "HB 109 Senate Session 2026 Introduced 2026-01-10 State Bill Title 10 Latest: In committee Sponsor: Del. Example" [ref=e168] [cursor=pointer]':
            - /url: /bills/state/state-10?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e171]:
              - generic [ref=e172]:
                - generic [ref=e173]:
                  - generic [ref=e174]: HB 109
                  - generic [ref=e175]: Senate
                  - generic [ref=e176]: Session 2026
                  - generic [ref=e177]: Introduced 2026-01-10
                - paragraph [ref=e178]: State Bill Title 10
                - paragraph [ref=e179]: "Latest: In committee"
                - paragraph [ref=e180]: "Sponsor: Del. Example"
              - img [ref=e181]
          - 'link "HB 110 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 11 Latest: In committee Sponsor: Del. Example" [ref=e183] [cursor=pointer]':
            - /url: /bills/state/state-11?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e186]:
              - generic [ref=e187]:
                - generic [ref=e188]:
                  - generic [ref=e189]: HB 110
                  - generic [ref=e190]: House of Delegates
                  - generic [ref=e191]: Session 2026
                  - generic [ref=e192]: Introduced 2026-01-10
                - paragraph [ref=e193]: State Bill Title 11
                - paragraph [ref=e194]: "Latest: In committee"
                - paragraph [ref=e195]: "Sponsor: Del. Example"
              - img [ref=e196]
          - 'link "HB 111 Senate Session 2026 Introduced 2026-01-10 State Bill Title 12 Latest: In committee Sponsor: Del. Example" [ref=e198] [cursor=pointer]':
            - /url: /bills/state/state-12?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e201]:
              - generic [ref=e202]:
                - generic [ref=e203]:
                  - generic [ref=e204]: HB 111
                  - generic [ref=e205]: Senate
                  - generic [ref=e206]: Session 2026
                  - generic [ref=e207]: Introduced 2026-01-10
                - paragraph [ref=e208]: State Bill Title 12
                - paragraph [ref=e209]: "Latest: In committee"
                - paragraph [ref=e210]: "Sponsor: Del. Example"
              - img [ref=e211]
          - 'link "HB 112 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 13 Latest: In committee Sponsor: Del. Example" [ref=e213] [cursor=pointer]':
            - /url: /bills/state/state-13?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e216]:
              - generic [ref=e217]:
                - generic [ref=e218]:
                  - generic [ref=e219]: HB 112
                  - generic [ref=e220]: House of Delegates
                  - generic [ref=e221]: Session 2026
                  - generic [ref=e222]: Introduced 2026-01-10
                - paragraph [ref=e223]: State Bill Title 13
                - paragraph [ref=e224]: "Latest: In committee"
                - paragraph [ref=e225]: "Sponsor: Del. Example"
              - img [ref=e226]
          - 'link "HB 113 Senate Session 2026 Introduced 2026-01-10 State Bill Title 14 Latest: In committee Sponsor: Del. Example" [ref=e228] [cursor=pointer]':
            - /url: /bills/state/state-14?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e231]:
              - generic [ref=e232]:
                - generic [ref=e233]:
                  - generic [ref=e234]: HB 113
                  - generic [ref=e235]: Senate
                  - generic [ref=e236]: Session 2026
                  - generic [ref=e237]: Introduced 2026-01-10
                - paragraph [ref=e238]: State Bill Title 14
                - paragraph [ref=e239]: "Latest: In committee"
                - paragraph [ref=e240]: "Sponsor: Del. Example"
              - img [ref=e241]
          - 'link "HB 114 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 15 Latest: In committee Sponsor: Del. Example" [ref=e243] [cursor=pointer]':
            - /url: /bills/state/state-15?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e246]:
              - generic [ref=e247]:
                - generic [ref=e248]:
                  - generic [ref=e249]: HB 114
                  - generic [ref=e250]: House of Delegates
                  - generic [ref=e251]: Session 2026
                  - generic [ref=e252]: Introduced 2026-01-10
                - paragraph [ref=e253]: State Bill Title 15
                - paragraph [ref=e254]: "Latest: In committee"
                - paragraph [ref=e255]: "Sponsor: Del. Example"
              - img [ref=e256]
          - 'link "HB 115 Senate Session 2026 Introduced 2026-01-10 State Bill Title 16 Latest: In committee Sponsor: Del. Example" [ref=e258] [cursor=pointer]':
            - /url: /bills/state/state-16?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e261]:
              - generic [ref=e262]:
                - generic [ref=e263]:
                  - generic [ref=e264]: HB 115
                  - generic [ref=e265]: Senate
                  - generic [ref=e266]: Session 2026
                  - generic [ref=e267]: Introduced 2026-01-10
                - paragraph [ref=e268]: State Bill Title 16
                - paragraph [ref=e269]: "Latest: In committee"
                - paragraph [ref=e270]: "Sponsor: Del. Example"
              - img [ref=e271]
          - 'link "HB 116 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 17 Latest: In committee Sponsor: Del. Example" [ref=e273] [cursor=pointer]':
            - /url: /bills/state/state-17?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e276]:
              - generic [ref=e277]:
                - generic [ref=e278]:
                  - generic [ref=e279]: HB 116
                  - generic [ref=e280]: House of Delegates
                  - generic [ref=e281]: Session 2026
                  - generic [ref=e282]: Introduced 2026-01-10
                - paragraph [ref=e283]: State Bill Title 17
                - paragraph [ref=e284]: "Latest: In committee"
                - paragraph [ref=e285]: "Sponsor: Del. Example"
              - img [ref=e286]
          - 'link "HB 117 Senate Session 2026 Introduced 2026-01-10 State Bill Title 18 Latest: In committee Sponsor: Del. Example" [ref=e288] [cursor=pointer]':
            - /url: /bills/state/state-18?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e291]:
              - generic [ref=e292]:
                - generic [ref=e293]:
                  - generic [ref=e294]: HB 117
                  - generic [ref=e295]: Senate
                  - generic [ref=e296]: Session 2026
                  - generic [ref=e297]: Introduced 2026-01-10
                - paragraph [ref=e298]: State Bill Title 18
                - paragraph [ref=e299]: "Latest: In committee"
                - paragraph [ref=e300]: "Sponsor: Del. Example"
              - img [ref=e301]
          - 'link "HB 118 House of Delegates Session 2026 Introduced 2026-01-10 State Bill Title 19 Latest: In committee Sponsor: Del. Example" [ref=e303] [cursor=pointer]':
            - /url: /bills/state/state-19?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e306]:
              - generic [ref=e307]:
                - generic [ref=e308]:
                  - generic [ref=e309]: HB 118
                  - generic [ref=e310]: House of Delegates
                  - generic [ref=e311]: Session 2026
                  - generic [ref=e312]: Introduced 2026-01-10
                - paragraph [ref=e313]: State Bill Title 19
                - paragraph [ref=e314]: "Latest: In committee"
                - paragraph [ref=e315]: "Sponsor: Del. Example"
              - img [ref=e316]
          - 'link "HB 119 Senate Session 2026 Introduced 2026-01-10 State Bill Title 20 Latest: In committee Sponsor: Del. Example" [ref=e318] [cursor=pointer]':
            - /url: /bills/state/state-20?from=%2Fbills%2Fstate%3Fchamber%3Dall%26offset%3D0&name=Maryland%20State%20Bills
            - generic [ref=e321]:
              - generic [ref=e322]:
                - generic [ref=e323]:
                  - generic [ref=e324]: HB 119
                  - generic [ref=e325]: Senate
                  - generic [ref=e326]: Session 2026
                  - generic [ref=e327]: Introduced 2026-01-10
                - paragraph [ref=e328]: State Bill Title 20
                - paragraph [ref=e329]: "Latest: In committee"
                - paragraph [ref=e330]: "Sponsor: Del. Example"
              - img [ref=e331]
        - generic [ref=e334]: 3/37
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