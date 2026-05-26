import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveInitialQuery } from "./Home";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSource() {
  return readFileSync(resolve(import.meta.dirname, "Home.tsx"), "utf8");
}

// ── Source guards ─────────────────────────────────────────────────────────────
// These act as regression tripwires: if someone re-introduces the old behaviour
// of seeding the query box from lastSearchedAddress, the guards will fail.

describe("Home.tsx source guards — query init", () => {
  it("query useState uses resolveInitialQuery, not a raw inline expression", () => {
    const src = getSource();
    expect(src).toContain("useState(() => resolveInitialQuery(pageSearch))");
  });

  it("does NOT initialise query from lastSearchedAddress", () => {
    // Old bug: `q ?? lastSearchedAddress ?? ""` put the address in the search
    // box on return from a rep detail page, forcing the user to clear it first.
    const src = getSource();
    expect(src).not.toMatch(/resolveInitialQuery[\s\S]{0,120}lastSearchedAddress/);
    // Also ensure the raw old pattern is gone
    expect(src).not.toContain("q ?? lastSearchedAddress");
  });

  it("searchAddress is still initialised from lastSearchedAddress (reps must load on return)", () => {
    // Regression guard: reps are driven by searchAddress, not query.
    // If this initialization is ever removed, reps will stop loading when the
    // user navigates back to the home page with a saved address.
    const src = getSource();
    expect(src).toContain('useState(lastSearchedAddress ?? "")');
  });
});

// ── Unit tests — resolveInitialQuery ─────────────────────────────────────────

describe("resolveInitialQuery", () => {
  it("returns empty string with no search params (fresh session)", () => {
    expect(resolveInitialQuery("")).toBe("");
  });

  it("returns empty string when only lastSearchedAddress exists — the fix", () => {
    // The old code returned the address here. After the fix the box is empty
    // so the user can immediately type a bill or representative search.
    // reps still load via searchAddress; address is shown in the results header.
    expect(resolveInitialQuery("")).toBe("");
  });

  it("returns the ?q= param value when present", () => {
    expect(resolveInitialQuery("q=tax")).toBe("tax");
  });

  it("?q= param wins even if other params are present", () => {
    expect(resolveInitialQuery("from=%2F&q=picket+line")).toBe("picket line");
  });

  it("decodes percent-encoded characters in ?q=", () => {
    expect(resolveInitialQuery("q=HR%205561")).toBe("HR 5561");
  });

  it("decodes plus-encoded spaces in ?q=", () => {
    expect(resolveInitialQuery("q=1412+Morling+Ave")).toBe("1412 Morling Ave");
  });

  it("returns empty string when ?q= is present but empty", () => {
    // URLSearchParams.get("q") returns "" for ?q=, which is falsy — falls through to ""
    expect(resolveInitialQuery("q=")).toBe("");
  });

  it("returns empty string when params are present but ?q= is absent", () => {
    expect(resolveInitialQuery("from=%2F&name=Search")).toBe("");
  });

  it("handles a full URL search string starting with ?", () => {
    expect(resolveInitialQuery("?q=Sherman")).toBe("Sherman");
  });
});

// ── Regression scenarios ──────────────────────────────────────────────────────

describe("resolveInitialQuery — regression", () => {
  it("does not return an address string even if one is somehow passed in pageSearch", () => {
    // pageSearch reflects the URL, not localStorage — but guard the contract anyway
    const result = resolveInitialQuery("someOtherParam=1412+Morling+Ave");
    expect(result).toBe(""); // no q= param → empty
  });

  it("multi-value params: only the first ?q= value is used", () => {
    // URLSearchParams.get returns the first value when a key appears multiple times
    expect(resolveInitialQuery("q=first&q=second")).toBe("first");
  });

  it("is pure — same inputs always produce same output", () => {
    const a = resolveInitialQuery("q=tax");
    const b = resolveInitialQuery("q=tax");
    expect(a).toBe(b);
  });
});
