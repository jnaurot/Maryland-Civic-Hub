import { Router } from "express";
import {
  GetStateMemberBillsQueryParams,
  GetStateMemberVotesQueryParams,
  GetStateBillsQueryParams,
} from "@workspace/api-zod";

const router = Router();

const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY;
const BASE = "https://v3.openstates.org";

async function openStatesFetch(path: string, params: Record<string, string | number> = {}) {
  if (!OPENSTATES_API_KEY) throw new Error("OPENSTATES_API_KEY not configured");
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: { "X-API-KEY": OPENSTATES_API_KEY },
  });
  if (!res.ok) {
    const text = await res.text();
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
  };
}

// State member IDs are "ocd-person/<uuid>". The frontend URL-encodes them
// so Express sees a single param like "ocd-person%2F<uuid>". We decode it here.
router.get("/state/members/:memberId", async (req, res) => {
  const memberId = decodeURIComponent(req.params.memberId);
  if (!memberId) return res.status(400).json({ error: "memberId required" });

  try {
    const data = await openStatesFetch("/people", { id: memberId, per_page: 1 });
    const person = data.results?.[0];
    if (!person) return res.status(404).json({ error: "Member not found" });
    const jurisdictionId = person.jurisdiction?.id ?? "";
    const jurisdictionMatch = jurisdictionId.match(/state:([a-z]{2})/);
    const jurisdiction = jurisdictionMatch ? jurisdictionMatch[1] : (person.jurisdiction?.name ?? "").toLowerCase().replace(/\s+/g, "");

    return res.json({
      id: person.id ?? memberId,
      name: person.name ?? "",
      party: person.party,
      chamber: person.current_role?.title,
      district: person.current_role?.district ? String(person.current_role.district) : undefined,
      email: person.email,
      phone: person.links?.[0]?.url,
      photoUrl: person.image,
      openstatesUrl: person.openstates_url,
      state: person.jurisdiction?.name ?? undefined,
      jurisdiction,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching state member");
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/state/members/:memberId/bills", async (req, res) => {
  const memberId = decodeURIComponent(req.params.memberId);
  const queryParsed = GetStateMemberBillsQueryParams.safeParse(req.query);
  if (!memberId || !queryParsed.success) return res.status(400).json({ error: "Invalid params" });

  try {
    const { jurisdiction } = queryParsed.data;
    const data = await openStatesFetch("/bills", {
      jurisdiction,
      per_page: 20,
      sponsor_id: memberId,
    });
    const bills = (data.results ?? []).map(mapStateBill);
    return res.json({ bills, totalCount: data.pagination?.total_items });
  } catch (err) {
    req.log.error({ err }, "Error fetching state member bills");
    return res.status(500).json({ error: String(err) });
  }
});

router.get("/state/members/:memberId/votes", async (req, res) => {
  const memberId = decodeURIComponent(req.params.memberId);
  const queryParsed = GetStateMemberVotesQueryParams.safeParse(req.query);
  if (!memberId || !queryParsed.success) return res.status(400).json({ error: "Invalid params" });

  try {
    const { jurisdiction } = queryParsed.data;
    // OpenStates v3 has no standalone /votes endpoint — fetch bills the person sponsored
    // and include vote records, then extract their individual vote
    // include=votes must be passed as a repeated query param
    const billUrl = new URL(`${BASE}/bills`);
    billUrl.searchParams.set("jurisdiction", jurisdiction);
    billUrl.searchParams.set("sponsor_id", memberId);
    billUrl.searchParams.set("per_page", "20");
    billUrl.searchParams.append("include", "votes");
    const billRes = await fetch(billUrl.toString(), {
      headers: { "X-API-KEY": OPENSTATES_API_KEY! },
    });
    if (!billRes.ok) {
      const text = await billRes.text();
      throw new Error(`OpenStates API error ${billRes.status}: ${text}`);
    }
    const data = await billRes.json() as any;

    const votes: any[] = [];
    for (const bill of data.results ?? []) {
      for (const voteEvent of bill.votes ?? []) {
        const individualVotes: any[] = voteEvent.votes ?? [];
        // Match by voter ID or by "Mr. President" (Senate president pro tempore)
        const personalVote = individualVotes.find(
          (vv: any) => vv.voter?.id === memberId || vv.voter_name === "Mr. President"
        );
        const position = personalVote?.option ?? null;
        if (position) {
          votes.push({
            billId: bill.id,
            billTitle: bill.title ?? "Untitled",
            billIdentifier: bill.identifier,
            date: voteEvent.start_date ?? voteEvent.date ?? "",
            position,
            result: voteEvent.result,
          });
          break;
        }
      }
    }

    return res.json({ votes });
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
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching state bill detail");
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
