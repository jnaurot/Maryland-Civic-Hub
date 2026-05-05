import { Router } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db, normalizeVoteCast, normalizeStateVotePosition, stateVoteRecordsTable } from "@workspace/db";
import {
  GetStateMemberBillsQueryParams,
  GetStateMemberVotesQueryParams,
  GetStateBillsQueryParams,
} from "@workspace/api-zod";
import { getStateLegislator, refreshStateLegislator, isRateLimited, recordRateLimit } from "../lib/stateLegislatorCache";

async function checkRateLimited() {
  if (await isRateLimited()) {
    throw new Error("OpenStates rate limit active. Please try again later.");
  }
}

const router = Router();

const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY;
const BASE = "https://v3.openstates.org";

async function openStatesFetch(path: string, params: Record<string, string | number> = {}) {
  if (!OPENSTATES_API_KEY) throw new Error("OPENSTATES_API_KEY not configured");
  await checkRateLimited();
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: { "X-API-KEY": OPENSTATES_API_KEY },
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429 || (res.status === 403 && text.toLowerCase().includes("rate"))) {
      await recordRateLimit(res.status, text);
    }
    throw new Error(`OpenStates API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<any>;
}

function mapStateBill(b: any) {
  const latestAction = b.actions?.[b.actions.length - 1];
  return {
    id: b.id ?? "",
    identifier: b.identifier,
    title: b.title ?? "Untitled",
    session: b.legislative_session,
    chamber: b.from_organization?.classification,
    status: b.status ?? latestAction?.description,
    introducedDate: b.first_action_date ?? b.created_at?.split("T")[0],
    latestAction: latestAction?.description,
    latestActionDate: latestAction?.date,
    sponsors: b.sponsorships?.map((s: any) => s.name ?? "") ?? [],
    url: b.openstates_url,
    subjects: Array.isArray(b.subject) ? b.subject : (b.subject ? [b.subject] : undefined),
  };
}

// State member IDs are "ocd-person/<uuid>". The frontend URL-encodes them
// so Express sees a single param like "ocd-person%2F<uuid>". We decode it here.
router.get("/state/members/:memberId", async (req, res) => {
  const memberId = decodeURIComponent(req.params.memberId);
  if (!memberId) return res.status(400).json({ error: "memberId required" });

  try {
    const result = await getStateLegislator(memberId, req.log);
    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching state member");
    return res.status(500).json({ error: String(err) });
  }
});

router.post("/state/members/:memberId/refresh", async (req, res) => {
  const memberId = decodeURIComponent(req.params.memberId);
  if (!memberId) return res.status(400).json({ error: "memberId required" });

  try {
    const result = await refreshStateLegislator(memberId, req.log);
    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error refreshing state member");
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/state/members/:memberId/bills", async (req, res) => {
  const memberId = decodeURIComponent(req.params.memberId);
  const queryParsed = GetStateMemberBillsQueryParams.safeParse(req.query);
  if (!memberId || !queryParsed.success) return res.status(400).json({ error: "Invalid params" });

  try {
    const { jurisdiction, offset, limit } = queryParsed.data;
    const page = Math.floor(offset / limit) + 1;
    const data = await openStatesFetch("/bills", {
      jurisdiction,
      per_page: limit,
      page,
      sponsor_id: memberId,
    });
    const bills = (data.results ?? []).map(mapStateBill);
    return res.json({ bills, totalCount: data.pagination?.total_items, offset });
  } catch (err) {
    req.log.error({ err }, "Error fetching state member bills");
    return res.status(500).json({ error: String(err) });
  }
});

async function ingestStateVotesForMember({
  jurisdiction,
  memberId,
  maxPages = 10,
}: {
  jurisdiction: string;
  memberId: string;
  maxPages?: number;
}) {
  let inserted = 0;
  let scannedBills = 0;

  for (let page = 1; page <= maxPages; page++) {
    const data = await openStatesFetch("/bills", {
      jurisdiction,
      page,
      per_page: 20,
      sponsor_id: memberId,
      include: "votes",
    });

    const bills = data.results ?? [];
    if (bills.length === 0) break;

    for (const bill of bills) {
      scannedBills++;

      for (const voteEvent of bill.votes ?? []) {
        const individualVotes: any[] = voteEvent.votes ?? [];

        for (const vote of individualVotes) {
          const personId = vote.voter?.id ?? vote.voter_id ?? vote.legislator_id;
          const personName = vote.voter_name ?? vote.name;

          if (personId !== memberId && personName !== "Mr. President") {
            continue;
          }

          const position = normalizeStateVotePosition(vote.option ?? vote.vote ?? vote.position);

          await db
            .insert(stateVoteRecordsTable)
            .values({
              jurisdiction,
              legislatorId: memberId,
              legislatorName: personName ?? null,
              voteEventId: String(voteEvent.id ?? `${bill.id}-${voteEvent.start_date}`),
              billId: bill.id,
              billIdentifier: bill.identifier ?? null,
              billTitle: bill.title ?? null,
              chamber: voteEvent.chamber ?? bill.from_organization?.classification ?? null,
              motionText: voteEvent.motion_text ?? null,
              result: voteEvent.result ?? null,
              position,
              votedAt: voteEvent.start_date ? new Date(voteEvent.start_date) : (voteEvent.date ? new Date(voteEvent.date) : null),
              sourceUrl: bill.openstates_url ?? null,
              raw: { bill, voteEvent, vote },
            })
            .onConflictDoUpdate({
              target: [
                stateVoteRecordsTable.jurisdiction,
                stateVoteRecordsTable.legislatorId,
                stateVoteRecordsTable.voteEventId,
              ],
              set: {
                position,
                billTitle: bill.title ?? null,
                result: voteEvent.result ?? null,
                fetchedAt: new Date(),
                raw: { bill, voteEvent, vote },
              },
            });

          inserted++;
        }
      }
    }

    if (!data.pagination?.next_page) break;
  }

  return { inserted, scannedBills };
}

router.get("/state/members/:memberId/votes", async (req, res) => {
  const memberId = decodeURIComponent(req.params.memberId);
  const queryParsed = GetStateMemberVotesQueryParams.safeParse(req.query);
  if (!memberId || !queryParsed.success) return res.status(400).json({ error: "Invalid params" });

  try {
    const { jurisdiction, offset, limit, filter } = queryParsed.data;

    // Check if we have any persisted vote records for this member
    const existing = await db
      .select({ count: sql<number>`count(*)` })
      .from(stateVoteRecordsTable)
      .where(
        and(
          eq(stateVoteRecordsTable.jurisdiction, jurisdiction),
          eq(stateVoteRecordsTable.legislatorId, memberId)
        )
      );

    if (Number(existing[0]?.count ?? 0) === 0) {
      req.log.info({ memberId, jurisdiction }, "No state vote records in DB; triggering ingestion");
      const { inserted, scannedBills } = await ingestStateVotesForMember({ jurisdiction, memberId });
      req.log.info({ memberId, jurisdiction, inserted, scannedBills }, "State vote ingestion complete");
    }

    // Build filter conditions
    const baseConditions = [
      eq(stateVoteRecordsTable.jurisdiction, jurisdiction),
      eq(stateVoteRecordsTable.legislatorId, memberId),
    ];

    if (filter === "yea") baseConditions.push(eq(stateVoteRecordsTable.position, "Yea"));
    else if (filter === "nay") baseConditions.push(eq(stateVoteRecordsTable.position, "Nay"));
    else if (filter === "present") baseConditions.push(eq(stateVoteRecordsTable.position, "Present"));
    else if (filter === "not-voting") baseConditions.push(eq(stateVoteRecordsTable.position, "Not Voting"));

    // Fetch paginated votes
    const rows = await db
      .select({
        billId: stateVoteRecordsTable.billId,
        billTitle: stateVoteRecordsTable.billTitle,
        billIdentifier: stateVoteRecordsTable.billIdentifier,
        date: stateVoteRecordsTable.votedAt,
        position: stateVoteRecordsTable.position,
        result: stateVoteRecordsTable.result,
      })
      .from(stateVoteRecordsTable)
      .where(and(...baseConditions))
      .orderBy(desc(stateVoteRecordsTable.votedAt))
      .limit(limit)
      .offset(offset);

    // Count total for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(stateVoteRecordsTable)
      .where(and(...baseConditions));

    const totalCount = Number(countResult[0]?.count ?? 0);

    const votes = rows.map((r) => ({
      billId: r.billId,
      billTitle: r.billTitle ?? "Untitled",
      billIdentifier: r.billIdentifier ?? undefined,
      date: r.date ? new Date(r.date).toISOString().split("T")[0] : "",
      position: r.position,
      result: r.result ?? undefined,
    }));

    return res.json({ votes, totalCount, offset });
  } catch (err) {
    req.log.error({ err }, "Error fetching state member votes");
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/state/bills", async (req, res) => {
  const parsed = GetStateBillsQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid params" });

  const { chamber, offset, limit, jurisdiction } = parsed.data;

  try {
    const params: Record<string, string | number> = {
      jurisdiction,
      per_page: limit,
      page: Math.floor(offset / limit) + 1,
    };
    if (chamber) params.chamber = chamber;

    const data = await openStatesFetch("/bills", params);
    const bills = (data.results ?? []).map(mapStateBill);

    // Sort by latest action date descending (most current first)
    bills.sort((a: any, b: any) => {
      const dateA = a.latestActionDate ? new Date(a.latestActionDate).getTime() : 0;
      const dateB = b.latestActionDate ? new Date(b.latestActionDate).getTime() : 0;
      return dateB - dateA;
    });

    return res.json({ bills, totalCount: data.pagination?.total_items, offset });
  } catch (err) {
    req.log.error({ err }, "Error fetching state bills");
    return res.status(500).json({ error: String(err) });
  }
});

// Bill IDs are "ocd-bill/<uuid>" — frontend URL-encodes them
router.get("/state/bills/:billId", async (req, res) => {
  const billId = decodeURIComponent(req.params.billId);
  if (!billId) return res.status(400).json({ error: "billId required" });

  try {
    const url = new URL(`${BASE}/bills/${billId}`);
    url.searchParams.set("include", "votes");
    url.searchParams.append("include", "sponsorships");
    url.searchParams.append("include", "actions");
    const res2 = await fetch(url.toString(), {
      headers: { "X-API-KEY": OPENSTATES_API_KEY! },
    });
    if (!res2.ok) {
      const text = await res2.text();
      throw new Error(`OpenStates API error ${res2.status}: ${text}`);
    }
    const data = await res2.json() as any;
    const latestAction = data.actions?.[data.actions.length - 1];

    return res.json({
      id: data.id ?? billId,
      identifier: data.identifier,
      title: data.title ?? "Untitled",
      session: data.legislative_session,
      chamber: data.from_organization?.classification,
      status: latestAction?.description,
      introducedDate: data.first_action_date ?? data.created_at?.split("T")[0],
      summary: data.abstract,
      sponsors: data.sponsorships
        ?.filter((s: any) => s.primary)
        .map((s: any) => ({ name: s.name ?? "", party: s.party, state: data.jurisdiction?.name ?? undefined, openstatesId: s.person?.id ?? s.id ?? undefined })) ?? [],
      cosponsors: data.sponsorships
        ?.filter((s: any) => !s.primary)
        .map((s: any) => ({ name: s.name ?? "", party: s.party, state: data.jurisdiction?.name ?? undefined, openstatesId: s.person?.id ?? s.id ?? undefined })) ?? [],
      committees: data.actions
        ?.filter((a: any) => a.organization)
        .map((a: any) => ({ name: a.organization.name ?? "", chamber: a.organization.classification }))
        .filter((c: any, i: number, arr: any[]) => arr.findIndex((x) => x.name === c.name) === i) ?? [],
      actions: data.actions?.map((a: any) => ({
        date: a.date ?? "",
        text: a.description ?? "",
        type: a.classification?.[0],
      })) ?? [],
      votes: data.votes?.map((v: any) => ({
        date: v.date ?? "",
        chamber: v.chamber,
        result: v.result,
        yesCount: v.counts?.find((c: any) => c.option === "yes")?.value,
        noCount: v.counts?.find((c: any) => c.option === "no")?.value,
        absentCount: v.counts?.find((c: any) => c.option === "absent")?.value,
      })) ?? [],
      url: data.openstates_url,
      subjects: Array.isArray(data.subject) ? data.subject : (data.subject ? [data.subject] : undefined),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching state bill detail");
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
