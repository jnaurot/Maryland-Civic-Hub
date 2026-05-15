import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Parses a TSX file and finds JSX elements whose className contains a target class.
 * Uses a simple tokenizer approach that is robust against most formatting changes.
 */
function findElementsWithClass(source: string, targetClass: string): Array<{ tag: string; className: string; line: number }> {
  const results: Array<{ tag: string; className: string; line: number }> = [];
  const lines = source.split("\n");

  // Regex to match opening JSX tags with className attribute
  // Handles: className="...", className={`...`}, className={"..."}, className={clsx("...")} etc.
  const tagRegex = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*?\bclassName=(?:\{`?"?([^`"\}]+)"?`?\}|"([^"]+)")/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    while ((match = tagRegex.exec(line)) !== null) {
      const tag = match[1];
      // match[2] is inside braces/backticks, match[3] is raw string
      const className = (match[2] ?? match[3] ?? "").trim();
      if (className.includes(targetClass)) {
        results.push({ tag, className, line: i + 1 });
      }
    }
  }

  return results;
}

function getPageSource(name: string): string {
  const path = resolve(import.meta.dirname, `${name}.tsx`);
  return readFileSync(path, "utf8");
}

const scrollConstrainedPages = [
  "Home",
  "FederalRepDetail",
  "StateRepDetail",
  "FederalBills",
  "StateBills",
];

describe("Scroll layout regression", () => {
  it.each(scrollConstrainedPages)(
    "%s outer page container never scrolls (overflow-hidden + h-[calc(100dvh-4rem)])",
    (name) => {
      const source = getPageSource(name);
      const matches = findElementsWithClass(source, "overflow-hidden");

      // The outer container must have BOTH overflow-hidden and h-[calc(100dvh-4rem)]
      const outer = matches.find((m) =>
        m.className.includes("h-[calc(100dvh-4rem)]") &&
        m.className.includes("overflow-hidden"),
      );

      expect(outer, `Expected ${name} outer container to have overflow-hidden and h-[calc(100dvh-4rem)]`).toBeTruthy();
    },
  );

  it.each(scrollConstrainedPages)(
    "%s inner content area can scroll (overflow-y-auto)",
    (name) => {
      const source = getPageSource(name);
      const matches = findElementsWithClass(source, "overflow-y-auto");
      expect(matches.length, `Expected ${name} to contain at least one overflow-y-auto element`).toBeGreaterThan(0);
    },
  );
});
