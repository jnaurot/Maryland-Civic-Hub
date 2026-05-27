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

  2530 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: federal-bills.png

Call log:
  - Expect "toHaveScreenshot(federal-bills.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 2530 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 2530 pixels (ratio 0.01 of all image pixels) are different.

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
            - /url: /bookmarks?from=%2Fbills%2Ffederal&name=Federal%20Bills
            - button [ref=e14]:
              - img
    - main [ref=e15]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - heading "Federal Bills" [level=1] [ref=e19]
          - paragraph [ref=e20]: Bills currently being considered in the U.S. Congress
        - generic [ref=e21]:
          - generic [ref=e23]:
            - img [ref=e24]
            - textbox "Search bills & representatives..." [ref=e27]
          - button "Status Off" [ref=e28]:
            - generic [ref=e29]: Status Off
        - generic [ref=e30]:
          - combobox [ref=e31]:
            - generic: Both Chambers
            - img [ref=e32]
          - generic [ref=e34]: 48 bills
        - generic [ref=e36]:
          - 'link "HR 1000 House Introduced 2026-01-15 Federal Bill Title 1 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e37] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1000?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e40]:
              - generic [ref=e41]:
                - generic [ref=e42]:
                  - generic [ref=e43]: HR 1000
                  - generic [ref=e44]: House
                  - generic [ref=e45]: Introduced 2026-01-15
                - paragraph [ref=e46]: Federal Bill Title 1
                - paragraph [ref=e47]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e48]: "Sponsor: Jane Doe"
              - img [ref=e49]
          - 'link "HR 1001 Senate Introduced 2026-01-15 Federal Bill Title 2 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e51] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1001?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e54]:
              - generic [ref=e55]:
                - generic [ref=e56]:
                  - generic [ref=e57]: HR 1001
                  - generic [ref=e58]: Senate
                  - generic [ref=e59]: Introduced 2026-01-15
                - paragraph [ref=e60]: Federal Bill Title 2
                - paragraph [ref=e61]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e62]: "Sponsor: Jane Doe"
              - img [ref=e63]
          - 'link "HR 1002 House Introduced 2026-01-15 Federal Bill Title 3 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e65] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1002?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e68]:
              - generic [ref=e69]:
                - generic [ref=e70]:
                  - generic [ref=e71]: HR 1002
                  - generic [ref=e72]: House
                  - generic [ref=e73]: Introduced 2026-01-15
                - paragraph [ref=e74]: Federal Bill Title 3
                - paragraph [ref=e75]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e76]: "Sponsor: Jane Doe"
              - img [ref=e77]
          - 'link "HR 1003 Senate Introduced 2026-01-15 Federal Bill Title 4 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e79] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1003?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e82]:
              - generic [ref=e83]:
                - generic [ref=e84]:
                  - generic [ref=e85]: HR 1003
                  - generic [ref=e86]: Senate
                  - generic [ref=e87]: Introduced 2026-01-15
                - paragraph [ref=e88]: Federal Bill Title 4
                - paragraph [ref=e89]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e90]: "Sponsor: Jane Doe"
              - img [ref=e91]
          - 'link "HR 1004 House Introduced 2026-01-15 Federal Bill Title 5 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e93] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1004?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e96]:
              - generic [ref=e97]:
                - generic [ref=e98]:
                  - generic [ref=e99]: HR 1004
                  - generic [ref=e100]: House
                  - generic [ref=e101]: Introduced 2026-01-15
                - paragraph [ref=e102]: Federal Bill Title 5
                - paragraph [ref=e103]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e104]: "Sponsor: Jane Doe"
              - img [ref=e105]
          - 'link "HR 1005 Senate Introduced 2026-01-15 Federal Bill Title 6 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e107] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1005?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e110]:
              - generic [ref=e111]:
                - generic [ref=e112]:
                  - generic [ref=e113]: HR 1005
                  - generic [ref=e114]: Senate
                  - generic [ref=e115]: Introduced 2026-01-15
                - paragraph [ref=e116]: Federal Bill Title 6
                - paragraph [ref=e117]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e118]: "Sponsor: Jane Doe"
              - img [ref=e119]
          - 'link "HR 1006 House Introduced 2026-01-15 Federal Bill Title 7 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e121] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1006?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e124]:
              - generic [ref=e125]:
                - generic [ref=e126]:
                  - generic [ref=e127]: HR 1006
                  - generic [ref=e128]: House
                  - generic [ref=e129]: Introduced 2026-01-15
                - paragraph [ref=e130]: Federal Bill Title 7
                - paragraph [ref=e131]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e132]: "Sponsor: Jane Doe"
              - img [ref=e133]
          - 'link "HR 1007 Senate Introduced 2026-01-15 Federal Bill Title 8 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e135] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1007?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e138]:
              - generic [ref=e139]:
                - generic [ref=e140]:
                  - generic [ref=e141]: HR 1007
                  - generic [ref=e142]: Senate
                  - generic [ref=e143]: Introduced 2026-01-15
                - paragraph [ref=e144]: Federal Bill Title 8
                - paragraph [ref=e145]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e146]: "Sponsor: Jane Doe"
              - img [ref=e147]
          - 'link "HR 1008 House Introduced 2026-01-15 Federal Bill Title 9 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e149] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1008?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e152]:
              - generic [ref=e153]:
                - generic [ref=e154]:
                  - generic [ref=e155]: HR 1008
                  - generic [ref=e156]: House
                  - generic [ref=e157]: Introduced 2026-01-15
                - paragraph [ref=e158]: Federal Bill Title 9
                - paragraph [ref=e159]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e160]: "Sponsor: Jane Doe"
              - img [ref=e161]
          - 'link "HR 1009 Senate Introduced 2026-01-15 Federal Bill Title 10 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e163] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1009?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e166]:
              - generic [ref=e167]:
                - generic [ref=e168]:
                  - generic [ref=e169]: HR 1009
                  - generic [ref=e170]: Senate
                  - generic [ref=e171]: Introduced 2026-01-15
                - paragraph [ref=e172]: Federal Bill Title 10
                - paragraph [ref=e173]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e174]: "Sponsor: Jane Doe"
              - img [ref=e175]
          - 'link "HR 1010 House Introduced 2026-01-15 Federal Bill Title 11 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e177] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1010?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e180]:
              - generic [ref=e181]:
                - generic [ref=e182]:
                  - generic [ref=e183]: HR 1010
                  - generic [ref=e184]: House
                  - generic [ref=e185]: Introduced 2026-01-15
                - paragraph [ref=e186]: Federal Bill Title 11
                - paragraph [ref=e187]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e188]: "Sponsor: Jane Doe"
              - img [ref=e189]
          - 'link "HR 1011 Senate Introduced 2026-01-15 Federal Bill Title 12 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e191] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1011?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e194]:
              - generic [ref=e195]:
                - generic [ref=e196]:
                  - generic [ref=e197]: HR 1011
                  - generic [ref=e198]: Senate
                  - generic [ref=e199]: Introduced 2026-01-15
                - paragraph [ref=e200]: Federal Bill Title 12
                - paragraph [ref=e201]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e202]: "Sponsor: Jane Doe"
              - img [ref=e203]
          - 'link "HR 1012 House Introduced 2026-01-15 Federal Bill Title 13 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e205] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1012?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e208]:
              - generic [ref=e209]:
                - generic [ref=e210]:
                  - generic [ref=e211]: HR 1012
                  - generic [ref=e212]: House
                  - generic [ref=e213]: Introduced 2026-01-15
                - paragraph [ref=e214]: Federal Bill Title 13
                - paragraph [ref=e215]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e216]: "Sponsor: Jane Doe"
              - img [ref=e217]
          - 'link "HR 1013 Senate Introduced 2026-01-15 Federal Bill Title 14 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e219] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1013?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e222]:
              - generic [ref=e223]:
                - generic [ref=e224]:
                  - generic [ref=e225]: HR 1013
                  - generic [ref=e226]: Senate
                  - generic [ref=e227]: Introduced 2026-01-15
                - paragraph [ref=e228]: Federal Bill Title 14
                - paragraph [ref=e229]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e230]: "Sponsor: Jane Doe"
              - img [ref=e231]
          - 'link "HR 1014 House Introduced 2026-01-15 Federal Bill Title 15 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e233] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1014?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e236]:
              - generic [ref=e237]:
                - generic [ref=e238]:
                  - generic [ref=e239]: HR 1014
                  - generic [ref=e240]: House
                  - generic [ref=e241]: Introduced 2026-01-15
                - paragraph [ref=e242]: Federal Bill Title 15
                - paragraph [ref=e243]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e244]: "Sponsor: Jane Doe"
              - img [ref=e245]
          - 'link "HR 1015 Senate Introduced 2026-01-15 Federal Bill Title 16 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e247] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1015?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e250]:
              - generic [ref=e251]:
                - generic [ref=e252]:
                  - generic [ref=e253]: HR 1015
                  - generic [ref=e254]: Senate
                  - generic [ref=e255]: Introduced 2026-01-15
                - paragraph [ref=e256]: Federal Bill Title 16
                - paragraph [ref=e257]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e258]: "Sponsor: Jane Doe"
              - img [ref=e259]
          - 'link "HR 1016 House Introduced 2026-01-15 Federal Bill Title 17 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e261] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1016?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e264]:
              - generic [ref=e265]:
                - generic [ref=e266]:
                  - generic [ref=e267]: HR 1016
                  - generic [ref=e268]: House
                  - generic [ref=e269]: Introduced 2026-01-15
                - paragraph [ref=e270]: Federal Bill Title 17
                - paragraph [ref=e271]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e272]: "Sponsor: Jane Doe"
              - img [ref=e273]
          - 'link "HR 1017 Senate Introduced 2026-01-15 Federal Bill Title 18 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e275] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1017?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e278]:
              - generic [ref=e279]:
                - generic [ref=e280]:
                  - generic [ref=e281]: HR 1017
                  - generic [ref=e282]: Senate
                  - generic [ref=e283]: Introduced 2026-01-15
                - paragraph [ref=e284]: Federal Bill Title 18
                - paragraph [ref=e285]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e286]: "Sponsor: Jane Doe"
              - img [ref=e287]
          - 'link "HR 1018 House Introduced 2026-01-15 Federal Bill Title 19 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e289] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1018?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e292]:
              - generic [ref=e293]:
                - generic [ref=e294]:
                  - generic [ref=e295]: HR 1018
                  - generic [ref=e296]: House
                  - generic [ref=e297]: Introduced 2026-01-15
                - paragraph [ref=e298]: Federal Bill Title 19
                - paragraph [ref=e299]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e300]: "Sponsor: Jane Doe"
              - img [ref=e301]
          - 'link "HR 1019 Senate Introduced 2026-01-15 Federal Bill Title 20 Latest: Referred to Committee (2026-02-01) Sponsor: Jane Doe" [ref=e303] [cursor=pointer]':
            - /url: /bills/federal/119/hr/1019?from=%2Fbills%2Ffederal%3Fchamber%3Dboth%26offset%3D0&name=Federal%20Bills
            - generic [ref=e306]:
              - generic [ref=e307]:
                - generic [ref=e308]:
                  - generic [ref=e309]: HR 1019
                  - generic [ref=e310]: Senate
                  - generic [ref=e311]: Introduced 2026-01-15
                - paragraph [ref=e312]: Federal Bill Title 20
                - paragraph [ref=e313]: "Latest: Referred to Committee (2026-02-01)"
                - paragraph [ref=e314]: "Sponsor: Jane Doe"
              - img [ref=e315]
        - generic [ref=e318]:
          - button "Previous" [disabled]
          - generic [ref=e319]: 1–20 of 48
          - button "Next" [ref=e320]
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