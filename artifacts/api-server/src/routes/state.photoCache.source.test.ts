import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function getStateSource() {
  return readFileSync(resolve(import.meta.dirname, "state.ts"), "utf8");
}

describe("state.ts photo caching source guards", () => {
  it("imports photo cache helpers from the shared lib", () => {
    const src = getStateSource();
    expect(src).toContain('from "../lib/photoCache"');
    expect(src).toContain("getCachedPhoto");
    expect(src).toContain("setCachedPhoto");
  });

  it("has a stateMemberPhotoUrl helper that returns a proxy path", () => {
    const src = getStateSource();
    expect(src).toContain("function stateMemberPhotoUrl(");
    expect(src).toMatch(
      /stateMemberPhotoUrl[\s\S]{0,100}\/api\/state\/member-photo\/\$\{encodeURIComponent\(memberId\)\}/,
    );
  });

  it("search endpoint wraps photoUrl with stateMemberPhotoUrl", () => {
    const src = getStateSource();
    expect(src).toMatch(
      /photoUrl:\s*stateMemberPhotoUrl\(r\.id,\s*!!r\.photoUrl\)/,
    );
  });

  it("detail endpoint wraps legislator.photoUrl with stateMemberPhotoUrl in the response", () => {
    const src = getStateSource();
    expect(src).toMatch(
      /\/state\/members\/:memberId[\s\S]{0,400}photoUrl:\s*stateMemberPhotoUrl\(memberId,\s*!!result\.legislator\.photoUrl\)/,
    );
  });

  it("refresh endpoint wraps legislator.photoUrl with stateMemberPhotoUrl in the response", () => {
    const src = getStateSource();
    expect(src).toMatch(
      /\/state\/members\/:memberId\/refresh[\s\S]{0,400}photoUrl:\s*stateMemberPhotoUrl\(memberId,\s*!!result\.legislator\.photoUrl\)/,
    );
  });

  it("member-photo endpoint checks getCachedPhoto before hitting upstream", () => {
    const src = getStateSource();
    expect(src).toMatch(
      /\/state\/member-photo\/:memberId[\s\S]{0,600}getCachedPhoto\(row\.photoUrl,\s*memberId\)/,
    );
  });

  it("member-photo endpoint writes to setCachedPhoto after upstream fetch", () => {
    const src = getStateSource();
    expect(src).toMatch(
      /\/state\/member-photo\/:memberId[\s\S]{0,1200}setCachedPhoto\(row\.photoUrl,\s*memberId,\s*buffer,\s*contentType\)/,
    );
  });
});
