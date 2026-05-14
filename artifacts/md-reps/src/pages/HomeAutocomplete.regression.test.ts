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

describe("home search autocomplete regression coverage", () => {
  it("only shows the overlay while focused with results and keeps it scroll-bounded", () => {
    const autocompleteClassName = classNameForTestId("global-search-autocomplete");

    expect(source).toContain("{textInputFocused && hasAcResults && (");
    expect(source).toContain("setTimeout(() => setTextInputFocused(false), 150)");
    expect(source).toContain("onMouseDown={(e) => e.preventDefault()}");
    expect(autocompleteClassName).toContain("top-full");
    expect(autocompleteClassName).toContain("max-h-[min(28rem,60vh)]");
    expect(autocompleteClassName).toContain("overflow-y-auto");
  });
});
