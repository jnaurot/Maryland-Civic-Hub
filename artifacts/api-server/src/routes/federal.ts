import { Router } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { XMLParser } from "fast-xml-parser";
import { db } from "@workspace/db";
import { houseVotesTable, houseVoteRecordsTable } from "@workspace/db";
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
} from "@workspace/api-zod";

const router = Router();

const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
const BASE = "https://api.congress.gov/v3";

async function congressFetch(path: string, params: Record<string, string | number> = {}) {
  if (!CONGRESS_API_KEY) throw new Error("CONGRESS_API_KEY not configured");
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", CONGRESS_API_KEY);
  url.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
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

function getLastName(name: string): string {
  // Congress.gov raw format is "Last, First"; after formatting it's "First Last"
  if (name.includes(", ")) {
    return name.split(", ")[0]?.trim().toLowerCase() ?? "";
  }
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1]?.toLowerCase() ?? "";
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
      .filter((m: any) => m.terms?.item?.some((t: any) => !t.endYear))
      .map((m: any) => {
        const latestTerm = m.terms?.item?.slice(-1)[0];
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

  try {
    const data = await congressFetch(`/member/${parsed.data.bioguideId}`);
    const m = data.member ?? {};
    return res.json({
      bioguideId: m.bioguideId ?? parsed.data.bioguideId,
      name: m.directOrderName ?? m.invertedOrderName ?? "",
      party: m.partyHistory?.[0]?.partyName,
      state: m.state,
      chamber: m.terms?.item?.[0]?.chamber ?? m.currentMember ? (m.terms?.item?.[0]?.chamber) : undefined,
      district: m.district != null ? String(m.district) : undefined,
      phone: m.officeAddress,
      website: m.officialWebsiteUrl,
      photoUrl: m.depiction?.imageUrl,
      terms: m.terms?.item?.length,
      inOffice: m.currentMember,
      nextElection: m.nextElection,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching federal member");
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/federal/members/:bioguideId/bills", async (req, res) => {
  const paramsParsed = GetFederalMemberBillsParams.safeParse(req.params);
  const queryParsed = GetFederalMemberBillsQueryParams.safeParse(req.query);
  if (!paramsParsed.success || !queryParsed.success) return res.status(400).json({ error: "Invalid params" });

  const { bioguideId } = paramsParsed.data;
  const { type, offset, limit } = queryParsed.data;

  try {
    const endpoint = type === "sponsored" ? "sponsored-legislation" : "cosponsored-legislation";
    const data = await congressFetch(`/member/${bioguideId}/${endpoint}`, { offset, limit });
    const key = type === "sponsored" ? "sponsoredLegislation" : "cosponsoredLegislation";
    const allItems: any[] = data[key] ?? data.bills ?? [];
    // Filter out amendments (they have amendmentNumber and null type)
    const billItems = allItems.filter((b: any) => b.type !== null && b.type !== undefined);
    const bills = billItems.map((b: any) => ({
      id: b.number ? `${b.congress}-${b.type?.toLowerCase()}-${b.number}` : String(Math.random()),
      title: b.title ?? b.officialTitle ?? "Untitled",
      number: b.number ?? b.billNumber,
      congress: String(b.congress),
      introducedDate: b.introducedDate,
      latestAction: b.latestAction?.text,
      latestActionDate: b.latestAction?.actionDate,
      sponsors: b.sponsors?.map((s: any) => s.fullName ?? s.name) ?? [],
      url: b.url,
      status: b.latestAction?.text,
      chamber: b.originChamber,
    }));

    // Sort by latest action date descending
    bills.sort((a: any, b: any) => {
      const dateA = a.latestActionDate ? new Date(a.latestActionDate).getTime() : 0;
      const dateB = b.latestActionDate ? new Date(b.latestActionDate).getTime() : 0;
      return dateB - dateA;
    });

    return res.json({
      bills,
      totalCount: data.pagination?.count,
      offset,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching member bills");
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
    voteCast: rv.vote,
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
                voteCast: m.voteCast,
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

    return res.json({ votes, totalCount, offset });
  } catch (err) {
    req.log.error({ err }, "Error fetching house votes");
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/federal/members/:bioguideId/committees", async (req, res) => {
  const parsed = GetFederalMemberCommitteesParams.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid params" });

  try {
    const data = await congressFetch(`/member/${parsed.data.bioguideId}`);
    const memberData = data.member ?? {};
    const committeeAssignments = memberData.terms?.item ?? [];

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
            const membersData = await congressFetch(`/committee/${chamber}/${c.committeeCode}/members`, { limit: 20 });
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

    const data = await congressFetch(`/bill/${currentCongress}`, params);
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
    }));

    // Ensure most current first by latest action date
    bills.sort((a: any, b: any) => {
      const dateA = a.latestActionDate ? new Date(a.latestActionDate).getTime() : 0;
      const dateB = b.latestActionDate ? new Date(b.latestActionDate).getTime() : 0;
      return dateB - dateA;
    });

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
    const [billData, cosponsorsData, committeesData, actionsData, summaryData] = await Promise.allSettled([
      congressFetch(`/bill/${congress}/${billType}/${billNumber}`),
      congressFetch(`/bill/${congress}/${billType}/${billNumber}/cosponsors`, { limit: 50 }),
      congressFetch(`/bill/${congress}/${billType}/${billNumber}/committees`),
      congressFetch(`/bill/${congress}/${billType}/${billNumber}/actions`, { limit: 20 }),
      congressFetch(`/bill/${congress}/${billType}/${billNumber}/summaries`),
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
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching bill detail");
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
