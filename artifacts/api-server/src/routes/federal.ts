import { Router } from "express";
import { eq, and, or, desc, sql, inArray } from "drizzle-orm";
import { XMLParser } from "fast-xml-parser";
import {
  db,
  normalizeVoteCast,
  federalBillsTable,
  federalMembersTable,
  federalMemberBillRolesTable,
  federalMemberBillCacheStatusTable,
  federalMemberLegislationItemsTable,
  federalCommitteesTable,
  federalMemberCommitteesTable,
} from "@workspace/db";
import {
  houseVotesTable,
  houseVoteRecordsTable,
  senateRollCallVotesTable,
  senatorVotePositionsTable,
  senatorIdentitiesTable,
} from "@workspace/db";
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
  SearchFederalMembersQueryParams,
  SearchFederalBillsQueryParams,
} from "@workspace/api-zod";
import { fetchWithTimeout as fetch } from "../lib/http";
import { sendInternalError } from "../lib/respond";
import { logger } from "../lib/logger";
import {
  classifyFederalLegislationItem,
  getFederalLegislationDisplayNumber,
  getFederalLegislationItemId,
  getFederalLegislationTitle,
  mapFederalLegislationForResponse,
  shouldResumeMemberLegislationIngestion,
  type FederalLegislationCategory,
} from "../lib/federalMemberLegislation";
import { computeFederalBillProgress, getCurrentCongressNumber } from "../lib/federalBillProgress";

const router = Router();

const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
const BASE = "https://api.congress.gov/v3";

async function congressFetch(
  path: string,
  params: Record<string, string | number> = {},
  logger?: any,
) {
  if (!CONGRESS_API_KEY) throw new Error("CONGRESS_API_KEY not configured");
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", CONGRESS_API_KEY);
  url.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  logger?.info(
    { url: url.toString(), source: "congress.gov" },
    "Fetching from Congress.gov",
  );
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
    inOffice:
      raw.inOffice != null
        ? raw.inOffice === true || raw.inOffice === "true"
        : undefined,
    nextElection: row.nextElection ?? undefined,
  };
}

function isStale(row: typeof federalMembersTable.$inferSelect): boolean {
  return Date.now() - new Date(row.fetchedAt).getTime() > STALE_THRESHOLD_MS;
}

// House Clerk XML comcode -> committee name mapping (standing + select committees, 119th Congress)
const HOUSE_COMMITTEE_NAMES: Record<string, string> = {
  AG00: "Committee on Agriculture",
  AP00: "Committee on Appropriations",
  AS00: "Committee on Armed Services",
  BA00: "Committee on Financial Services",
  BU00: "Committee on the Budget",
  ED00: "Committee on Education and the Workforce",
  FA00: "Committee on Foreign Affairs",
  GO00: "Committee on Oversight and Government Reform",
  HA00: "Committee on House Administration",
  HM00: "Committee on Homeland Security",
  IF00: "Committee on Energy and Commerce",
  IG00: "Permanent Select Committee on Intelligence",
  JU00: "Committee on the Judiciary",
  PW00: "Committee on Transportation and Infrastructure",
  RU00: "Committee on Rules",
  SM00: "Committee on Small Business",
  SO00: "Committee on Ethics",
  SY00: "Committee on Science, Space, and Technology",
  VR00: "Committee on Veterans' Affairs",
  WM00: "Committee on Ways and Means",
  EC00: "Joint Economic Committee",
  IT00: "Joint Committee on Taxation",
  JL00: "Joint Committee on the Library",
  JP00: "Joint Committee on Printing",
  ZL00: "Select Committee on the Strategic Competition Between the U.S. and the Chinese Communist Party",
  ZR00: "Select Subcommittee on the Weaponization of the Federal Government",
};

async function fetchHouseCommitteesFromClerkXml(): Promise<
  Map<string, string[]>
> {
  const res = await fetch("https://clerk.house.gov/xml/lists/MemberData.xml", {
    headers: { "User-Agent": "CivicHub/1.0" },
  });
  if (!res.ok) throw new Error(`House Clerk XML error ${res.status}`);
  const xml = await res.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const obj = parser.parse(xml);

  const memberMap = new Map<string, string[]>();
  const members = obj?.MemberData?.members?.member ?? [];
  for (const m of Array.isArray(members) ? members : [members]) {
    const bioguideId =
      m?.memberInfo?.bioguideID ?? m?.["member-info"]?.bioguideID;
    if (!bioguideId) continue;
    const assignments: string[] = [];
    const committeeAssignments =
      m?.committeeAssignments ?? m?.["committee-assignments"];
    const committees = committeeAssignments?.committee ?? [];
    for (const c of Array.isArray(committees) ? committees : [committees]) {
      const code = c?.["@_comcode"];
      if (code) assignments.push(code);
    }
    memberMap.set(bioguideId, assignments);
  }
  return memberMap;
}

async function fetchSenateCommitteesFromXml(
  bioguideId: string,
): Promise<Array<{ code: string; name: string }>> {
  // Senate committee XMLs are per-committee. To avoid fetching all ~20 committee XMLs
  // on every request, we fetch the Senate contact XML to get all senator names, then
  // try to match the requested senator against committee rosters.
  // NOTE: This is a best-effort approach. The Senate XML does not include bioguideIds.

  // Step 1: Get the senator's name from our cached member data
  const rows = await db
    .select()
    .from(federalMembersTable)
    .where(eq(federalMembersTable.bioguideId, bioguideId))
    .limit(1);
  const memberName = rows[0]?.name;
  if (!memberName) return [];

  const lastName = memberName.split(" ").pop()?.toLowerCase() ?? "";

  // Step 2: Fetch Senate contact XML to get all senator names for matching
  const contactRes = await fetch(
    "https://www.senate.gov/general/contact_information/senators_cfm.xml",
    { headers: { "User-Agent": "CivicHub/1.0" } },
  );
  if (!contactRes.ok) return [];
  const contactXml = await contactRes.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const contactObj = parser.parse(contactXml);

  const senators = contactObj?.contact_information?.member ?? [];
  let targetLastName = "";
  for (const s of Array.isArray(senators) ? senators : [senators]) {
    const id = s?.bioguide_id;
    if (id === bioguideId) {
      targetLastName = (s?.last_name ?? "").toLowerCase().trim();
      break;
    }
  }
  if (!targetLastName) targetLastName = lastName;

  // Step 3: Fetch all Senate committee XMLs and search for the senator
  const committeeCodes = [
    "SSEG",
    "SSBK",
    "SSAF",
    "SSAP",
    "SSAS",
    "SSBU",
    "SSCM",
    "SSEG",
    "SSFI",
    "SSFR",
    "SSGA",
    "SSHR",
    "SSHS",
    "SSJU",
    "SSRA",
    "SSSB",
    "SSVA",
    "SSCM",
    "SLET",
  ];
  const results: Array<{ code: string; name: string }> = [];

  for (const code of committeeCodes) {
    try {
      const res = await fetch(
        `https://www.senate.gov/general/committee_membership/committee_memberships_${code}.xml`,
        { headers: { "User-Agent": "CivicHub/1.0" } },
      );
      if (!res.ok) continue;
      const xml = await res.text();
      const obj = parser.parse(xml);
      const committeeName =
        obj?.committee_membership?.committees?.committee_name ?? "";
      const members =
        obj?.committee_membership?.committees?.members?.member ?? [];
      for (const m of Array.isArray(members) ? members : [members]) {
        const memberLastName = (m?.name?.last ?? "").toLowerCase().trim();
        if (memberLastName === targetLastName) {
          results.push({ code, name: committeeName });
          break;
        }
      }
    } catch {
      // ignore individual committee fetch failures
    }
  }

  return results;
}

function computePolicyAreas(
  rows: Array<{ name: string | null; count: string | number }>,
): Array<{ name: string; count: number; pct: number }> {
  const total = rows.reduce((sum, r) => sum + Number(r.count), 0);
  if (total === 0) return [];

  return rows.map((r) => ({
    name: r.name ?? "Unknown",
    count: Number(r.count),
    pct: Math.round((Number(r.count) / total) * 100),
  }));
}

async function fetchAndCacheFederalMember(bioguideId: string, logger?: any) {
  logger?.info(
    { bioguideId, source: "congress.gov" },
    "Fetching federal member from Congress.gov",
  );
  const data = await congressFetch(`/member/${bioguideId}`, {}, logger);
  const m = data.member ?? {};
  const mapped = normalizeMemberFromRaw(m);

  await db
    .insert(federalMembersTable)
    .values({
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
    })
    .onConflictDoUpdate({
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

  // Ingest committee assignments from official XML sources
  try {
    const chamber = mapped.chamber?.toLowerCase() ?? "";
    let assignments: Array<{ code: string; name: string }> = [];

    if (chamber.includes("house")) {
      const houseMap = await fetchHouseCommitteesFromClerkXml();
      const codes = houseMap.get(mapped.bioguideId || bioguideId) ?? [];
      assignments = codes.map((code) => ({
        code,
        name: HOUSE_COMMITTEE_NAMES[code] ?? `Committee ${code}`,
      }));
    } else if (chamber.includes("senate")) {
      assignments = await fetchSenateCommitteesFromXml(
        mapped.bioguideId || bioguideId,
      );
    }

    // Upsert committees and member assignments within a transaction
    await db.transaction(async (tx) => {
      for (const a of assignments) {
        await tx
          .insert(federalCommitteesTable)
          .values({
            id: a.code,
            name: a.name,
            chamber: mapped.chamber ?? null,
            fetchedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: federalCommitteesTable.id,
            set: {
              name: a.name,
              chamber: mapped.chamber ?? null,
              fetchedAt: new Date(),
            },
          });
        await tx
          .insert(federalMemberCommitteesTable)
          .values({
            bioguideId: mapped.bioguideId || bioguideId,
            committeeId: a.code,
            fetchedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [
              federalMemberCommitteesTable.bioguideId,
              federalMemberCommitteesTable.committeeId,
            ],
            set: { fetchedAt: new Date() },
          });
      }

      // Mark committee data as fetched even if empty (prevents repeated XML fetches)
      await tx
        .update(federalMembersTable)
        .set({ committeeFetchedAt: new Date() })
        .where(
          eq(federalMembersTable.bioguideId, mapped.bioguideId || bioguideId),
        );
    });
  } catch (err) {
    logger?.warn(
      { err, bioguideId },
      "Failed to ingest committee assignments from XML",
    );
  }

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
    const data = (await response.json()) as any;

    const members: any[] = data.members ?? [];
    const mapped = members
      .filter((m: any) => normalizeTermsItem(m).some((t: any) => !t.endYear))
      .map((m: any) => {
        const latestTerm = normalizeTermsItem(m).slice(-1)[0];
        const chamber = latestTerm?.chamber;
        const isSenate = chamber === "Senate";
        return {
          name: formatCongressName(m.name),
          office: isSenate
            ? `U.S. Senator for ${stateUpper}`
            : `U.S. Representative, ${stateUpper}-${m.district ?? ""}`,
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
    return sendInternalError(res);
  }
});

router.get("/federal/members/search", async (req, res) => {
  const parsed = SearchFederalMembersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }
  const { q, limit: rawLimit, offset } = parsed.data;
  const limit = Math.min(rawLimit, 100);

  try {
    req.log.info(
      { q, source: "db" },
      "Searching federal members from DB cache",
    );
    const searchPattern = `%${q}%`;

    const rows = await db
      .select()
      .from(federalMembersTable)
      .where(
        or(
          sql`${federalMembersTable.name} ILIKE ${searchPattern}`,
          sql`${federalMembersTable.state} ILIKE ${searchPattern}`,
          sql`${federalMembersTable.party} ILIKE ${searchPattern}`,
        ),
      )
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(federalMembersTable)
      .where(
        or(
          sql`${federalMembersTable.name} ILIKE ${searchPattern}`,
          sql`${federalMembersTable.state} ILIKE ${searchPattern}`,
          sql`${federalMembersTable.party} ILIKE ${searchPattern}`,
        ),
      );

    const totalCount = Number(countResult[0]?.count ?? 0);
    const members = rows.map(mapDbRowToMember);

    return res.json({ members, totalCount, offset });
  } catch (err) {
    req.log.error({ err }, "Error searching federal members");
    return sendInternalError(res);
  }
});

router.get("/federal/members/:bioguideId", async (req, res) => {
  const parsed = GetFederalMemberParams.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid params" });

  const bioguideId = parsed.data.bioguideId;

  try {
    const rows = await db
      .select()
      .from(federalMembersTable)
      .where(eq(federalMembersTable.bioguideId, bioguideId))
      .limit(1);
    const cached = rows[0];

    if (cached) {
      const stale = isStale(cached);
      if (!stale) {
        req.log.info(
          { bioguideId, source: "db" },
          "Serving federal member from cache",
        );
        return res.json({
          member: mapDbRowToMember(cached),
          cache: {
            source: "db",
            stale: false,
            fetchedAt: cached.fetchedAt.toISOString(),
          },
        });
      }
      // Stale cache — try to refresh
      try {
        req.log.info(
          { bioguideId, source: "congress.gov" },
          "Refreshing stale federal member from Congress.gov",
        );
        const fresh = await fetchAndCacheFederalMember(bioguideId, req.log);
        return res.json({
          member: fresh,
          cache: {
            source: "congress.gov",
            stale: false,
            fetchedAt: new Date().toISOString(),
          },
        });
      } catch (err) {
        req.log.warn(
          { err, bioguideId, source: "db" },
          "Failed to refresh stale federal member; returning cached data",
        );
        return res.json({
          member: mapDbRowToMember(cached),
          cache: {
            source: "db",
            stale: true,
            fetchedAt: cached.fetchedAt.toISOString(),
            refreshFailed: true,
          },
        });
      }
    }

    // Cache miss
    req.log.info(
      { bioguideId, source: "congress.gov" },
      "Cache miss; fetching federal member from Congress.gov",
    );
    const fresh = await fetchAndCacheFederalMember(bioguideId, req.log);
    return res.json({
      member: fresh,
      cache: {
        source: "congress.gov",
        stale: false,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching federal member");
    return sendInternalError(res);
  }
});

router.post("/federal/members/:bioguideId/refresh", async (req, res) => {
  const parsed = GetFederalMemberParams.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid params" });

  const bioguideId = parsed.data.bioguideId;

  try {
    req.log.info(
      { bioguideId, source: "congress.gov" },
      "Force refreshing federal member from Congress.gov",
    );
    const fresh = await fetchAndCacheFederalMember(bioguideId, req.log);
    return res.json({
      member: fresh,
      cache: {
        source: "congress.gov",
        stale: false,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    // On failure, return cached data if available
    const rows = await db
      .select()
      .from(federalMembersTable)
      .where(eq(federalMembersTable.bioguideId, bioguideId))
      .limit(1);
    const cached = rows[0];
    if (cached) {
      req.log.warn(
        { err, bioguideId, source: "db" },
        "Refresh failed; returning cached federal member",
      );
      return res.json({
        member: mapDbRowToMember(cached),
        cache: {
          source: "db",
          stale: isStale(cached),
          fetchedAt: cached.fetchedAt.toISOString(),
          refreshFailed: true,
        },
      });
    }
    req.log.error({ err }, "Error refreshing federal member");
    return sendInternalError(res);
  }
});

function getCurrentCongress() {
  return String(getCurrentCongressNumber());
}

const activeBillIngestions = new Set<string>();

async function ingestFederalMemberBillsPage(
  bioguideId: string,
  role: "sponsor" | "cosponsor",
  page: number,
  logger?: any,
): Promise<{ inserted: number; totalExpected: number; billItems: any[] }> {
  const endpoint =
    role === "sponsor" ? "sponsored-legislation" : "cosponsored-legislation";
  const key =
    role === "sponsor" ? "sponsoredLegislation" : "cosponsoredLegislation";

  logger?.info(
    { bioguideId, role, page, source: "congress.gov" },
    "Ingesting member bills page from Congress.gov",
  );
  const data = await congressFetch(
    `/member/${bioguideId}/${endpoint}`,
    { offset: (page - 1) * 250, limit: 250 },
    logger,
  );
  const allItems: any[] = data[key] ?? data.bills ?? [];

  // Keep the legacy bill tables populated for existing bill detail/search flows,
  // but cache every Congress.gov member-legislation record for profile pages.
  await Promise.all(
    allItems.map(async (b) => {
      const itemId = getFederalLegislationItemId(b);
      const category = classifyFederalLegislationItem(b);
      const displayNumber = getFederalLegislationDisplayNumber(b);
      const title = getFederalLegislationTitle(b);
      const latestActionText = b.latestAction?.text ?? null;
      const latestActionDate = b.latestAction?.actionDate ?? null;
      const subjects =
        b.subjects?.item ?? (Array.isArray(b.subjects) ? b.subjects : []);
      const subjectsText = Array.isArray(subjects) ? subjects.join(" ") : "";

      await db
        .insert(federalMemberLegislationItemsTable)
        .values({
          bioguideId,
          itemId,
          role,
          congress: b.congress != null ? String(b.congress) : null,
          category,
          type: b.type ?? null,
          number: displayNumber ?? null,
          amendmentNumber:
            b.amendmentNumber != null ? String(b.amendmentNumber) : null,
          title,
          introducedDate: b.introducedDate ?? null,
          latestAction: latestActionText,
          latestActionDate,
          policyArea: b.policyArea?.name ?? null,
          url: b.url ?? null,
          raw: b,
          searchVector: sql`to_tsvector('english', coalesce(${title}, '') || ' ' || coalesce(${displayNumber ?? ""}, '') || ' ' || coalesce(${subjectsText}, ''))`,
        })
        .onConflictDoUpdate({
          target: [
            federalMemberLegislationItemsTable.bioguideId,
            federalMemberLegislationItemsTable.itemId,
            federalMemberLegislationItemsTable.role,
          ],
          set: {
            congress: b.congress != null ? String(b.congress) : null,
            category,
            type: b.type ?? null,
            number: displayNumber ?? null,
            amendmentNumber:
              b.amendmentNumber != null ? String(b.amendmentNumber) : null,
            title,
            introducedDate: b.introducedDate ?? null,
            latestAction: latestActionText,
            latestActionDate,
            policyArea: b.policyArea?.name ?? null,
            url: b.url ?? null,
            raw: b,
            fetchedAt: new Date(),
            searchVector: sql`to_tsvector('english', coalesce(${title}, '') || ' ' || coalesce(${displayNumber ?? ""}, '') || ' ' || coalesce(${subjectsText}, ''))`,
          },
        });

      if (category !== "bill" && category !== "resolution") return;

      const billId = b.number
        ? `${b.congress}-${b.type?.toLowerCase()}-${b.number}`
        : itemId;

      await db
        .insert(federalBillsTable)
        .values({
          id: billId,
          title,
          number: displayNumber ?? b.billNumber,
          congress: String(b.congress),
          introducedDate: b.introducedDate ?? null,
          summary: null,
          latestAction: latestActionText,
          chamber: b.originChamber ?? null,
          policyArea: b.policyArea?.name ?? null,
          subjects: subjects ?? [],
          url: b.url ?? null,
          raw: null,
          searchVector: sql`to_tsvector('english', coalesce(${title}, '') || ' ' || coalesce(${displayNumber ?? ""}, '') || ' ' || coalesce(${subjectsText}, ''))`,
        })
        .onConflictDoUpdate({
          target: federalBillsTable.id,
          set: {
            title,
            number: displayNumber ?? b.billNumber,
            congress: String(b.congress),
            introducedDate: b.introducedDate ?? null,
            latestAction: latestActionText,
            chamber: b.originChamber ?? null,
            policyArea: b.policyArea?.name ?? null,
            subjects: subjects ?? [],
            url: b.url ?? null,
            fetchedAt: new Date(),
            searchVector: sql`to_tsvector('english', coalesce(${title}, '') || ' ' || coalesce(${displayNumber ?? ""}, '') || ' ' || coalesce(${subjectsText}, ''))`,
          },
        });

      await db
        .insert(federalMemberBillRolesTable)
        .values({
          bioguideId,
          billId,
          congress: String(b.congress),
          role,
          fetchedAt: new Date(),
        })
        .onConflictDoNothing();
    }),
  );

  const totalExpected = data.pagination?.count ?? 0;
  return { inserted: allItems.length, totalExpected, billItems: allItems };
}

async function ingestFederalMemberBills(
  bioguideId: string,
  role: "sponsor" | "cosponsor",
  logger?: any,
  opts?: { startPage?: number; skipCacheWrite?: boolean },
) {
  const jobKey = `${bioguideId}:${role}`;
  if (activeBillIngestions.has(jobKey)) {
    logger?.info(
      { bioguideId, role },
      "Bill ingestion already in progress; skipping duplicate",
    );
    return;
  }
  activeBillIngestions.add(jobKey);

  try {
    const currentCongress = getCurrentCongress();
    let page = opts?.startPage ?? 1;
    let hasMore = true;
    let totalIngested = 0;
    let sourceTotalCount = 0;
    const MAX_PAGES = 200;

    while (hasMore && page <= MAX_PAGES) {
      const { inserted, totalExpected } = await ingestFederalMemberBillsPage(
        bioguideId,
        role,
        page,
        logger,
      );
      totalIngested += inserted;
      sourceTotalCount = totalExpected;

      if (inserted === 0) {
        hasMore = false;
        break;
      }

      hasMore = totalIngested < totalExpected && inserted >= 250;
      page++;
    }

    const localCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(federalMemberLegislationItemsTable)
      .where(
        and(
          eq(federalMemberLegislationItemsTable.bioguideId, bioguideId),
          eq(federalMemberLegislationItemsTable.role, role),
        ),
      );
    const localCount = Number(localCountResult[0]?.count ?? 0);
    const sourceRecordsScanned =
      ((opts?.startPage ?? 1) - 1) * 250 + totalIngested;
    const fullyIngested =
      sourceTotalCount === 0 || sourceRecordsScanned >= sourceTotalCount;

    logger?.info(
      {
        bioguideId,
        role,
        totalIngested,
        localCount,
        sourceRecordsScanned,
        sourceTotalCount,
        source: "db",
      },
      "Member bill background ingestion complete",
    );

    if (!opts?.skipCacheWrite) {
      await db
        .insert(federalMemberBillCacheStatusTable)
        .values({
          bioguideId,
          role,
          congress: currentCongress,
          fullyIngested,
          localCount,
          sourceTotalCount,
          lastFetchedAt: new Date(),
          lastFullSyncAt: fullyIngested ? new Date() : null,
        })
        .onConflictDoUpdate({
          target: [
            federalMemberBillCacheStatusTable.bioguideId,
            federalMemberBillCacheStatusTable.role,
            federalMemberBillCacheStatusTable.congress,
          ],
          set: {
            fullyIngested,
            localCount,
            sourceTotalCount,
            lastFetchedAt: new Date(),
            lastFullSyncAt: fullyIngested ? new Date() : null,
          },
        });
    }
  } finally {
    activeBillIngestions.delete(jobKey);
  }
}

router.get("/federal/members/:bioguideId/bills", async (req, res) => {
  const paramsParsed = GetFederalMemberBillsParams.safeParse(req.params);
  const queryParsed = GetFederalMemberBillsQueryParams.safeParse(req.query);
  if (!paramsParsed.success || !queryParsed.success)
    return res.status(400).json({ error: "Invalid params" });

  const { bioguideId } = paramsParsed.data;
  const { type, offset, limit, q } = queryParsed.data;
  const category = (
    typeof req.query.category === "string" ? req.query.category : "all"
  ) as FederalLegislationCategory;
  if (!["all", "bill", "resolution", "amendment", "other"].includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }
  const role = type === "sponsored" ? "sponsor" : "cosponsor";

  try {
    // Build search condition if q is provided
    const searchCondition = q
      ? sql`${federalMemberLegislationItemsTable.searchVector} @@ websearch_to_tsquery('english', ${q})`
      : undefined;
    const categoryCondition =
      category && category !== "all"
        ? eq(federalMemberLegislationItemsTable.category, category)
        : undefined;

    // Check if we have cached bills for this member+role
    const cachedCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(federalMemberLegislationItemsTable)
      .where(
        and(
          eq(federalMemberLegislationItemsTable.bioguideId, bioguideId),
          eq(federalMemberLegislationItemsTable.role, role),
        ),
      );

    const cachedCount = Number(cachedCountResult[0]?.count ?? 0);
    const currentCongress = getCurrentCongress();

    const cacheStatusRows = await db
      .select()
      .from(federalMemberBillCacheStatusTable)
      .where(
        and(
          eq(federalMemberBillCacheStatusTable.bioguideId, bioguideId),
          eq(federalMemberBillCacheStatusTable.role, role),
          eq(federalMemberBillCacheStatusTable.congress, currentCongress),
        ),
      )
      .limit(1);
    const cacheStatus = cacheStatusRows[0];

    let bills: any[] = [];
    let totalCount = 0;
    let fullyIngested = cacheStatus?.fullyIngested ?? false;
    let sourceTotalCount = cacheStatus?.sourceTotalCount ?? cachedCount;

    if (cachedCount === 0) {
      // Cold start: fetch page 1 synchronously so the user gets immediate results,
      // then continue the rest in the background.
      req.log.info(
        { bioguideId, role, source: "congress.gov" },
        "No cached member bills; fetching first page synchronously",
      );
      const { inserted: firstPageCount, totalExpected } =
        await ingestFederalMemberBillsPage(bioguideId, role, 1, req.log);
      sourceTotalCount = totalExpected;

      if (firstPageCount > 0) {
        await db
          .insert(federalMemberBillCacheStatusTable)
          .values({
            bioguideId,
            role,
            congress: currentCongress,
            fullyIngested: firstPageCount >= totalExpected,
            localCount: firstPageCount,
            sourceTotalCount: totalExpected,
            lastFetchedAt: new Date(),
            lastHeadSyncAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [
              federalMemberBillCacheStatusTable.bioguideId,
              federalMemberBillCacheStatusTable.role,
              federalMemberBillCacheStatusTable.congress,
            ],
            set: {
              fullyIngested: firstPageCount >= totalExpected,
              localCount: firstPageCount,
              sourceTotalCount: totalExpected,
              lastFetchedAt: new Date(),
              lastHeadSyncAt: new Date(),
            },
          });
      }

      fullyIngested = firstPageCount >= totalExpected;

      // Background ingestion for remaining pages (fire-and-forget), starting from page 2
      if (firstPageCount < totalExpected) {
        ingestFederalMemberBills(bioguideId, role, req.log, {
          startPage: 2,
        }).catch((err) => {
          req.log?.warn(
            { err, bioguideId, role },
            "Background bill ingestion failed",
          );
        });
      }
    } else {
      if (
        shouldResumeMemberLegislationIngestion({
          cachedCount,
          cacheStatus,
          active: activeBillIngestions.has(`${bioguideId}:${role}`),
        })
      ) {
        // Partial cache exists and no background job is running — resume it.
        req.log.info(
          { bioguideId, role, cachedCount, source: "db" },
          "Partial member bills cache; resuming background ingestion",
        );
        ingestFederalMemberBills(bioguideId, role, req.log).catch((err) => {
          req.log?.warn(
            { err, bioguideId, role },
            "Background bill ingestion failed",
          );
        });
      } else {
        req.log.info(
          { bioguideId, role, cachedCount, source: "db" },
          "Serving member bills from cache",
        );
      }
    }

    const filterConditions = [
      eq(federalMemberLegislationItemsTable.bioguideId, bioguideId),
      eq(federalMemberLegislationItemsTable.role, role),
      ...(categoryCondition ? [categoryCondition] : []),
      ...(searchCondition ? [searchCondition] : []),
    ];

    // Fetch paginated legislation from the classified DB cache
    const rows = await db
      .select({
        itemId: federalMemberLegislationItemsTable.itemId,
        title: federalMemberLegislationItemsTable.title,
        number: federalMemberLegislationItemsTable.number,
        congress: federalMemberLegislationItemsTable.congress,
        introducedDate: federalMemberLegislationItemsTable.introducedDate,
        latestAction: federalMemberLegislationItemsTable.latestAction,
        latestActionDate: federalMemberLegislationItemsTable.latestActionDate,
        policyArea: federalMemberLegislationItemsTable.policyArea,
        url: federalMemberLegislationItemsTable.url,
        category: federalMemberLegislationItemsTable.category,
        type: federalMemberLegislationItemsTable.type,
      })
      .from(federalMemberLegislationItemsTable)
      .where(and(...filterConditions))
      .orderBy(desc(federalMemberLegislationItemsTable.introducedDate))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(federalMemberLegislationItemsTable)
      .where(and(...filterConditions));

    totalCount = Number(totalResult[0]?.count ?? 0);
    bills = rows.map(mapFederalLegislationForResponse);

    // Compute policy area breakdown from whatever we have cached so far
    const policyAreaRows = await db
      .select({
        name: federalMemberLegislationItemsTable.policyArea,
        count: sql<number>`count(*)`,
      })
      .from(federalMemberLegislationItemsTable)
      .where(
        and(
          eq(federalMemberLegislationItemsTable.bioguideId, bioguideId),
          eq(federalMemberLegislationItemsTable.role, role),
          sql`${federalMemberLegislationItemsTable.policyArea} is not null`,
          ...(categoryCondition ? [categoryCondition] : []),
          ...(searchCondition ? [searchCondition] : []),
        ),
      )
      .groupBy(federalMemberLegislationItemsTable.policyArea)
      .orderBy(sql`count(*) desc`);

    const policyAreas = computePolicyAreas(policyAreaRows);
    const categoryCountRows = await db
      .select({
        category: federalMemberLegislationItemsTable.category,
        count: sql<number>`count(*)`,
      })
      .from(federalMemberLegislationItemsTable)
      .where(
        and(
          eq(federalMemberLegislationItemsTable.bioguideId, bioguideId),
          eq(federalMemberLegislationItemsTable.role, role),
          ...(searchCondition ? [searchCondition] : []),
        ),
      )
      .groupBy(federalMemberLegislationItemsTable.category);
    const categoryCounts = Object.fromEntries(
      categoryCountRows.map((row) => [row.category, Number(row.count)]),
    );
    categoryCounts.all = Object.values(categoryCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    return res.json({
      bills,
      totalCount,
      offset,
      policyAreas,
      fullyIngested,
      sourceTotalCount,
      category,
      categoryCounts,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching member bills");
    return sendInternalError(res);
  }
});

router.post("/federal/members/:bioguideId/bills/refresh", async (req, res) => {
  const paramsParsed = GetFederalMemberBillsParams.safeParse(req.params);
  const body = req.body;
  if (!paramsParsed.success)
    return res.status(400).json({ error: "Invalid params" });

  const { bioguideId } = paramsParsed.data;
  const type = body?.type === "cosponsored" ? "cosponsored" : "sponsored";
  const role = type === "sponsored" ? "sponsor" : "cosponsor";

  try {
    req.log.info(
      { bioguideId, role, source: "congress.gov" },
      "Force refreshing member bills from Congress.gov",
    );
    await ingestFederalMemberBills(bioguideId, role, req.log);

    // Fetch first page from DB for immediate response
    const rows = await db
      .select({
        itemId: federalMemberLegislationItemsTable.itemId,
        title: federalMemberLegislationItemsTable.title,
        number: federalMemberLegislationItemsTable.number,
        congress: federalMemberLegislationItemsTable.congress,
        introducedDate: federalMemberLegislationItemsTable.introducedDate,
        latestAction: federalMemberLegislationItemsTable.latestAction,
        latestActionDate: federalMemberLegislationItemsTable.latestActionDate,
        policyArea: federalMemberLegislationItemsTable.policyArea,
        url: federalMemberLegislationItemsTable.url,
        category: federalMemberLegislationItemsTable.category,
        type: federalMemberLegislationItemsTable.type,
      })
      .from(federalMemberLegislationItemsTable)
      .where(
        and(
          eq(federalMemberLegislationItemsTable.bioguideId, bioguideId),
          eq(federalMemberLegislationItemsTable.role, role),
        ),
      )
      .orderBy(desc(federalMemberLegislationItemsTable.introducedDate))
      .limit(20)
      .offset(0);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(federalMemberLegislationItemsTable)
      .where(
        and(
          eq(federalMemberLegislationItemsTable.bioguideId, bioguideId),
          eq(federalMemberLegislationItemsTable.role, role),
        ),
      );

    const totalCount = Number(totalResult[0]?.count ?? 0);

    const policyAreaRows = await db
      .select({
        name: federalMemberLegislationItemsTable.policyArea,
        count: sql<number>`count(*)`,
      })
      .from(federalMemberLegislationItemsTable)
      .where(
        and(
          eq(federalMemberLegislationItemsTable.bioguideId, bioguideId),
          eq(federalMemberLegislationItemsTable.role, role),
          sql`${federalMemberLegislationItemsTable.policyArea} is not null`,
        ),
      )
      .groupBy(federalMemberLegislationItemsTable.policyArea)
      .orderBy(sql`count(*) desc`);

    const policyAreas = computePolicyAreas(policyAreaRows);
    const categoryCountRows = await db
      .select({
        category: federalMemberLegislationItemsTable.category,
        count: sql<number>`count(*)`,
      })
      .from(federalMemberLegislationItemsTable)
      .where(
        and(
          eq(federalMemberLegislationItemsTable.bioguideId, bioguideId),
          eq(federalMemberLegislationItemsTable.role, role),
        ),
      )
      .groupBy(federalMemberLegislationItemsTable.category);
    const categoryCounts = Object.fromEntries(
      categoryCountRows.map((row) => [row.category, Number(row.count)]),
    );
    categoryCounts.all = Object.values(categoryCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    const bills = rows.map(mapFederalLegislationForResponse);
    const statusRows = await db
      .select()
      .from(federalMemberBillCacheStatusTable)
      .where(
        and(
          eq(federalMemberBillCacheStatusTable.bioguideId, bioguideId),
          eq(federalMemberBillCacheStatusTable.role, role),
          eq(federalMemberBillCacheStatusTable.congress, getCurrentCongress()),
        ),
      )
      .limit(1);
    const status = statusRows[0];

    return res.json({
      bills,
      totalCount,
      offset: 0,
      policyAreas,
      fullyIngested: true,
      sourceTotalCount: status?.sourceTotalCount ?? totalCount,
      category: "all",
      categoryCounts,
      refreshed: true,
    });
  } catch (err) {
    req.log.error({ err }, "Error refreshing member bills");
    return sendInternalError(res);
  }
});

function parseClerkVoteXml(xml: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
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
  const data = (await res.json()) as any;
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
              eq(houseVotesTable.rollCallNumber, vote.rollCallNumber),
            ),
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

          await db.transaction(async (tx) => {
            const [inserted] = await tx
              .insert(houseVotesTable)
              .values({
                congress: vote.congress,
                session: vote.sessionNumber,
                rollCallNumber: vote.rollCallNumber,
                year: new Date(vote.startDate).getFullYear(),
                voteDate: vote.startDate
                  ? new Date(vote.startDate).toISOString().split("T")[0]
                  : null,
                legislationType: vote.legislationType ?? null,
                legislationNumber: vote.legislationNumber ?? null,
                voteQuestion: parsed.metadata.voteQuestion ?? null,
                voteResult: parsed.metadata.voteResult ?? null,
                voteDescription: parsed.metadata.voteDescription ?? null,
                sourceDataUrl: xmlUrl,
              })
              .returning({ id: houseVotesTable.id });

            if (inserted && parsed.memberVotes.length > 0) {
              await tx.insert(houseVoteRecordsTable).values(
                parsed.memberVotes.map((m: any) => ({
                  voteId: inserted.id,
                  bioguideId: m.bioguideId,
                  memberName: m.name,
                  party: m.party ?? null,
                  state: m.state ?? null,
                  voteCast: normalizeVoteCast(m.voteCast),
                })),
              );
            }
          });
        } catch {
          // Ignore individual vote fetch/parse failures
        }
      }),
    );
  }
}

router.get("/federal/members/:bioguideId/house-votes", async (req, res) => {
  const paramsParsed = GetFederalMemberHouseVotesParams.safeParse(req.params);
  const queryParsed = GetFederalMemberHouseVotesQueryParams.safeParse(
    req.query,
  );
  if (!paramsParsed.success || !queryParsed.success)
    return res.status(400).json({ error: "Invalid params" });

  const { bioguideId } = paramsParsed.data;
  const { offset, limit, filter, q } = queryParsed.data;

  try {
    // Determine current congress/session for discovery
    const currentYear = new Date().getFullYear();
    const currentCongress = Math.floor((currentYear - 1789) / 2) + 1;
    const currentSession = currentYear % 2 === 1 ? 1 : 2;

    // Build text search condition
    const searchPattern = q ? `%${q}%` : undefined;
    const buildSearchCondition = () => {
      if (!searchPattern) return undefined;
      return or(
        sql`${houseVotesTable.voteQuestion} ILIKE ${searchPattern}`,
        sql`${houseVotesTable.voteDescription} ILIKE ${searchPattern}`,
        sql`${houseVotesTable.legislationType} ILIKE ${searchPattern}`,
        sql`${houseVotesTable.legislationNumber} ILIKE ${searchPattern}`,
      );
    };
    const searchCondition = buildSearchCondition();

    // Check how many total votes exist for this member
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(houseVoteRecordsTable)
      .innerJoin(
        houseVotesTable,
        eq(houseVoteRecordsTable.voteId, houseVotesTable.id),
      )
      .where(
        and(
          eq(houseVoteRecordsTable.bioguideId, bioguideId),
          ...(searchCondition ? [searchCondition] : []),
        ),
      );

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
    const filterConditions: any[] = [
      eq(houseVoteRecordsTable.bioguideId, bioguideId),
    ];
    if (filter === "yea")
      filterConditions.push(eq(houseVoteRecordsTable.voteCast, "Yea"));
    if (filter === "nay")
      filterConditions.push(eq(houseVoteRecordsTable.voteCast, "Nay"));
    if (filter === "present")
      filterConditions.push(eq(houseVoteRecordsTable.voteCast, "Present"));
    if (filter === "not-voting")
      filterConditions.push(eq(houseVoteRecordsTable.voteCast, "Not Voting"));
    if (searchCondition) filterConditions.push(searchCondition);

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
      .innerJoin(
        houseVotesTable,
        eq(houseVoteRecordsTable.voteId, houseVotesTable.id),
      )
      .where(and(...filterConditions))
      .orderBy(desc(houseVotesTable.voteDate))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(houseVoteRecordsTable)
      .innerJoin(
        houseVotesTable,
        eq(houseVoteRecordsTable.voteId, houseVotesTable.id),
      )
      .where(and(...filterConditions));

    const totalCount = Number(totalCountResult[0]?.count ?? 0);

    const normalizedVotes = votes.map((v) => ({
      ...v,
      voteCast: normalizeVoteCast(v.voteCast),
    }));

    return res.json({ votes: normalizedVotes, totalCount, offset });
  } catch (err) {
    req.log.error({ err }, "Error fetching house votes");
    return sendInternalError(res);
  }
});

async function resolveLisMemberId(bioguideId: string): Promise<string | null> {
  logger.info({ bioguideId }, "Resolving LIS member ID");
  const mapped = await db
    .select({ lisMemberId: senatorIdentitiesTable.lisMemberId })
    .from(senatorIdentitiesTable)
    .where(eq(senatorIdentitiesTable.bioguideId, bioguideId))
    .limit(1);
  if (mapped.length > 0) {
    logger.info({ bioguideId, lisMemberId: mapped[0].lisMemberId }, "Found LIS mapping in cache");
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
    if (name && state) {
      const lastName = name.split(" ").pop() ?? "";
      logger.info({ bioguideId, name, state, lastName }, "Searching vote positions for LIS mapping");
      const match = await db
        .selectDistinct({ lisMemberId: senatorVotePositionsTable.lisMemberId })
        .from(senatorVotePositionsTable)
        .where(
          and(
            eq(senatorVotePositionsTable.state, state),
            sql`${senatorVotePositionsTable.senatorName} ILIKE ${"%" + lastName + "%"}`,
          ),
        )
        .limit(1);
      if (match.length > 0) {
        await db
          .insert(senatorIdentitiesTable)
          .values({
            bioguideId,
            lisMemberId: match[0].lisMemberId,
            name,
            state: latestTerm.stateCode ?? m.state,
            party: m.partyHistory?.[0]?.partyAbbreviation,
          })
          .onConflictDoNothing();
        logger.info({ bioguideId, lisMemberId: match[0].lisMemberId }, "Stored LIS mapping");
        return match[0].lisMemberId;
      }
    }
  } catch (err) {
    logger.warn({ err, bioguideId }, "Error resolving LIS member ID");
  }
  logger.info({ bioguideId }, "No LIS mapping found");
  return null;
}

async function discoverSenateVotes(
  congress: number,
  session: number,
): Promise<number[]> {
  const url = `https://www.senate.gov/legislative/LIS/roll_call_lists/vote_menu_${congress}_${session}.htm`;
  logger.info({ url, congress, session }, "Discovering senate votes");
  const res = await fetch(url, { headers: { "User-Agent": "CivicHub/1.0" } });
  if (!res.ok) {
    logger.warn({ status: res.status, url }, "Failed to discover senate votes");
    return [];
  }
  const html = await res.text();

  const matches = html.matchAll(/vote_\d+_\d+_(\d{5})\.htm/g);
  const numbers = new Set<number>();
  for (const m of matches) {
    numbers.add(parseInt(m[1], 10));
  }
  const result = Array.from(numbers).sort((a, b) => b - a);
  logger.info({ count: result.length, congress, session }, "Discovered senate roll calls");
  return result;
}

function buildSenateVoteXmlUrl(
  congress: number,
  session: number,
  rollCall: number,
): string {
  const padded = String(rollCall).padStart(5, "0");
  return `https://www.senate.gov/legislative/LIS/roll_call_votes/vote${congress}${session}/vote_${congress}_${session}_${padded}.xml`;
}

function parseSenateVoteXml(xml: string): {
  metadata: any;
  memberVotes: Array<{
    lisMemberId: string;
    name: string;
    state: string;
    party: string;
    voteCast: string;
  }>;
} {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
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
      voteDate: vote.vote_date
        ? new Date(vote.vote_date).toISOString().split("T")[0]
        : null,
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
  logger.info({ congress, session }, "Starting senate vote ingestion");
  const rollCalls = await discoverSenateVotes(congress, session);
  logger.info({ count: rollCalls.length, congress, session }, "Processing senate roll calls");

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
              eq(senateRollCallVotesTable.rollCallNumber, rollCall),
            ),
          )
          .limit(1);
        if (existing.length > 0) return;

        try {
          const xmlUrl = buildSenateVoteXmlUrl(congress, session, rollCall);
          const res = await fetch(xmlUrl, {
            headers: { "User-Agent": "CivicHub/1.0" },
          });
          if (!res.ok) return;
          const xml = await res.text();
          const parsed = parseSenateVoteXml(xml);

          await db.transaction(async (tx) => {
            const [inserted] = await tx
              .insert(senateRollCallVotesTable)
              .values({
                ...parsed.metadata,
                sourceXmlUrl: xmlUrl,
                sourceHtmlUrl: xmlUrl.replace(".xml", ".htm"),
              })
              .returning({ id: senateRollCallVotesTable.id });

            if (inserted && parsed.memberVotes.length > 0) {
              await tx.insert(senatorVotePositionsTable).values(
                parsed.memberVotes.map((m) => ({
                  voteId: inserted.id,
                  lisMemberId: m.lisMemberId,
                  senatorName: m.name,
                  state: m.state ?? null,
                  party: m.party ?? null,
                  voteCast: normalizeVoteCast(m.voteCast),
                  bioguideId: null,
                })),
              );
              ingestedCount++;
              logger?.info(
                { rollCall, members: parsed.memberVotes.length, congress, session },
                "Ingested senate roll call",
              );
            }
          });
        } catch (err) {
          logger.warn({ err, rollCall, congress, session }, "Failed to ingest senate roll call");
        }
      }),
    );
  }
  logger.info({ ingestedCount, congress, session }, "Senate vote ingestion complete");
}

router.get("/federal/members/:bioguideId/senate-votes", async (req, res) => {
  req.log.info({ bioguideId: req.params.bioguideId, query: req.query }, "GET /federal/members/:bioguideId/senate-votes");
  const paramsParsed = GetFederalMemberSenateVotesParams.safeParse(req.params);
  const queryParsed = GetFederalMemberSenateVotesQueryParams.safeParse(
    req.query,
  );
  if (!paramsParsed.success || !queryParsed.success) {
    return res.status(400).json({ error: "Invalid params" });
  }

  const { bioguideId } = paramsParsed.data;
  const { offset, limit, filter, q } = queryParsed.data;

  try {
    const currentYear = new Date().getFullYear();
    const currentCongress = Math.floor((currentYear - 1789) / 2) + 1;
    const currentSession = currentYear % 2 === 1 ? 1 : 2;

    // Build text search condition
    const searchPattern = q ? `%${q}%` : undefined;
    const buildSearchCondition = () => {
      if (!searchPattern) return undefined;
      return or(
        sql`${senateRollCallVotesTable.voteQuestion} ILIKE ${searchPattern}`,
        sql`${senateRollCallVotesTable.voteTitle} ILIKE ${searchPattern}`,
        sql`${senateRollCallVotesTable.documentType} ILIKE ${searchPattern}`,
        sql`${senateRollCallVotesTable.documentNumber} ILIKE ${searchPattern}`,
      );
    };
    const searchCondition = buildSearchCondition();

    const lisMemberId = await resolveLisMemberId(bioguideId);
    req.log.info({ bioguideId, lisMemberId }, "Resolved LIS member ID for senate votes");

    const baseConditions: any[] = lisMemberId
      ? [eq(senatorVotePositionsTable.lisMemberId, lisMemberId)]
      : [];

    if (baseConditions.length === 0) {
      req.log.info({ bioguideId }, "No LIS mapping found, triggering senate vote ingestion");
      await ingestSenateVotes(currentCongress, currentSession);
      if (currentSession === 2) await ingestSenateVotes(currentCongress, 1);
      // Retry now that vote records exist for name matching
      const retryLisId = await resolveLisMemberId(bioguideId);
      req.log.info({ bioguideId, retryLisId }, "Retry resolved LIS member ID after ingestion");
      if (!retryLisId) {
        req.log.warn({ bioguideId }, "No LIS mapping after ingestion, returning empty votes");
        return res.json({ votes: [], totalCount: 0, offset });
      }
      baseConditions.push(
        eq(senatorVotePositionsTable.lisMemberId, retryLisId),
      );
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(senatorVotePositionsTable)
      .innerJoin(
        senateRollCallVotesTable,
        eq(senatorVotePositionsTable.voteId, senateRollCallVotesTable.id),
      )
      .where(
        and(...baseConditions, ...(searchCondition ? [searchCondition] : [])),
      );

    const totalInDb = Number(countResult[0]?.count ?? 0);
    req.log.info({ bioguideId, totalInDb }, "Total senate votes in DB for member");

    if (totalInDb < offset + limit) {
      req.log.info({ bioguideId, totalInDb, offset, limit }, "Not enough votes in DB, triggering more ingestion");
      await ingestSenateVotes(currentCongress, currentSession);
      if (currentSession === 2) await ingestSenateVotes(currentCongress, 1);
    }

    const filterConditions = [...baseConditions];
    if (filter === "yea")
      filterConditions.push(eq(senatorVotePositionsTable.voteCast, "Yea"));
    if (filter === "nay")
      filterConditions.push(eq(senatorVotePositionsTable.voteCast, "Nay"));
    if (filter === "present")
      filterConditions.push(eq(senatorVotePositionsTable.voteCast, "Present"));
    if (filter === "not-voting")
      filterConditions.push(
        inArray(senatorVotePositionsTable.voteCast, ["Not Voting", "Absent"]),
      );
    if (searchCondition) filterConditions.push(searchCondition);

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
      .innerJoin(
        senateRollCallVotesTable,
        eq(senatorVotePositionsTable.voteId, senateRollCallVotesTable.id),
      )
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
      .innerJoin(
        senateRollCallVotesTable,
        eq(senatorVotePositionsTable.voteId, senateRollCallVotesTable.id),
      )
      .where(and(...filterConditions));

    const totalCount = Number(totalCountResult[0]?.count ?? 0);
    console.log(
      "[senate-votes] returning",
      normalized.length,
      "votes, totalCount:",
      totalCount,
    );

    return res.json({
      votes: normalized,
      totalCount,
      offset,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching senate votes");
    return sendInternalError(res);
  }
});

router.get("/federal/members/:bioguideId/committees", async (req, res) => {
  const parsed = GetFederalMemberCommitteesParams.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid params" });

  const { bioguideId } = parsed.data;

  try {
    // Option A: serve from DB cache (member profile only — no committee rosters)
    const cachedRows = await db
      .select({
        name: federalCommitteesTable.name,
        chamber: federalCommitteesTable.chamber,
        committeeCode: federalCommitteesTable.id,
      })
      .from(federalMemberCommitteesTable)
      .innerJoin(
        federalCommitteesTable,
        eq(federalMemberCommitteesTable.committeeId, federalCommitteesTable.id),
      )
      .where(eq(federalMemberCommitteesTable.bioguideId, bioguideId));

    if (cachedRows.length > 0) {
      req.log.info(
        { bioguideId, source: "db" },
        "Serving member committees from cache",
      );
      return res.json({
        committees: cachedRows.map((r) => ({
          name: r.name,
          chamber: r.chamber ?? undefined,
          committeeCode: r.committeeCode,
        })),
      });
    }

    // Check if we already fetched committees and found none (prevents repeated XML fetches)
    const memberRows = await db
      .select()
      .from(federalMembersTable)
      .where(eq(federalMembersTable.bioguideId, bioguideId))
      .limit(1);
    if (memberRows[0]?.committeeFetchedAt) {
      req.log.info(
        { bioguideId, source: "db" },
        "Committee data already fetched; no assignments found",
      );
      return res.json({ committees: [] });
    }

    // Cache miss: fetch from official XML sources
    req.log.info(
      { bioguideId, source: "house_clerk|senate" },
      "Cache miss; fetching member committees from official XML",
    );

    const chamber = memberRows[0]?.chamber?.toLowerCase() ?? "";
    let committees: Array<{
      name: string;
      chamber?: string;
      committeeCode: string;
    }> = [];

    if (chamber.includes("house")) {
      const houseMap = await fetchHouseCommitteesFromClerkXml();
      const codes = houseMap.get(bioguideId) ?? [];
      committees = codes.map((code) => ({
        name: HOUSE_COMMITTEE_NAMES[code] ?? `Committee ${code}`,
        chamber: memberRows[0]?.chamber ?? undefined,
        committeeCode: code,
      }));
    } else if (chamber.includes("senate")) {
      const senateAssignments = await fetchSenateCommitteesFromXml(bioguideId);
      committees = senateAssignments.map((a) => ({
        name: a.name,
        chamber: memberRows[0]?.chamber ?? undefined,
        committeeCode: a.code,
      }));
    }

    // Cache the results
    for (const c of committees) {
      await db
        .insert(federalCommitteesTable)
        .values({
          id: c.committeeCode,
          name: c.name,
          chamber: c.chamber ?? null,
          fetchedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: federalCommitteesTable.id,
          set: {
            name: c.name,
            chamber: c.chamber ?? null,
            fetchedAt: new Date(),
          },
        });
      await db
        .insert(federalMemberCommitteesTable)
        .values({
          bioguideId,
          committeeId: c.committeeCode,
          fetchedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [
            federalMemberCommitteesTable.bioguideId,
            federalMemberCommitteesTable.committeeId,
          ],
          set: { fetchedAt: new Date() },
        });
    }

    // Mark that we've checked committees (even if empty, to prevent repeated fetches)
    await db
      .update(federalMembersTable)
      .set({ committeeFetchedAt: new Date() })
      .where(eq(federalMembersTable.bioguideId, bioguideId));

    // NOTE: Option B (full committee rosters with all members) is not implemented.
    // The current endpoint returns this member's assignments only. To add member
    // rosters, fetch committee member lists from official sources, cache in a
    // `federal_committee_members` table, and join here. That would require
    // storing rank/role per member and keeping rosters fresh when membership
    // changes.

    return res.json({ committees });
  } catch (err) {
    req.log.error({ err }, "Error fetching member committees");
    return sendInternalError(res);
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

    const params: Record<string, string | number> = {
      offset,
      limit,
      sort: "introducedDate desc",
    };
    if (chamber && chamber !== "both") {
      params.chamber = chamber.charAt(0).toUpperCase() + chamber.slice(1);
    }

    const data = await congressFetch(
      `/bill/${currentCongress}`,
      params,
      req.log,
    );
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
      subjects:
        b.subjects?.item ??
        (Array.isArray(b.subjects) ? b.subjects : undefined),
    }));

    // Ensure most current first by latest action date
    bills.sort((a: any, b: any) => {
      const dateA = a.latestActionDate
        ? new Date(a.latestActionDate).getTime()
        : 0;
      const dateB = b.latestActionDate
        ? new Date(b.latestActionDate).getTime()
        : 0;
      return dateB - dateA;
    });

    req.log.info(
      { count: bills.length, source: "congress.gov" },
      "Fetched federal bills from Congress.gov",
    );

    // Upsert into cache for search
    for (const bill of bills) {
      const subjectsText = Array.isArray(bill.subjects)
        ? bill.subjects.join(" ")
        : "";
      await db
        .insert(federalBillsTable)
        .values({
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
        })
        .onConflictDoUpdate({
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
    return sendInternalError(res);
  }
});

router.get("/federal/bills/search", async (req, res) => {
  const parsed = SearchFederalBillsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }
  const { q, limit: rawLimit, offset } = parsed.data;
  const limit = Math.min(rawLimit, 100);

  try {
    req.log.info({ q, source: "db" }, "Searching federal bills from DB cache");
    const searchQuery = sql`websearch_to_tsquery('english', ${q})`;
    const conditions = [
      sql`${federalBillsTable.searchVector} @@ ${searchQuery}`,
    ];

    const rows = await db
      .select()
      .from(federalBillsTable)
      .where(and(...conditions))
      .orderBy(
        sql`ts_rank(${federalBillsTable.searchVector}, ${searchQuery}) desc`,
      )
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
    return sendInternalError(res);
  }
});

router.get(
  "/federal/bills/:congress/:billType/:billNumber",
  async (req, res) => {
    const parsed = GetFederalBillDetailParams.safeParse(req.params);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid params" });

    const { congress, billType, billNumber } = parsed.data;

    try {
      const [
        billData,
        cosponsorsData,
        committeesData,
        actionsData,
        summaryData,
        textData,
      ] = await Promise.allSettled([
        congressFetch(
          `/bill/${congress}/${billType}/${billNumber}`,
          {},
          req.log,
        ),
        congressFetch(
          `/bill/${congress}/${billType}/${billNumber}/cosponsors`,
          { limit: 50 },
          req.log,
        ),
        congressFetch(
          `/bill/${congress}/${billType}/${billNumber}/committees`,
          {},
          req.log,
        ),
        congressFetch(
          `/bill/${congress}/${billType}/${billNumber}/actions`,
          { limit: 250 },
          req.log,
        ),
        congressFetch(
          `/bill/${congress}/${billType}/${billNumber}/summaries`,
          {},
          req.log,
        ),
        congressFetch(
          `/bill/${congress}/${billType}/${billNumber}/text`,
          {},
          req.log,
        ),
      ]);

      const bill =
        billData.status === "fulfilled" ? (billData.value.bill ?? {}) : {};
      const cosponsors =
        cosponsorsData.status === "fulfilled"
          ? (cosponsorsData.value.cosponsors?.item ?? []).map((c: any) => ({
              name: c.fullName ?? c.name ?? "",
              party: c.party,
              state: c.state,
              bioguideId: c.bioguideId,
            }))
          : [];

      const committees =
        committeesData.status === "fulfilled"
          ? (committeesData.value.committees?.item ?? []).map((c: any) => ({
              name: c.name ?? "",
              chamber: c.chamber,
              committeeCode: c.systemCode,
            }))
          : [];

      const actions =
        actionsData.status === "fulfilled"
          ? (actionsData.value.actions?.item ?? []).map((a: any) => ({
              date: a.actionDate ?? "",
              text: a.text ?? "",
              type: a.type,
            }))
          : [];
      const progress = computeFederalBillProgress({
        congress,
        latestAction: bill.latestAction?.text,
        laws: bill.laws,
        actions,
      });

      const summary =
        summaryData.status === "fulfilled"
          ? (summaryData.value.summaries?.item?.[0]?.text ?? undefined)
          : undefined;

      const textVersions =
        textData.status === "fulfilled"
          ? (textData.value.textVersions ?? [])
          : [];
      const latestText = textVersions[0];
      const textUrl =
        latestText?.formats?.find((f: any) => f.type === "PDF")?.url ??
        latestText?.formats?.[0]?.url ??
        undefined;

      req.log.info(
        {
          billId: `${congress}-${billType}-${billNumber}`,
          source: "congress.gov",
        },
        "Fetched federal bill detail from Congress.gov",
      );

      // Normalize subjects from Congress.gov nested structure (may be { item: [...] })
      const billSubjects =
        bill.subjects?.item ??
        (Array.isArray(bill.subjects) ? bill.subjects : []);
      const subjectsText = billSubjects.join(" ");
      await db
        .insert(federalBillsTable)
        .values({
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
        })
        .onConflictDoUpdate({
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
        sponsors:
          bill.sponsors?.map((s: any) => ({
            name: s.fullName ?? s.name ?? "",
            party: s.party,
            state: s.state,
            bioguideId: s.bioguideId,
          })) ?? [],
        cosponsors,
        committees,
        actions,
        progress,
        url: bill.url,
        textUrl,
        policyArea: bill.policyArea?.name ?? undefined,
        subjects: undefined,
      });
    } catch (err) {
      req.log.error({ err }, "Error fetching bill detail");
      return sendInternalError(res);
    }
  },
);

export default router;
