import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("federal.ts source guards — structured logging", () => {
  const src = readFileSync(resolve(import.meta.dirname, "./federal.ts"), "utf8");

  it("has no console.log calls (must use pino structured logger)", () => {
    // console.log bypasses pino and is invisible in production log aggregation.
    // All logging must go through req.log (request-scoped) or the module logger.
    expect(src).not.toContain("console.log(");
  });

  it("has no console.warn calls", () => {
    expect(src).not.toContain("console.warn(");
  });

  it("has no console.error calls", () => {
    expect(src).not.toContain("console.error(");
  });
});
