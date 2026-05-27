import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getApiErrorStatus, getApiErrorMessage } from "./apiError";

// ── Unit tests ────────────────────────────────────────────────────────────────

describe("getApiErrorStatus", () => {
  it("extracts numeric status from an API error object", () => {
    expect(getApiErrorStatus({ status: 429 })).toBe(429);
  });

  it("coerces string status to number", () => {
    expect(getApiErrorStatus({ status: "404" })).toBe(404);
  });

  it("returns undefined for a plain Error (no status field)", () => {
    expect(getApiErrorStatus(new Error("boom"))).toBeUndefined();
  });

  it("returns undefined for null", () => {
    expect(getApiErrorStatus(null)).toBeUndefined();
  });

  it("returns undefined for a plain string", () => {
    expect(getApiErrorStatus("something went wrong")).toBeUndefined();
  });

  it("returns undefined for undefined", () => {
    expect(getApiErrorStatus(undefined)).toBeUndefined();
  });

  it("returns NaN when status is a non-numeric string (Number coercion)", () => {
    // Callers should guard against NaN when comparing to specific status codes.
    expect(getApiErrorStatus({ status: "not-a-number" })).toBeNaN();
  });
});

describe("getApiErrorMessage", () => {
  it("extracts the error string from the API shape { data: { error: string } }", () => {
    expect(getApiErrorMessage({ data: { error: "Rate limit exceeded" } })).toBe(
      "Rate limit exceeded",
    );
  });

  it("falls back to Error.message for a plain Error instance", () => {
    expect(getApiErrorMessage(new Error("network failure"))).toBe("network failure");
  });

  it("returns a non-empty generic fallback for an unrecognised object", () => {
    const msg = getApiErrorMessage({ something: "else" });
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("returns a non-empty generic fallback for null", () => {
    const msg = getApiErrorMessage(null);
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("returns a non-empty generic fallback for undefined", () => {
    const msg = getApiErrorMessage(undefined);
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("does not return an empty string when data.error is an empty string", () => {
    // Empty API error strings should fall through to the generic message,
    // not produce a blank UI label.
    const msg = getApiErrorMessage({ data: { error: "" } });
    expect(msg.length).toBeGreaterThan(0);
  });

  it("does not return an empty string when data.error is whitespace only", () => {
    const msg = getApiErrorMessage({ data: { error: "   " } });
    expect(msg.length).toBeGreaterThan(0);
  });
});

// ── Source guards — pages must import from the shared lib ─────────────────────

describe("StateRepDetail.tsx source guards", () => {
  const src = readFileSync(
    resolve(import.meta.dirname, "../pages/StateRepDetail.tsx"),
    "utf8",
  );

  it("imports from @/lib/apiError", () => {
    expect(src).toMatch(/from\s+["']@\/lib\/apiError["']/);
  });

  it("does not define its own getApiErrorStatus", () => {
    expect(src).not.toContain("function getApiErrorStatus");
  });

  it("does not define its own getApiErrorMessage", () => {
    expect(src).not.toContain("function getApiErrorMessage");
  });
});

describe("StateBills.tsx source guards", () => {
  const src = readFileSync(
    resolve(import.meta.dirname, "../pages/StateBills.tsx"),
    "utf8",
  );

  it("imports from @/lib/apiError", () => {
    expect(src).toMatch(/from\s+["']@\/lib\/apiError["']/);
  });

  it("does not define its own getApiErrorStatus", () => {
    expect(src).not.toContain("function getApiErrorStatus");
  });

  it("does not define its own getApiErrorMessage", () => {
    expect(src).not.toContain("function getApiErrorMessage");
  });
});
