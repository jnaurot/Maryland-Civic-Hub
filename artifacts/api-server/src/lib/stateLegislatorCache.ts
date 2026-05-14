import { eq, and, inArray } from "drizzle-orm";
import { db, stateLegislatorsTable, providerStatusTable } from "@workspace/db";
import { fetchWithTimeout as fetch } from "./http";

const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY;
const OPENSTATES_BASE = "https://v3.openstates.org";

// Stale threshold: 7 days
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

// In-memory fallback for when DB is unavailable; keeps process warm
let memBlockedUntil = 0;

const PROVIDER_KEY = "openstates";

async function loadProviderStatus(): Promise<
  typeof providerStatusTable.$inferSelect | undefined
> {
  const rows = await db
    .select()
    .from(providerStatusTable)
    .where(eq(providerStatusTable.provider, PROVIDER_KEY))
    .limit(1);
  return rows[0];
}

export async function isRateLimited(): Promise<boolean> {
  try {
    const status = await loadProviderStatus();
    if (status?.blockedUntil) {
      return new Date().getTime() < new Date(status.blockedUntil).getTime();
    }
    return false;
  } catch {
    return Date.now() < memBlockedUntil;
  }
}

export async function recordRateLimit(statusCode: number, reason?: string) {
  const blockedUntil = new Date(Date.now() + 60_000);
  try {
    await db
      .insert(providerStatusTable)
      .values({
        provider: PROVIDER_KEY,
        blockedUntil,
        reason: reason ?? `HTTP ${statusCode}`,
        lastStatusCode: statusCode,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: providerStatusTable.provider,
        set: {
          blockedUntil,
          reason: reason ?? `HTTP ${statusCode}`,
          lastStatusCode: statusCode,
          updatedAt: new Date(),
        },
      });
  } catch {
    memBlockedUntil = Date.now() + 60_000;
  }
}

async function resetRateLimit() {
  try {
    await db
      .insert(providerStatusTable)
      .values({
        provider: PROVIDER_KEY,
        blockedUntil: null,
        reason: null,
        lastStatusCode: null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: providerStatusTable.provider,
        set: {
          blockedUntil: null,
          reason: null,
          lastStatusCode: null,
          updatedAt: new Date(),
        },
      });
  } catch {
    memBlockedUntil = 0;
  }
}

async function openStatesFetch(
  path: string,
  params: Record<string, string | number> = {},
) {
  if (!OPENSTATES_API_KEY) throw new Error("OPENSTATES_API_KEY not configured");
  if (await isRateLimited())
    throw new Error("OpenStates rate limit active. Please try again later.");
  const url = new URL(`${OPENSTATES_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: { "X-API-KEY": OPENSTATES_API_KEY },
  });
  if (!res.ok) {
    const text = await res.text();
    if (
      res.status === 429 ||
      (res.status === 403 && text.toLowerCase().includes("rate"))
    ) {
      await recordRateLimit(res.status, text);
    }
    throw new Error(`OpenStates API error ${res.status}: ${text}`);
  }
  await resetRateLimit();
  return res.json() as Promise<any>;
}

function mapOpenStatesPerson(person: any) {
  const role = person.current_role ?? {};
  const jurisdictionId = person.jurisdiction?.id ?? "";
  const jurisdictionMatch = jurisdictionId.match(/state:([a-z]{2})/);
  const jurisdiction = jurisdictionMatch
    ? jurisdictionMatch[1]
    : (person.jurisdiction?.name ?? "").toLowerCase().replace(/\s+/g, "");

  return {
    id: person.id,
    name: person.name ?? "",
    party: person.party ?? null,
    chamber:
      role.org_classification === "upper" ? "Senate" : "House of Delegates",
    district: role.district ? String(role.district) : null,
    jurisdiction,
    photoUrl: person.image ?? null,
    email: person.email ?? null,
    phone: person.links?.[0]?.url ?? null,
    openstatesUrl: person.openstates_url ?? null,
    state: person.jurisdiction?.name ?? null,
    raw: person,
  };
}

function isStale(row: typeof stateLegislatorsTable.$inferSelect): boolean {
  return Date.now() - new Date(row.fetchedAt).getTime() > STALE_THRESHOLD_MS;
}

export interface CacheMeta {
  source: "db" | "openstates";
  stale: boolean;
  fetchedAt: string;
  refreshFailed?: boolean;
}

export interface LegislatorResult {
  legislator: ReturnType<typeof mapOpenStatesPerson>;
  cache: CacheMeta;
}

/**
 * Get a single state legislator by OpenStates ID.
 * Cache-first: checks DB, falls back to OpenStates on cache miss.
 * Respects rate-limit gate: if rate-limited and cache exists, returns stale cache.
 */
export async function getStateLegislator(
  id: string,
  logger?: any,
): Promise<LegislatorResult> {
  const rows = await db
    .select()
    .from(stateLegislatorsTable)
    .where(eq(stateLegislatorsTable.id, id))
    .limit(1);

  const cached = rows[0];

  if (cached) {
    const stale = isStale(cached);
    if (!stale) {
      logger?.info(
        { legislatorId: id, source: "db" },
        "Serving legislator from cache",
      );
      return {
        legislator: mapOpenStatesPerson(cached.raw ?? cached),
        cache: {
          source: "db",
          stale: false,
          fetchedAt: cached.fetchedAt.toISOString(),
        },
      };
    }
    // Stale cache exists. Try to refresh if not rate limited.
    if (!(await isRateLimited())) {
      try {
        logger?.info(
          { legislatorId: id, source: "openstates" },
          "Refreshing stale legislator from OpenStates",
        );
        const fresh = await fetchStateLegislatorFromOpenStates(id);
        return {
          legislator: fresh,
          cache: {
            source: "openstates",
            stale: false,
            fetchedAt: new Date().toISOString(),
          },
        };
      } catch (err) {
        logger?.warn(
          { err, legislatorId: id, source: "db" },
          "Failed to refresh stale legislator; returning cached data",
        );
        return {
          legislator: mapOpenStatesPerson(cached.raw ?? cached),
          cache: {
            source: "db",
            stale: true,
            fetchedAt: cached.fetchedAt.toISOString(),
            refreshFailed: true,
          },
        };
      }
    }
    // Rate limited → return stale cache with warning
    logger?.warn(
      { legislatorId: id, source: "db" },
      "Rate limited; returning stale legislator cache",
    );
    return {
      legislator: mapOpenStatesPerson(cached.raw ?? cached),
      cache: {
        source: "db",
        stale: true,
        fetchedAt: cached.fetchedAt.toISOString(),
        refreshFailed: true,
      },
    };
  }

  // Cache miss
  if (await isRateLimited()) {
    throw new Error("OpenStates rate limit active. No cached data available.");
  }

  try {
    logger?.info(
      { legislatorId: id, source: "openstates" },
      "Cache miss; fetching legislator from OpenStates",
    );
    const fresh = await fetchStateLegislatorFromOpenStates(id);
    return {
      legislator: fresh,
      cache: {
        source: "openstates",
        stale: false,
        fetchedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    throw new Error(`Failed to fetch legislator from OpenStates: ${err}`);
  }
}

/**
 * Force refresh a legislator from OpenStates and update the cache.
 * Used by the manual refresh endpoint.
 */
export async function refreshStateLegislator(
  id: string,
  logger?: any,
): Promise<LegislatorResult> {
  if (await isRateLimited()) {
    const rows = await db
      .select()
      .from(stateLegislatorsTable)
      .where(eq(stateLegislatorsTable.id, id))
      .limit(1);
    const cached = rows[0];
    if (cached) {
      return {
        legislator: mapOpenStatesPerson(cached.raw ?? cached),
        cache: {
          source: "db",
          stale: isStale(cached),
          fetchedAt: cached.fetchedAt.toISOString(),
          refreshFailed: true,
        },
      };
    }
    throw new Error("OpenStates rate limit active. No cached data available.");
  }

  try {
    const fresh = await fetchStateLegislatorFromOpenStates(id);
    return {
      legislator: fresh,
      cache: {
        source: "openstates",
        stale: false,
        fetchedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    const rows = await db
      .select()
      .from(stateLegislatorsTable)
      .where(eq(stateLegislatorsTable.id, id))
      .limit(1);
    const cached = rows[0];
    if (cached) {
      return {
        legislator: mapOpenStatesPerson(cached.raw ?? cached),
        cache: {
          source: "db",
          stale: isStale(cached),
          fetchedAt: cached.fetchedAt.toISOString(),
          refreshFailed: true,
        },
      };
    }
    throw err;
  }
}

async function fetchStateLegislatorFromOpenStates(id: string) {
  const data = await openStatesFetch("/people", { id, per_page: 1 });
  const person = data.results?.[0];
  if (!person) throw new Error("Member not found");

  const mapped = mapOpenStatesPerson(person);

  await db
    .insert(stateLegislatorsTable)
    .values({
      id: mapped.id,
      name: mapped.name,
      party: mapped.party,
      chamber: mapped.chamber,
      district: mapped.district,
      jurisdiction: mapped.jurisdiction,
      photoUrl: mapped.photoUrl,
      email: mapped.email,
      phone: mapped.phone,
      openstatesUrl: mapped.openstatesUrl,
      state: mapped.state,
      raw: mapped.raw,
      fetchedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: stateLegislatorsTable.id,
      set: {
        name: mapped.name,
        party: mapped.party,
        chamber: mapped.chamber,
        district: mapped.district,
        jurisdiction: mapped.jurisdiction,
        photoUrl: mapped.photoUrl,
        email: mapped.email,
        phone: mapped.phone,
        openstatesUrl: mapped.openstatesUrl,
        state: mapped.state,
        raw: mapped.raw,
        fetchedAt: new Date(),
      },
    });

  return mapped;
}

/**
 * Fetch legislators for one or more districts from OpenStates and cache them.
 * Returns the mapped legislators.
 */
export async function fetchAndCacheDistrictLegislators(
  jurisdiction: string,
  senateDistrict: string | null,
  houseDistrict: string | null,
  logger?: any,
): Promise<Array<ReturnType<typeof mapOpenStatesPerson>>> {
  if (await isRateLimited()) {
    logger?.warn(
      { jurisdiction },
      "Skipping OpenStates district fetch due to active rate limit",
    );
    return [];
  }

  if (!OPENSTATES_API_KEY) {
    logger?.error("OPENSTATES_API_KEY not configured");
    return [];
  }

  const results: Array<ReturnType<typeof mapOpenStatesPerson>> = [];

  const fetchOne = async (district: string, orgClass: "upper" | "lower") => {
    try {
      const data = await openStatesFetch("/people", {
        jurisdiction: jurisdiction.toLowerCase(),
        district,
        org_classification: orgClass,
        per_page: 10,
      });
      const people = data.results ?? [];
      for (const person of people) {
        const mapped = mapOpenStatesPerson(person);
        results.push(mapped);
        await db
          .insert(stateLegislatorsTable)
          .values({
            id: mapped.id,
            name: mapped.name,
            party: mapped.party,
            chamber: mapped.chamber,
            district: mapped.district,
            jurisdiction: mapped.jurisdiction,
            photoUrl: mapped.photoUrl,
            email: mapped.email,
            phone: mapped.phone,
            openstatesUrl: mapped.openstatesUrl,
            state: mapped.state,
            raw: mapped.raw,
            fetchedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: stateLegislatorsTable.id,
            set: {
              name: mapped.name,
              party: mapped.party,
              chamber: mapped.chamber,
              district: mapped.district,
              jurisdiction: mapped.jurisdiction,
              photoUrl: mapped.photoUrl,
              email: mapped.email,
              phone: mapped.phone,
              openstatesUrl: mapped.openstatesUrl,
              state: mapped.state,
              raw: mapped.raw,
              fetchedAt: new Date(),
            },
          });
      }
    } catch (err) {
      logger?.error(
        { err, jurisdiction, district, orgClass },
        "Failed to fetch district legislators",
      );
    }
  };

  const promises: Promise<void>[] = [];
  if (senateDistrict) promises.push(fetchOne(senateDistrict, "upper"));
  if (houseDistrict) promises.push(fetchOne(houseDistrict, "lower"));
  await Promise.all(promises);

  return results;
}

/**
 * Get cached legislators for districts. If none are cached, falls back to OpenStates.
 * Returns legislators and a single cache metadata object summarizing freshness.
 */
export async function getDistrictLegislators(
  jurisdiction: string,
  senateDistrict: string | null,
  houseDistrict: string | null,
  logger?: any,
): Promise<{
  legislators: Array<ReturnType<typeof mapOpenStatesPerson>>;
  cache: CacheMeta;
}> {
  // Try to find cached legislators matching the districts
  const districts: string[] = [];
  if (senateDistrict) districts.push(senateDistrict);
  if (houseDistrict) districts.push(houseDistrict);

  let cachedRows: (typeof stateLegislatorsTable.$inferSelect)[] = [];
  if (districts.length > 0) {
    cachedRows = await db
      .select()
      .from(stateLegislatorsTable)
      .where(
        and(
          eq(stateLegislatorsTable.jurisdiction, jurisdiction.toLowerCase()),
          inArray(stateLegislatorsTable.district, districts),
        ),
      );
  }

  if (cachedRows.length > 0) {
    const anyStale = cachedRows.some(isStale);
    const oldest = cachedRows.reduce(
      (min, r) =>
        new Date(r.fetchedAt).getTime() < new Date(min.fetchedAt).getTime()
          ? r
          : min,
      cachedRows[0],
    );
    logger?.info(
      { jurisdiction, count: cachedRows.length, source: "db", stale: anyStale },
      "Serving district legislators from cache",
    );
    return {
      legislators: cachedRows.map((r) => mapOpenStatesPerson(r.raw ?? r)),
      cache: {
        source: "db",
        stale: anyStale,
        fetchedAt: oldest.fetchedAt.toISOString(),
      },
    };
  }

  // Cache miss → fetch from OpenStates
  logger?.info(
    { jurisdiction, senateDistrict, houseDistrict, source: "openstates" },
    "Cache miss; fetching district legislators from OpenStates",
  );
  const fetched = await fetchAndCacheDistrictLegislators(
    jurisdiction,
    senateDistrict,
    houseDistrict,
    logger,
  );
  return {
    legislators: fetched,
    cache: {
      source: fetched.length > 0 ? "openstates" : "db",
      stale: false,
      fetchedAt: new Date().toISOString(),
    },
  };
}

/** Expose rate-limit status for health/debug endpoints if needed. */
export async function getRateLimitStatus() {
  const status = await loadProviderStatus();
  return {
    blocked: status?.blockedUntil
      ? new Date().getTime() < new Date(status.blockedUntil).getTime()
      : false,
    blockedUntil: status?.blockedUntil?.toISOString() ?? null,
    reason: status?.reason ?? null,
    lastStatusCode: status?.lastStatusCode ?? null,
  };
}
