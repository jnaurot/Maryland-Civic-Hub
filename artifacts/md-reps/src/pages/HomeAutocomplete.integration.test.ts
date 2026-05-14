import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const sourcePath = resolve(dirname(fileURLToPath(import.meta.url)), "Home.tsx");
const source = readFileSync(sourcePath, "utf8");

function classNameForTestId(testId: string) {
  const match = source.match(
    new RegExp(`data-testid="${testId}"[\\s\\S]*?className="([^"]+)"`),
  );
  return match?.[1] ?? "";
}

describe("home search autocomplete integration", () => {
  it("keeps the autocomplete overlay above the results content instead of clipping it inside the hero", () => {
    const heroClassName = classNameForTestId("home-hero");
    const heroBackgroundClassName = classNameForTestId("home-hero-background");
    const searchFormClassName = classNameForTestId("global-search-form");
    const autocompleteClassName = classNameForTestId("global-search-autocomplete");

    expect(heroClassName).toContain("overflow-visible");
    expect(heroClassName).not.toContain("overflow-hidden");
    expect(heroClassName).toContain("z-20");

    expect(heroBackgroundClassName).toContain("overflow-hidden");
    expect(searchFormClassName).toContain("z-30");
    expect(autocompleteClassName).toContain("z-[100]");
    expect(autocompleteClassName).toContain("overflow-y-auto");
  });
});
