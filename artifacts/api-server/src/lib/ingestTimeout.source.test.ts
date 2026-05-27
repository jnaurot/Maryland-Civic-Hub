import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readSrc(filename: string) {
  return readFileSync(resolve(import.meta.dirname, filename), "utf8");
}

describe("ingestCurrentCongressBills.ts — fetchWithTimeout source guard", () => {
  const src = readSrc("./ingestCurrentCongressBills.ts");

  it("imports fetchWithTimeout from ./http", () => {
    expect(src).toMatch(/import[^"']*fetchWithTimeout[^"']*from\s+["']\.\/http["']/);
  });

  it("does not call globalThis fetch directly (must use the imported alias)", () => {
    // The fix is: import { fetchWithTimeout as fetch } from "./http"
    // That import shadows globalThis.fetch inside the module, so all existing
    // `await fetch(...)` call-sites automatically gain timeout behaviour.
    // We verify the import exists (above) and that there is no secondary import
    // of the bare global, e.g.  `import fetch from ...` from node-fetch or similar.
    expect(src).not.toMatch(/import\s+fetch\s+from/);
  });
});

describe("ingestFederalMembers.ts — fetchWithTimeout source guard", () => {
  const src = readSrc("./ingestFederalMembers.ts");

  it("imports fetchWithTimeout from ./http", () => {
    expect(src).toMatch(/import[^"']*fetchWithTimeout[^"']*from\s+["']\.\/http["']/);
  });

  it("does not import bare global fetch from an external package", () => {
    expect(src).not.toMatch(/import\s+fetch\s+from/);
  });
});
