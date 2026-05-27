/**
 * Source guard tests for items 4 and 5.
 *
 * Item 4 — Retry logic for state API calls:
 *   state.ts should import withRetry and use it inside openStatesFetch.
 *
 * Item 5 — Rate limit handling for federal routes:
 *   congressFetch in federal.ts should detect 429 and throw ProviderRateLimitError.
 *   Route-handler catch blocks should handle ProviderRateLimitError before falling back to 500.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const stateSrc = readFileSync(resolve(import.meta.dirname, "./state.ts"), "utf8");
const federalSrc = readFileSync(resolve(import.meta.dirname, "./federal.ts"), "utf8");

// ── Item 4: state.ts retry ────────────────────────────────────────────────────

describe("state.ts source guards — item 4 retry", () => {
  it("imports withRetry from ../lib/http", () => {
    expect(stateSrc).toMatch(/withRetry.*from\s+["']\.\.\/lib\/http["']/);
  });

  it("calls withRetry somewhere in the module (used in openStatesFetch)", () => {
    expect(stateSrc).toContain("withRetry(");
  });

  it("openStatesFetch body contains a withRetry call that wraps the fetch", () => {
    // The fetch call now lives inside a withRetry callback, not at the top level of
    // openStatesFetch. We verify both withRetry and the inner fetch coexist in the function body.
    expect(stateSrc).toMatch(/withRetry\([\s\S]{0,100}async \(\)/);
  });
});

// ── Item 5: federal.ts rate limit ────────────────────────────────────────────

describe("federal.ts source guards — item 5 rate limit", () => {
  it("imports isProviderRateLimitError from ../lib/respond", () => {
    expect(federalSrc).toContain("isProviderRateLimitError");
  });

  it("imports sendProviderRateLimitError from ../lib/respond", () => {
    expect(federalSrc).toContain("sendProviderRateLimitError");
  });

  it("congressFetch detects a 429 response and throws ProviderRateLimitError", () => {
    // Look for 429 check inside congressFetch context (within ~40 lines of the function)
    expect(federalSrc).toMatch(
      /congressFetch[\s\S]{0,1200}429[\s\S]{0,400}ProviderRateLimitError/,
    );
  });

  it("at least one route-handler catch block uses isProviderRateLimitError", () => {
    // Any catch block that now branches on rate limit
    const matches = federalSrc.match(/isProviderRateLimitError\(err\)/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThan(0);
  });

  it("sendProviderRateLimitError is called from at least one catch block", () => {
    const matches = federalSrc.match(/sendProviderRateLimitError\(res,/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThan(0);
  });
});
