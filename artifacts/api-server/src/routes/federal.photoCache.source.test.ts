import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function getFederalSource() {
  return readFileSync(resolve(import.meta.dirname, "federal.ts"), "utf8");
}

describe("federal.ts photo caching source guards", () => {
  it("fetchAndCacheFederalMember stores the upstream image URL, not the proxy path", () => {
    const src = getFederalSource();

    // The insert().values() block must store the upstream URL from Congress.gov
    expect(src).toMatch(
      /photoUrl:\s*m\.depiction\?\.imageUrl\s*\?\?\s*null/,
    );

    // The onConflictDoUpdate set block must also store the upstream URL
    expect(src).toMatch(
      /onConflictDoUpdate[\s\S]{0,600}photoUrl:\s*m\.depiction\?\.imageUrl\s*\?\?\s*null/,
    );
  });

  it("mapDbRowToMember generates the proxy path from the stored upstream URL", () => {
    const src = getFederalSource();

    expect(src).toMatch(
      /mapDbRowToMember[\s\S]{0,500}photoUrl:\s*memberPhotoUrl\(row\.bioguideId,\s*!!row\.photoUrl\)/,
    );
  });

  it("normalizeMemberFromRaw still returns a proxy path for API responses", () => {
    const src = getFederalSource();

    expect(src).toMatch(
      /normalizeMemberFromRaw[\s\S]{0,500}photoUrl:\s*memberPhotoUrl\(m\.bioguideId/,
    );
  });

  it("member-photo endpoint fetches the upstream URL stored in the DB", () => {
    const src = getFederalSource();

    // The member-photo route reads row.photoUrl from DB and passes it to fetch()
    expect(src).toMatch(
      /\/federal\/member-photo\/:bioguideId[\s\S]{0,800}fetch\(row\.photoUrl\)/,
    );
  });

  it("has a server-side file cache for member photos", () => {
    const src = getFederalSource();

    expect(src).toContain("getCachedPhoto");
    expect(src).toContain("setCachedPhoto");
    expect(src).toContain("PHOTO_CACHE_DIR");
  });

  it("member-photo endpoint checks getCachedPhoto before hitting upstream", () => {
    const src = getFederalSource();

    expect(src).toMatch(
      /\/federal\/member-photo\/:bioguideId[\s\S]{0,600}getCachedPhoto\(row\.photoUrl,\s*bioguideId\)/,
    );
  });

  it("member-photo endpoint writes to setCachedPhoto after upstream fetch", () => {
    const src = getFederalSource();

    expect(src).toMatch(
      /\/federal\/member-photo\/:bioguideId[\s\S]{0,1200}setCachedPhoto\(row\.photoUrl,\s*bioguideId,\s*buffer,\s*contentType\)/,
    );
  });
});
