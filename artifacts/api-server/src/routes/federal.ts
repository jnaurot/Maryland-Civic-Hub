import { Router } from "express";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { XMLParser } from "fast-xml-parser";
import { db, normalizeVoteCast, federalBillsTable, federalMembersTable, federalMemberBillRolesTable, federalMemberBillCacheStatusTable } from "@workspace/db";
import { houseVotesTable, houseVoteRecordsTable, senateRollCallVotesTable, senatorVotePositionsTable, senatorIdentitiesTable } from "@workspace/db";
import {
  GetFederalMemberParams,
  GetFederalMemberBillsParams,
  GetFederalMemberBillsQueryParams,
  GetFederalMemberCommitteesParams,
  GetFederalBillsQueryParams,
  GetFederalBillDetailParams,
  GetFederalStateMembersQueryParams,
  GetFederalMemberHouseVotesParams,
  GetFederalMemberHouseVotesQueryParams,
  GetFederalMemberSenateVotesParams,
  GetFederalMemberSenateVotesQueryParams,
} from "@workspace/api-zod";

const router = Router();

const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
const BASE = "https://api.congress.gov/v3";

async function congressFetch(path: string, params: Record<string, string | number> = {}, logger?: any) {
  if (!CONGRESS_API_KEY) throw new Error("CONGRESS_API_KEY not configured");
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", CONGRESS_API_KEY);
  url.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  logger?.info({ url: url.toString(), source: "congress.gov" }, "Fetching from Congress.gov");
  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Congress API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<any>;
}

function formatCongressName(name: string): string {
  const parts = name.split(", ");
  if (parts.length === 2) return `${parts[1]} ${parts[0]}`;
  return name;
}

function normalizeTermsItem(member: any): any[] {
  // Congress.gov uses different structures in list vs detail endpoints:
  // - list:   terms: { item: [...] }
  // - detail: terms: [...]
  const raw = member?.terms?.item ?? member?.terms ?? member?.depictedTerms;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function getLastName(name: string): string {
  // Congress.gov raw format is "Last, First"; after formatting it's "First Last"
  if (name.includes(", ")) {
    return name.split(", ")[0]?.trim().toLowerCase() ?? "";
  }
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1]?.toLowerCase() ?? "";
}

function normalizeMemberFromRaw(m: any) {
  return {
    bioguideId: m.bioguideId ?? "",
    name: m.directOrderName ?? m.invertedOrderName ?? "",
    party: m.partyHistory?.[0]?.partyName,
    state: m.state,
    chamber: normalizeTermsItem(m).slice(-1)[0]?.chamber ?? undefined,
    district: m.district != null ? String(m.district) : undefined,
    phone: m.officeAddress,
    website: m.officialWebsiteUrl,
    photoUrl: m.depiction?.imageUrl,
    terms: normalizeTermsItem(m).length,
    inOffice: m.currentMember,
    nextElection: m.nextElection,
  };
}

function mapDbRowToMember(row: typeof federalMembersTable.$inferSelect) {
  const raw = (row.raw ?? {}) as any;
  return {
    bioguideId: row.bioguideId,
    name: row.name,
    party: row.party ?? undefined,
    state: row.state ?? undefined,
    chamber: row.chamber ?? undefined,
    district: row.district ?? undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    photoUrl: row.photoUrl ?? undefined,
    terms: raw.terms != null ? Number(raw.terms) : undefined,
    inOffice: raw.inOffice != null ? raw.inOffice === true || raw.inOffice === "true" : undefined,
    nextElection: row.nextElection ?? undefined,
  };
}

function isStale(row: typeof federalMembersTable.$inferSelect): boolean {
  return Date.now() - new Date(row.fetchedAt).getTime() > STALE_THRESHOLD_MS;
}

function computePolicyAreas(
  rows: Array<{ name: string | null; count: string | number }>
): Array<{ name: string; count: number; pct: number }> {
  const total = rows.reduce((sum, r) => sum + Number(r.count), 0);
  if (total === 0) return [];

  const top = rows.slice(0, 5).map((r) => ({
    name: r.name ?? "Unknown",
    count: Number(r.count),
    pct: Math.round((Number(r.count) / total) * 100),
  }));

  const otherCount = rows.slice(5).reduce((sum, r) => sum + Number(r.count), 0);
  if (otherCount > 0) {
    top.push({
      name: "Other",
      count: otherCount,
      pct: Math.round((otherCount / total) * 100),
    });
  }

  return top;
}

async function fetchAndCacheFederalMember(bioguideId: string, logger?: any) {
  logger?.info({ bioguideId, source: "congress.gov" }, "Fetching federal member from Congress.gov");
  const data = await congressFetch(`/member/${bioguideId}`, {}, logger);
  const m = data.member ?? {};
  const mapped = normalizeMemberFromRaw(m);

  await db.insert(federalMembersTable).values({
    bioguideId: mapped.bioguideId || bioguideId,
    name: mapped.name,
    party: mapped.party ?? null,
    state: mapped.state ?? null,
    chamber: mapped.chamber ?? null,
    district: mapped.district ?? null,
    phone: mapped.phone ?? null,
    website: mapped.website ?? null,
    photoUrl: mapped.photoUrl ?? null,
    terms: mapped.terms != null ? String(mapped.terms) : null,
    inOffice: mapped.inOffice != null ? String(mapped.inOffice) : null,
    nextElection: mapped.nextElection ?? null,
    raw: m,
    fetchedAt: new Date(),
  }).onConflictDoUpdate({
    target: federalMembersTable.bioguideId,
    set: {
      name: mapped.name,
      party: mapped.party ?? null,
      state: mapped.state ?? null,
      chamber: mapped.chamber ?? null,
      district: mapped.district ?? null,
      phone: mapped.phone ?? null,
      website: mapped.website ?? null,
      photoUrl: mapped.photoUrl ?? null,
      terms: mapped.terms != null ? String(mapped.terms) : null,
      inOffice: mapped.inOffice != null ? String(mapped.inOffice) : null,
      nextElection: mapped.nextElection ?? null,
      raw: m,
      fetchedAt: new Date(),
    },
  });

  return mapped;
}

router.get("/federal/state-members", async (req, res) => {
  const parsed = GetFederalStateMembersQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid params" });

  const { state } = parsed.data;
  const stateUpper = state.toUpperCase();

  try {
    const url = new URL(`${BASE}/member/${stateUpper}`);
    url.searchParams.set("api_key", CONGRESS_API_KEY!);
    url.searchParams.set("format", "json");
    url.searchParams.set("currentMember", "true");
    url.searchParams.set("limit", "250");

    const response = await fetch(url.toString());
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Congress API error ${response.status}: ${text}`);
    }
    const data = await response.json() as any;

    const members: any[] = data.members ?? [];
    const mapped = members
      .filter((m: any) => normalizeTermsItem(m).some((t: any) => !t.endYear))
      .map((m: any) => {
        const latestTerm = normalizeTermsItem(m).slice(-1)[0];
        const chamber = latestTerm?.chamber;
        const isSenate = chamber === "Senate";
        return {
          name: formatCongressName(m.name),
          office: isSenate ? `U.S. Senator for ${stateUpper}` : `U.S. Representative, ${stateUpper}-${m.district ?? ""}`,
          party: m.partyName,
          photoUrl: m.depiction?.imageUrl,
          level: "federal" as const,
          chamber: isSenate ? "Senate" : "House",
          bioguideId: m.bioguideId,
          district: m.district ? String(m.district) : undefined,
        };
      });

    // Sort: senators first, then representatives, then last name ascending
    mapped.sort((a: any, b: any) => {
      const aIsSenate = a.chamber === "Senate" ? 0 : 1;
      const bIsSenate = b.chamber === "Senate" ? 0 : 1;
      if (aIsSenate !== bIsSenate) return aIsSenate - bIsSenate;
      return getLastName(a.name).localeCompare(getLastName(b.name));
    });

    return res.json({
      stateCode: stateUpper,
      stateName: stateUpper,
      representatives: mapped,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching federal state members");
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/federal/members/:bioguideId", async (req, res) => {
  const parsed = GetFederalMemberParams.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid params" });

  const bioguideId = parsed.data.bioguideId;

  try {
    const rows = await db.select().from(federalMembersTable).where(eq(federalMembersTable.bioguideId, bioguideId)).limit(1);
    const cached = rows[0];

    if (cached) {
      const stale = isStale(cached);
      if (!stale) {
        req.log.info({ bioguideId, source: "db" }, "Serving federal member from cache");
        return res.json({
          member: mapDbRowToMember(cached),
          cache: { source: "db", stale: false, fetchedAt: cached.fetchedAt.toISOString() },
        });
      }
      // Stale cache — try to refresh
      try {
        req.log.info({ bioguideId, source: "congress.gov" }, "Refreshing stale federal member from Congress.gov");
        const fresh = await fetchAndCacheFederalMember(bioguideId, req.log);
        return res.json({
          member: fresh,
          cache: { source: "congress.gov", stale: false, fetchedAt: new Date().toISOString() },
        });
      } catch (err) {
        req.log.warn({ err, bioguideId, source: "db" }, "Failed to refresh stale federal member; returning cached data");
        return res.json({
          member: mapDbRowToMember(cached),
          cache: { source: "db", stale: true, fetchedAt: cached.fetchedAt.toISOString(), refreshFailed: true },
        });
      }
    }

    // Cache miss
    req.log.info({ bioguideId, source: "congress.gov" }, "Cache miss; fetching federal member from Congress.gov");
    const fresh = await fetchAndCacheFederalMember(bioguideId, req.log);
    return res.json({
      member: fresh,
      cache: { source: "congress.gov", stale: false, fetchedAt: new Date().toISOString() },
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching federal member");
    return res.status(500).json({ error: String(err) });
  }
});

router.post("/federal/members/:bioguideId/refresh", async (req, res) => {
  const parsed = GetFederalMemberParams.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid params" });

  const bioguideId = parsed.data.bioguideId;

  try {
    req.log.info({ bioguideId, source: "congress.gov" }, "Force refreshing federal member from Congress.gov");
    const fresh = await fetchAndCacheFederalMember(bioguideId, req.log);
    return res.json({
      member: fresh,
      cache: { source: "congress.gov", stale: false, fetchedAt: new Date().toISOString() },
    });
  } catch (err) {
    // On failure, return cached data if available
    const rows = await db.select().from(federalMembersTable).where(eq(federalMembersTable.bioguideId, bioguideId)).limit(1);
    const cached = rows[0];
    if (cached) {
      req.log.warn({ err, bioguideId, source: "db" }, "Refresh failed; returning cached federal member");
      return res.json({
        member: mapDbRowToMember(cached),
        cache: { source: "db", stale: isStale(cached), fetchedAt: cached.fetchedAt.toISOString(), refreshFailed: true },
      });
    }
    req.log.error({ err }, "Error refreshing federal member");
    return res.status(500).json({ error: String(err) });
  }
});

async function ingestFederalMemberBills(bioguideId: string, role: "sponsor" | "cosponsor", logger?: any) {
  const endpoint = role === "sponsor" ? "sponsored-legislation" : "cosponsored-legislation";
  const key = role === "sponsor" ? "sponsoredLegislation" : "cosponsoredLegislation";

  let page = 1;
  let hasMore = true;
  let totalIngested = 0;

  while (hasMore) {
    logger?.info({ bioguideId, role, page, source: "congress.gov" }, "Ingesting member bills from Congress.gov");
    const data = await congressFetch(`/member/${bioguideId}/${endpoint}`, { offset: (page - 1) * 20, limit: 20 }, logger);
    const allItems: any[] = data[key] ?? data.bills ?? [];
    const billItems = allItems.filter((b: any) => b.type !== null && b.type !== undefined);

    if (billItems.length === 0) {
      hasMore = false;
      break;
    }

    for (const b of billItems) {
      const billId = b.number ? `${b.congress}-${b.type?.toLowerCase()}-${b.number}` : String(Math.random());
      const subjects = b.subjects?.item ?? (Array.isArray(b.subjects) ? b.subjects : []);
      const subjectsText = Array.isArray(subjects) ? subjects.join(" ") : "";

      await db.insert(federalBillsTable).values({
        id: billId,
        title: b.title ?? "Untitled",
        number: b.type && b.number ? `${b.type} ${b.number}` : b.billNumber,
        congress: String(b.congress),
        introducedDate: b.introducedDate ?? null,
        summary: null,
        latestAction: b.latestAction?.text ?? null,
        chamber: b.originChamber ?? null,
        policyArea: b.policyArea?.name ?? null,
        subjects: subjects ?? [],
        url: b.url ?? null,
        raw: null,
        searchVector: sql`to_tsvector('english', coalesce(${b.title ?? ""}, '') || ' ' || coalesce(${b.type + " " + b.number}, '') || ' ' || coalesce(${subjectsText}, ''))`,
      }).onConflictDoUpdate({
        target: federalBillsTable.id,
        set: {
          title: b.title ?? "Untitled",
          number: b.type && b.number ? `${b.type} ${b.number}` : b.billNumber,
          congress: String(b.congress),
          introducedDate: b.introducedDate ?? null,
          latestAction: b.latestAction?.text ?? null,
          chamber: b.originChamber ?? null,
          policyArea: b.policyArea?.name ?? null,
          subjects: subjects ?? [],
          url: b.url ?? null,
          fetchedAt: new Date(),
          searchVector: sql`to_tsvector('english', coalesce(${b.title ?? ""}, '') || ' ' || coalesce(${b.type + " " + b.number}, '') || ' ' || coalesce(${subjectsText}, ''))`,
        },
      });

      await db.insert(federalMemberBillRolesTable).values({
        bioguideId,
        billId,
        congress: String(b.congress),
        role,
        fetchedAt: new Date(),
      }).onConflictDoNothing();

      totalIngested++;
    }

    const totalExpected = data.pagination?.count ?? 0;
    hasMore = totalIngested < totalExpected && billItems.length >= 20;
    page++;
  }

  logger?.info({ bioguideId, role, totalIngested, source: "db" }, "Member bill ingestion complete");

  // Write cache status keyed to current congress
  const currentYear = new Date().getFullYear();
  const currentCongress = String(Math.floor((currentYear - 1789) / 2) + 1);

  await db.insert(federalMemberBillCacheStatusTable).values({
    bioguideId,
    role,
    congress: currentCongress,
    fullyIngested: true,
    localCount: totalIngested,
    lastFetchedAt: new Date(),
  }).onConflictDoUpdate({
    target: [federalMemberBillCacheStatusTable.bioguideId, federalMemberBillCacheStatusTable.role, federalMemberBillCacheStatusTable.congress],
    set: {
      fullyIngested: true,
      localCount: totalIngested,
      lastFetchedAt: new Date(),
    },
  });

  return totalIngested;
}

router.get("/federal/members/:bioguideId/bills", async (req, res) => {
  const paramsParsed = GetFederalMemberBillsParams.safeParse(req.params);
  const queryParsed = GetFederalMemberBillsQueryParams.safeParse(req.query);
  if (!paramsParsed.success || !queryParsed.success) return res.status(400).json({ error: "Invalid params" });

  const { bioguideId } = paramsParsed.data;
  const { type, offset, limit } = queryParsed.data;
  const role = type === "sponsored" ? "sponsor" : "cosponsor";

  try {
    // Check if we have cached bills for this member+role
    const cachedCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(federalMemberBillRolesTable)
      .where(and(
        eq(federalMemberBillRolesTable.bioguideId, bioguideId),
        eq(federalMemberBillRolesTable.role, role)
      ));

    const cachedCount = Number(cachedCountResult[0]?.count ?? 0);

    if (cachedCount === 0) {
      req.log.info({ bioguideId, role, source: "congress.gov" }, "No cached member bills; triggering ingestion");
      await ingestFederalMemberBills(bioguideId, role, req.log);
    } else {
      req.log.info({ bioguideId, role, cachedCount, source: "db" }, "Serving member bills from cache");
    }

    // Fetch paginated bills from DB
    const rows = await db
      .select({
        id: federalBillsTable.id,
        title: federalBillsTable.title,
        number: federalBillsTable.number,
        congress: federalBillsTable.congress,
        introducedDate: federalBillsTable.introducedDate,
        latestAction: federalBillsTable.latestAction,
        policyArea: federalBillsTable.policyArea,
        url: federalBillsTable.url,
        chamber: federalBillsTable.chamber,
      })
      .from(federalMemberBillRolesTable)
      .innerJoin(federalBillsTable, eq(federalMemberBillRolesTable.billId, federalBillsTable.id))
      .where(and(
        eq(federalMemberBillRolesTable.bioguideId, bioguideId),
        eq(federalMemberBillRolesTable.role, role)
      ))
      .orderBy(desc(federalBillsTable.introducedDate))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(federalMemberBillRolesTable)
      .where(and(
        eq(federalMemberBillRolesTable.bioguideId, bioguideId),
        eq(federalMemberBillRolesTable.role, role)
      ));

    const totalCount = Number(totalResult[0]?.count ?? 0);

    // Compute policy area breakdown from full cached set
    const policyAreaRows = await db
      .select({
        name: federalBillsTable.policyArea,
        count: sql<number>`count(*)`,
      })
      .from(federalMemberBillRolesTable)
      .innerJoin(federalBillsTable, eq(federalMemberBillRolesTable.billId, federalBillsTable.id))
      .where(and(
        eq(federalMemberBillRolesTable.bioguideId, bioguideId),
        eq(federalMemberBillRolesTable.role, role),
        sql`${federalBillsTable.policyArea} is not null`
      ))
      .groupBy(federalBillsTable.policyArea)
      .orderBy(sql`count(*) desc`);

    const policyAreas = computePolicyAreas(policyAreaRows);

    const bills = rows.map((r) => ({
      id: r.id,
      title: r.title,
      number: r.number,
      congress: r.congress,
      introducedDate: r.introducedDate,
      latestAction: r.latestAction,
      policyArea: r.policyArea ?? undefined,
      url: r.url,
      chamber: r.chamber,
    }));

    // Check cache status for current congress
    const currentYear = new Date().getFullYear();
    const currentCongress = String(Math.floor((currentYear - 1789) / 2) + 1);
    const cacheStatusRows = await db
      .select()
      .from(federalMemberBillCacheStatusTable)
      .where(and(
        eq(federalMemberBillCacheStatusTable.bioguideId, bioguideId),
        eq(federalMemberBillCacheStatusTable.role, role),
        eq(federalMemberBillCacheStatusTable.congress, currentCongress)
      ))
      .limit(1);
    const fullyIngested = cacheStatusRows[0]?.fullyIngested ?? false;

    return res.json({
      bills,
      totalCount,
      offset,
      policyAreas,
      fullyIngested,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching member bills");
    return res.status(500).json({ error: String(err) });
  }
});

router.post("/federal/members/:bioguideId/bills/refresh", async (req, res) => {
  const paramsParsed = GetFederalMemberBillsParams.safeParse(req.params);
  const body = req.body;
  if (!paramsParsed.success) return res.status(400).json({ error: "Invalid params" });

  const { bioguideId } = paramsParsed.data;
  const type = body?.type === "cosponsored" ? "cosponsored" : "sponsored";
  const role = type === "sponsored" ? "sponsor" : "cosponsor";

  try {
    req.log.info({ bioguideId, role, source: "congress.gov" }, "Force refreshing member bills from Congress.gov");
    const totalIngested = await ingestFederalMemberBills(bioguideId, role, req.log);

    // Fetch first page from DB for immediate response
    const rows = await db
      .select({
        id: federalBillsTable.id,
        title: federalBillsTable.title,
        number: federalBillsTable.number,
        congress: federalBillsTable.congress,
        introducedDate: federalBillsTable.introducedDate,
        latestAction: federalBillsTable.latestAction,
        policyArea: federalBillsTable.policyArea,
        url: federalBillsTable.url,
        chamber: federalBillsTable.chamber,
      })
      .from(federalMemberBillRolesTable)
      .innerJoin(federalBillsTable, eq(federalMemberBillRolesTable.billId, federalBillsTable.id))
      .where(and(
        eq(federalMemberBillRolesTable.bioguideId, bioguideId),
        eq(federalMemberBillRolesTable.role, role)
      ))
      .orderBy(desc(federalBillsTable.introducedDate))
      .limit(20)
      .offset(0);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(federalMemberBillRolesTable)
      .where(and(
        eq(federalMemberBillRolesTable.bioguideId, bioguideId),
        eq(federalMemberBillRolesTable.role, role)
      ));

    const totalCount = Number(totalResult[0]?.count ?? 0);

    const policyAreaRows = await db
      .select({
        name: federalBillsTable.policyArea,
        count: sql<number>`count(*)`,
      })
      .from(federalMemberBillRolesTable)
      .innerJoin(federalBillsTable, eq(federalMemberBillRolesTable.billId, federalBillsTable.id))
      .where(and(
        eq(federalMemberBillRolesTable.bioguideId, bioguideId),
        eq(federalMemberBillRolesTable.role, role),
        sql`${federalBillsTable.policyArea} is not null`
      ))
      .groupBy(federalBillsTable.policyArea)
      .orderBy(sql`count(*) desc`);

    const policyAreas = computePolicyAreas(policyAreaRows);

    const bills = rows.map((r) => ({
      id: r.id,
      title: r.title,
      number: r.number,
      congress: r.congress,
      introducedDate: r.introducedDate,
      latestAction: r.latestAction,
      policyArea: r.policyArea ?? undefined,
      url: r.url,
      chamber: r.chamber,
    }));

    return res.json({
      bills,
      totalCount,
      offset: 0,
      policyAreas,
      fullyIngested: true,
      refreshed: true,
    });
  } catch (err) {
    req.log.error({ err }, "Error refreshing member bills");
    return res.status(500).json({ error: String(err) });
  }
});

function parseClerkVoteXml(xml: string) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const obj = parser.parse(xml);
  const meta = obj["rollcall-vote"]["vote-metadata"];
  const data = obj["rollcall-vote"]["vote-data"]["recorded-vote"] ?? [];
  const memberVotes = (Array.isArray(data) ? data : [data]).map((rv: any) => ({
    bioguideId: rv.legislator["@_name-id"],
    name: rv.legislator["#text"] || rv.legislator,
    party: rv.legislator["@_party"],
    state: rv.legislator["@_state"],
    voteCast: normalizeVoteCast(rv.vote),
  }));
  return {
    metadata: {
      legisNum: meta["legis-num"],
      voteQuestion: meta["vote-question"],
      voteResult: meta["vote-result"],
      voteDescription: meta["vote-desc"],
      actionDate: meta["action-date"],
      actionTime: meta["action-time"]?.["@_time-etz"],
    },
    memberVotes,
  };
}

async function discoverAndIngestVotes(congress: number, session: number) {
  const url = new URL(`${BASE}/house-vote/${congress}/${session}`);
  url.searchParams.set("api_key", CONGRESS_API_KEY!);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "250");

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Congress API error ${res.status}: ${text}`);
  }
  const data = await res.json() as any;
  const votes: any[] = data.houseRollCallVotes ?? [];

  // Batch process in chunks of 5 to avoid overwhelming Clerk server
  const chunkSize = 5;
  for (let i = 0; i < votes.length; i += chunkSize) {
    const chunk = votes.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (vote: any) => {
        const existing = await db
          .select({ id: houseVotesTable.id })
          .from(houseVotesTable)
          .where(
            and(
              eq(houseVotesTable.congress, vote.congress),
              eq(houseVotesTable.session, vote.sessionNumber),
              eq(houseVotesTable.rollCallNumber, vote.rollCallNumber)
            )
          )
          .limit(1);

        if (existing.length > 0) return; // Already ingested

        const xmlUrl = vote.sourceDataURL;
        if (!xmlUrl) return;

        try {
          const xmlRes = await fetch(xmlUrl);
          if (!xmlRes.ok) return;
          const xml = await xmlRes.text();
          const parsed = parseClerkVoteXml(xml);

          const [inserted] = await db
            .insert(houseVotesTable)
            .values({
              congress: vote.congress,
              session: vote.sessionNumber,
              rollCallNumber: vote.rollCallNumber,
              year: new Date(vote.startDate).getFullYear(),
              voteDate: vote.startDate ? new Date(vote.startDate).toISOString().split("T")[0] : null,
              legislationType: vote.legislationType ?? null,
              legislationNumber: vote.legislationNumber ?? null,
              voteQuestion: parsed.metadata.voteQuestion ?? null,
              voteResult: parsed.metadata.voteResult ?? null,
              voteDescription: parsed.metadata.voteDescription ?? null,
              sourceDataUrl: xmlUrl,
            })
            .returning({ id: houseVotesTable.id });

          if (inserted && parsed.memberVotes.length > 0) {
            await db.insert(houseVoteRecordsTable).values(
              parsed.memberVotes.map((m: any) => ({
                voteId: inserted.id,
                bioguideId: m.bioguideId,
                memberName: m.name,
                party: m.party ?? null,
                state: m.state ?? null,
                voteCast: normalizeVoteCast(m.voteCast),
              }))
            );
          }
        } catch {
          // Ignore individual vote fetch/parse failures
        }
      })
    );
  }
}

router.get("/federal/members/:bioguideId/house-votes", async (req, res) => {
  const paramsParsed = GetFederalMemberHouseVotesParams.safeParse(req.params);
  const queryParsed = GetFederalMemberHouseVotesQueryParams.safeParse(req.query);
  if (!paramsParsed.success || !queryParsed.success) return res.status(400).json({ error: "Invalid params" });

  const { bioguideId } = paramsParsed.data;
  const { offset, limit, filter } = queryParsed.data;

  try {
    // Determine current congress/session for discovery
    const currentYear = new Date().getFullYear();
    const currentCongress = Math.floor((currentYear - 1789) / 2) + 1;
    const currentSession = currentYear % 2 === 1 ? 1 : 2;

    // Check how many total votes exist for this member
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(houseVoteRecordsTable)
      .innerJoin(houseVotesTable, eq(houseVoteRecordsTable.voteId, houseVotesTable.id))
      .where(eq(houseVoteRecordsTable.bioguideId, bioguideId));

    const totalInDb = Number(countResult[0]?.count ?? 0);

    // If DB has fewer votes than requested, trigger discovery/ingestion
    if (totalInDb < offset + limit) {
      await discoverAndIngestVotes(currentCongress, currentSession);
      // Also try previous session if current session is early
      if (currentSession === 2) {
        await discoverAndIngestVotes(currentCongress, 1);
      }
    }

    // Build filter condition
    const filterConditions = [eq(houseVoteRecordsTable.bioguideId, bioguideId)];
    if (filter === "yea") filterConditions.push(eq(houseVoteRecordsTable.voteCast, "Yea"));
    if (filter === "nay") filterConditions.push(eq(houseVoteRecordsTable.voteCast, "Nay"));
    if (filter === "present") filterConditions.push(eq(houseVoteRecordsTable.voteCast, "Present"));
    if (filter === "not-voting") filterConditions.push(eq(houseVoteRecordsTable.voteCast, "Not Voting"));

    // Fetch paginated votes
    const votes = await db
      .select({
        rollCallNumber: houseVotesTable.rollCallNumber,
        date: houseVotesTable.voteDate,
        legislationType: houseVotesTable.legislationType,
        legislationNumber: houseVotesTable.legislationNumber,
        voteQuestion: houseVotesTable.voteQuestion,
        voteDescription: houseVotesTable.voteDescription,
        voteResult: houseVotesTable.voteResult,
        voteCast: houseVoteRecordsTable.voteCast,
      })
      .from(houseVoteRecordsTable)
      .innerJoin(houseVotesTable, eq(houseVoteRecordsTable.voteId, houseVotesTable.id))
      .where(and(...filterConditions))
      .orderBy(desc(houseVotesTable.voteDate))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(houseVoteRecordsTable)
      .innerJoin(houseVotesTable, eq(houseVoteRecordsTable.voteId, houseVotesTable.id))
      .where(and(...filterConditions));

    const totalCount = Number(totalCountResult[0]?.count ?? 0);

    const normalizedVotes = votes.map((v) => ({
      ...v,
      voteCast: normalizeVoteCast(v.voteCast),
    }));

    return res.json({ votes: normalizedVotes, totalCount, offset });
  } catch (err) {
    req.log.error({ err }, "Error fetching house votes");
    return res.status(500).json({ error: String(err) });
  }
});

async function resolveLisMemberId(bioguideId: string): Promise<string | null> {
  console.log("[resolveLisMemberId] bioguideId:", bioguideId);
  const mapped = await db
    .select({ lisMemberId: senatorIdentitiesTable.lisMemberId })
    .from(senatorIdentitiesTable)
    .where(eq(senatorIdentitiesTable.bioguideId, bioguideId))
    .limit(1);
  if (mapped.length > 0) {
    console.log("[resolveLisMemberId] found mapping:", mapped[0].lisMemberId);
    return mapped[0].lisMemberId;
  }

  try {
    const data = await congressFetch(`/member/${bioguideId}`);
    const m = data.member ?? {};
    const name = m.directOrderName ?? m.invertedOrderName ?? "";
    // Congress.gov returns full state name in m.state, but Senate XML uses 2-letter codes.
    // Prefer stateCode from the latest term if available.
    const latestTerm = normalizeTermsItem(m).slice(-1)[0] ?? {};
    const state = latestTerm.stateCode ?? m.state;
    console.log("[resolveLisMemberId] fetched member name:", name, "state:", state);
    if (name && state) {
      const lastName = name.split(" ").pop() ?? "";
      console.log("[resolveLisMemberId] searching vote positions for lastName:", lastName, "state:", state);
      const match = await db
        .selectDistinct({ lisMemberId: senatorVotePositionsTable.lisMemberId })
        .from(senatorVotePositionsTable)
        .where(
          and(
            eq(senatorVotePositionsTable.state, state),
            sql`${senatorVotePositionsTable.senatorName} ILIKE ${"%" + lastName + "%"}`
          )
        )
        .limit(1);
      console.log("[resolveLisMemberId] match result:", match);
      if (match.length > 0) {
        await db.insert(senatorIdentitiesTable).values({
          bioguideId,
          lisMemberId: match[0].lisMemberId,
          name,
          state: latestTerm.stateCode ?? m.state,
          party: m.partyHistory?.[0]?.partyAbbreviation,
        }).onConflictDoNothing();
        console.log("[resolveLisMemberId] stored mapping:", match[0].lisMemberId);
        return match[0].lisMemberId;
      }
    }
  } catch (err) {
    console.log("[resolveLisMemberId] error:", err);
  }
  console.log("[resolveLisMemberId] returning null");
  return null;
}

async function discoverSenateVotes(congress: number, session: number): Promise<number[]> {
  const url = `https://www.senate.gov/legislative/LIS/roll_call_lists/vote_menu_${congress}_${session}.htm`;
  console.log("[discoverSenateVotes] fetching:", url);
  const res = await fetch(url, { headers: { "User-Agent": "CivicHub/1.0" } });
  if (!res.ok) {
    console.log("[discoverSenateVotes] failed:", res.status);
    return [];
  }
  const html = await res.text();

  const matches = html.matchAll(/vote_\d+_\d+_(\d{5})\.htm/g);
  const numbers = new Set<number>();
  for (const m of matches) {
    numbers.add(parseInt(m[1], 10));
  }
  const result = Array.from(numbers).sort((a, b) => b - a);
  console.log("[discoverSenateVotes] found", result.length, "roll calls");
  return result;
}

function buildSenateVoteXmlUrl(congress: number, session: number, rollCall: number): string {
  const padded = String(rollCall).padStart(5, "0");
  return `https://www.senate.gov/legislative/LIS/roll_call_votes/vote${congress}${session}/vote_${congress}_${session}_${padded}.xml`;
}

function parseSenateVoteXml(xml: string): {
  metadata: any;
  memberVotes: Array<{ lisMemberId: string; name: string; state: string; party: string; voteCast: string }>;
} {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const obj = parser.parse(xml);
  const vote = obj.roll_call_vote;

  const doc = vote.document ?? {};
  const members = vote.members?.member ?? [];
  const memberArray = Array.isArray(members) ? members : [members];

  return {
    metadata: {
      congress: Number(vote.congress),
      session: Number(vote.session),
      rollCallNumber: Number(vote.vote_number),
      voteDate: vote.vote_date ? new Date(vote.vote_date).toISOString().split("T")[0] : null,
      voteQuestion: vote.vote_question_text ?? vote.question ?? null,
      voteResult: vote.vote_result_text ?? vote.vote_result ?? null,
      majorityRequirement: vote.majority_requirement ?? null,
      voteTitle: vote.vote_title ?? null,
      documentType: doc.document_type ?? null,
      documentNumber: doc.document_number ?? null,
      documentTitle: doc.document_title ?? null,
      issue: vote.vote_document_text ?? null,
    },
    memberVotes: memberArray.map((m: any) => ({
      lisMemberId: m.lis_member_id,
      name: `${m.first_name} ${m.last_name}`,
      state: m.state,
      party: m.party,
      voteCast: normalizeVoteCast(m.vote_cast),
    })),
  };
}

async function ingestSenateVotes(congress: number, session: number) {
  console.log("[ingestSenateVotes] starting congress:", congress, "session:", session);
  const rollCalls = await discoverSenateVotes(congress, session);
  console.log("[ingestSenateVotes] will process", rollCalls.length, "roll calls");

  const chunkSize = 5;
  let ingestedCount = 0;
  for (let i = 0; i < rollCalls.length; i += chunkSize) {
    const chunk = rollCalls.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (rollCall) => {
        const existing = await db
          .select({ id: senateRollCallVotesTable.id })
          .from(senateRollCallVotesTable)
          .where(
            and(
              eq(senateRollCallVotesTable.congress, congress),
              eq(senateRollCallVotesTable.session, session),
              eq(senateRollCallVotesTable.rollCallNumber, rollCall)
            )
          )
          .limit(1);
        if (existing.length > 0) return;

        try {
          const xmlUrl = buildSenateVoteXmlUrl(congress, session, rollCall);
          const res = await fetch(xmlUrl, { headers: { "User-Agent": "CivicHub/1.0" } });
          if (!res.ok) return;
          const xml = await res.text();
          const parsed = parseSenateVoteXml(xml);

          const [inserted] = await db
            .insert(senateRollCallVotesTable)
            .values({
              ...parsed.metadata,
              sourceXmlUrl: xmlUrl,
              sourceHtmlUrl: xmlUrl.replace(".xml", ".htm"),
            })
            .returning({ id: senateRollCallVotesTable.id });

          if (inserted && parsed.memberVotes.length > 0) {
            await db.insert(senatorVotePositionsTable).values(
              parsed.memberVotes.map((m) => ({
                voteId: inserted.id,
                lisMemberId: m.lisMemberId,
                senatorName: m.name,
                state: m.state ?? null,
                party: m.party ?? null,
                voteCast: normalizeVoteCast(m.voteCast),
                bioguideId: null,
              }))
            );
            ingestedCount++;
            console.log("[ingestSenateVotes] ingested roll call", rollCall, "with", parsed.memberVotes.length, "members");
          }
        } catch (err) {
          console.log("[ingestSenateVotes] failed roll call", rollCall, "error:", err);
        }
      })
    );
  }
  console.log("[ingestSenateVotes] done. ingested:", ingestedCount, "new votes");
}

router.get("/federal/members/:bioguideId/senate-votes", async (req, res) => {
  console.log("[senate-votes] REQUEST bioguideId:", req.params.bioguideId, "query:", req.query);
  const paramsParsed = GetFederalMemberSenateVotesParams.safeParse(req.params);
  const queryParsed = GetFederalMemberSenateVotesQueryParams.safeParse(req.query);
  if (!paramsParsed.success || !queryParsed.success) {
    return res.status(400).json({ error: "Invalid params" });
  }

  const { bioguideId } = paramsParsed.data;
  const { offset, limit, filter } = queryParsed.data;

  try {
    const currentYear = new Date().getFullYear();
    const currentCongress = Math.floor((currentYear - 1789) / 2) + 1;
    const currentSession = currentYear % 2 === 1 ? 1 : 2;

    const lisMemberId = await resolveLisMemberId(bioguideId);
    console.log("[senate-votes] resolved lisMemberId:", lisMemberId);

    const baseConditions = lisMemberId
      ? [eq(senatorVotePositionsTable.lisMemberId, lisMemberId)]
      : [];

    if (baseConditions.length === 0) {
      console.log("[senate-votes] no mapping found, triggering ingestion");
      await ingestSenateVotes(currentCongress, currentSession);
      if (currentSession === 2) await ingestSenateVotes(currentCongress, 1);
      // Retry now that vote records exist for name matching
      const retryLisId = await resolveLisMemberId(bioguideId);
      console.log("[senate-votes] retry resolved lisMemberId:", retryLisId);
      if (!retryLisId) {
        console.log("[senate-votes] still no mapping, returning empty");
        return res.json({ votes: [], totalCount: 0, offset });
      }
      baseConditions.push(eq(senatorVotePositionsTable.lisMemberId, retryLisId));
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(senatorVotePositionsTable)
      .innerJoin(senateRollCallVotesTable, eq(senatorVotePositionsTable.voteId, senateRollCallVotesTable.id))
      .where(and(...baseConditions));

    const totalInDb = Number(countResult[0]?.count ?? 0);
    console.log("[senate-votes] total votes in DB for member:", totalInDb);

    if (totalInDb < offset + limit) {
      console.log("[senate-votes] not enough votes in DB, triggering more ingestion");
      await ingestSenateVotes(currentCongress, currentSession);
      if (currentSession === 2) await ingestSenateVotes(currentCongress, 1);
    }

    const filterConditions = [...baseConditions];
    if (filter === "yea") filterConditions.push(eq(senatorVotePositionsTable.voteCast, "Yea"));
    if (filter === "nay") filterConditions.push(eq(senatorVotePositionsTable.voteCast, "Nay"));
    if (filter === "present") filterConditions.push(eq(senatorVotePositionsTable.voteCast, "Present"));
    if (filter === "not-voting") filterConditions.push(inArray(senatorVotePositionsTable.voteCast, ["Not Voting", "Absent"]));

    const votes = await db
      .select({
        rollCallNumber: senateRollCallVotesTable.rollCallNumber,
        date: senateRollCallVotesTable.voteDate,
        documentType: senateRollCallVotesTable.documentType,
        documentNumber: senateRollCallVotesTable.documentNumber,
        voteQuestion: senateRollCallVotesTable.voteQuestion,
        voteTitle: senateRollCallVotesTable.voteTitle,
        voteResult: senateRollCallVotesTable.voteResult,
        voteCast: senatorVotePositionsTable.voteCast,
      })
      .from(senatorVotePositionsTable)
      .innerJoin(senateRollCallVotesTable, eq(senatorVotePositionsTable.voteId, senateRollCallVotesTable.id))
      .where(and(...filterConditions))
      .orderBy(desc(senateRollCallVotesTable.voteDate))
      .limit(limit)
      .offset(offset);

    const normalized = votes.map((v) => ({
      ...v,
      voteCast: normalizeVoteCast(v.voteCast),
    }));

    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(senatorVotePositionsTable)
      .innerJoin(senateRollCallVotesTable, eq(senatorVotePositionsTable.voteId, senateRollCallVotesTable.id))
      .where(and(...filterConditions));

    const totalCount = Number(totalCountResult[0]?.count ?? 0);
    console.log("[senate-votes] returning", normalized.length, "votes, totalCount:", totalCount);

    return res.json({
      votes: normalized,
      totalCount,
      offset,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching senate votes");
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/federal/members/:bioguideId/committees", async (req, res) => {
  const parsed = GetFederalMemberCommitteesParams.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid params" });

  try {
    const data = await congressFetch(`/member/${parsed.data.bioguideId}`, {}, req.log);
    const memberData = data.member ?? {};
    const committeeAssignments = normalizeTermsItem(memberData);

    // Get unique committee assignments from most recent terms
    const committeeMap = new Map<string, any>();
    for (const term of committeeAssignments) {
      for (const c of term.committees ?? []) {
        if (!committeeMap.has(c.name)) {
          committeeMap.set(c.name, {
            name: c.name,
            chamber: term.chamber,
            committeeCode: c.systemCode,
          });
        }
      }
    }

    // Fetch committee members for each committee
    const committees = await Promise.all(
      Array.from(committeeMap.values()).slice(0, 5).map(async (c) => {
        try {
          if (c.committeeCode) {
            const chamber = c.chamber?.toLowerCase().includes("senate") ? "senate" : "house";
            const membersData = await congressFetch(`/committee/${chamber}/${c.committeeCode}/members`, { limit: 20 }, req.log);
            const members = (membersData.committeeMember ?? []).map((m: any) => ({
              name: m.name ?? "",
              party: m.party,
              state: m.state,
              rank: m.rank,
              bioguideId: m.bioguideId,
            }));
            return { ...c, members };
          }
        } catch {
          // ignore
        }
        return c;
      })
    );

    return res.json({ committees });
  } catch (err) {
    req.log.error({ err }, "Error fetching member committees");
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/federal/bills", async (req, res) => {
  const parsed = GetFederalBillsQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid params" });

  const { chamber, offset, limit } = parsed.data;

  try {
    // Calculate current congress (1st Congress was 1789-1791)
    const currentYear = new Date().getFullYear();
    const currentCongress = Math.floor((currentYear - 1789) / 2) + 1;

    const params: Record<string, string | number> = { offset, limit, sort: "introducedDate desc" };
    if (chamber && chamber !== "both") {
      params.chamber = chamber.charAt(0).toUpperCase() + chamber.slice(1);
    }

    const data = await congressFetch(`/bill/${currentCongress}`, params, req.log);
    const bills = (data.bills ?? []).map((b: any) => ({
      id: `${b.congress}-${b.type}-${b.number}`,
      title: b.title ?? "Untitled",
      number: `${b.type} ${b.number}`,
      congress: String(b.congress),
      introducedDate: b.introducedDate,
      latestAction: b.latestAction?.text,
      latestActionDate: b.latestAction?.actionDate,
      sponsors: b.sponsors?.map((s: any) => s.fullName) ?? [],
      url: b.url,
      status: b.latestAction?.text,
      chamber: b.originChamber,
      policyArea: b.policyArea?.name ?? undefined,
      subjects: b.subjects?.item ?? (Array.isArray(b.subjects) ? b.subjects : undefined),
    }));

    // Ensure most current first by latest action date
    bills.sort((a: any, b: any) => {
      const dateA = a.latestActionDate ? new Date(a.latestActionDate).getTime() : 0;
      const dateB = b.latestActionDate ? new Date(b.latestActionDate).getTime() : 0;
      return dateB - dateA;
    });

    req.log.info({ count: bills.length, source: "congress.gov" }, "Fetched federal bills from Congress.gov");

    // Upsert into cache for search
    for (const bill of bills) {
      const subjectsText = Array.isArray(bill.subjects) ? bill.subjects.join(" ") : "";
      await db.insert(federalBillsTable).values({
        id: bill.id,
        title: bill.title,
        number: bill.number ?? null,
        congress: bill.congress ?? null,
        introducedDate: bill.introducedDate ?? null,
        summary: null,
        policyArea: bill.policyArea ?? null,
        subjects: bill.subjects ?? [],
        url: bill.url ?? null,
        raw: null,
        searchVector: sql`to_tsvector('english', coalesce(${bill.title}, '') || ' ' || coalesce(${bill.number}, '') || ' ' || coalesce(${subjectsText}, ''))`,
      }).onConflictDoUpdate({
        target: federalBillsTable.id,
        set: {
          title: bill.title,
          number: bill.number ?? null,
          policyArea: bill.policyArea ?? null,
          subjects: bill.subjects ?? [],
          url: bill.url ?? null,
          fetchedAt: new Date(),
          searchVector: sql`to_tsvector('english', coalesce(${bill.title}, '') || ' ' || coalesce(${bill.number}, '') || ' ' || coalesce(${subjectsText}, ''))`,
        },
      });
    }

    return res.json({ bills, totalCount: data.pagination?.count, offset });
  } catch (err) {
    req.log.error({ err }, "Error fetching federal bills");
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/federal/bills/:congress/:billType/:billNumber", async (req, res) => {
  const parsed = GetFederalBillDetailParams.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid params" });

  const { congress, billType, billNumber } = parsed.data;

  try {
    const [billData, cosponsorsData, committeesData, actionsData, summaryData, textData] = await Promise.allSettled([
      congressFetch(`/bill/${congress}/${billType}/${billNumber}`, {}, req.log),
      congressFetch(`/bill/${congress}/${billType}/${billNumber}/cosponsors`, { limit: 50 }, req.log),
      congressFetch(`/bill/${congress}/${billType}/${billNumber}/committees`, {}, req.log),
      congressFetch(`/bill/${congress}/${billType}/${billNumber}/actions`, { limit: 20 }, req.log),
      congressFetch(`/bill/${congress}/${billType}/${billNumber}/summaries`, {}, req.log),
      congressFetch(`/bill/${congress}/${billType}/${billNumber}/text`, {}, req.log),
    ]);

    const bill = billData.status === "fulfilled" ? (billData.value.bill ?? {}) : {};
    const cosponsors = cosponsorsData.status === "fulfilled"
      ? (cosponsorsData.value.cosponsors?.item ?? []).map((c: any) => ({
          name: c.fullName ?? c.name ?? "",
          party: c.party,
          state: c.state,
          bioguideId: c.bioguideId,
        }))
      : [];

    const committees = committeesData.status === "fulfilled"
      ? (committeesData.value.committees?.item ?? []).map((c: any) => ({
          name: c.name ?? "",
          chamber: c.chamber,
          committeeCode: c.systemCode,
        }))
      : [];

    const actions = actionsData.status === "fulfilled"
      ? (actionsData.value.actions?.item ?? []).map((a: any) => ({
          date: a.actionDate ?? "",
          text: a.text ?? "",
          type: a.type,
        }))
      : [];

    const summary = summaryData.status === "fulfilled"
      ? (summaryData.value.summaries?.item?.[0]?.text ?? undefined)
      : undefined;

    const textVersions = textData.status === "fulfilled" ? (textData.value.textVersions ?? []) : [];
    const latestText = textVersions[0];
    const textUrl = latestText?.formats?.find((f: any) => f.type === "PDF")?.url
      ?? latestText?.formats?.[0]?.url
      ?? undefined;

    req.log.info({ billId: `${congress}-${billType}-${billNumber}`, source: "congress.gov" }, "Fetched federal bill detail from Congress.gov");

    // Normalize subjects from Congress.gov nested structure (may be { item: [...] })
    const billSubjects = bill.subjects?.item ?? (Array.isArray(bill.subjects) ? bill.subjects : []);
    const subjectsText = billSubjects.join(" ");
    await db.insert(federalBillsTable).values({
      id: `${congress}-${billType}-${billNumber}`,
      title: bill.title ?? "Untitled",
      number: `${billType} ${billNumber}`,
      congress: String(congress),
      introducedDate: bill.introducedDate ?? null,
      summary: summary ? summary.replace(/<[^>]*>/g, "") : null,
      policyArea: bill.policyArea?.name ?? null,
      subjects: billSubjects,
      url: bill.url ?? null,
      textUrl: textUrl ?? null,
      raw: bill,
      searchVector: sql`to_tsvector('english', coalesce(${bill.title ?? ""}, '') || ' ' || coalesce(${billType + " " + billNumber}, '') || ' ' || coalesce(${summary ? summary.replace(/<[^>]*>/g, "") : ""}, '') || ' ' || coalesce(${subjectsText}, ''))`,
    }).onConflictDoUpdate({
      target: federalBillsTable.id,
      set: {
        title: bill.title ?? "Untitled",
        number: `${billType} ${billNumber}`,
        congress: String(congress),
        introducedDate: bill.introducedDate ?? null,
        summary: summary ? summary.replace(/<[^>]*>/g, "") : null,
        policyArea: bill.policyArea?.name ?? null,
        subjects: billSubjects,
        url: bill.url ?? null,
        textUrl: textUrl ?? null,
        raw: bill,
        fetchedAt: new Date(),
        searchVector: sql`to_tsvector('english', coalesce(${bill.title ?? ""}, '') || ' ' || coalesce(${billType + " " + billNumber}, '') || ' ' || coalesce(${summary ? summary.replace(/<[^>]*>/g, "") : ""}, '') || ' ' || coalesce(${subjectsText}, ''))`,
      },
    });

    return res.json({
      id: `${congress}-${billType}-${billNumber}`,
      title: bill.title ?? "Untitled",
      number: `${billType} ${billNumber}`,
      congress: String(congress),
      introducedDate: bill.introducedDate,
      summary: summary ? summary.replace(/<[^>]*>/g, "") : undefined,
      status: bill.latestAction?.text,
      latestAction: bill.latestAction?.text,
      latestActionDate: bill.latestAction?.actionDate,
      sponsors: bill.sponsors?.map((s: any) => ({
        name: s.fullName ?? s.name ?? "",
        party: s.party,
        state: s.state,
        bioguideId: s.bioguideId,
      })) ?? [],
      cosponsors,
      committees,
      actions,
      url: bill.url,
      textUrl,
      policyArea: bill.policyArea?.name ?? undefined,
      subjects: undefined,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching bill detail");
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/federal/bills/search", async (req, res) => {
  const q = req.query.q;
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const offset = Number(req.query.offset ?? 0);

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    req.log.info({ q, source: "db" }, "Searching federal bills from DB cache");
    const searchQuery = sql`websearch_to_tsquery('english', ${q})`;
    const conditions = [sql`${federalBillsTable.searchVector} @@ ${searchQuery}`];

    const rows = await db
      .select()
      .from(federalBillsTable)
      .where(and(...conditions))
      .orderBy(sql`ts_rank(${federalBillsTable.searchVector}, ${searchQuery}) desc`)
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(federalBillsTable)
      .where(and(...conditions));

    const totalCount = Number(countResult[0]?.count ?? 0);

    const bills = rows.map((b) => ({
      id: b.id,
      title: b.title,
      number: b.number,
      congress: b.congress,
      introducedDate: b.introducedDate,
      summary: b.summary,
      policyArea: b.policyArea,
      subjects: b.subjects,
      url: b.url,
    }));

    return res.json({ bills, totalCount, offset });
  } catch (err) {
    req.log.error({ err }, "Error searching federal bills");
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
