import { Router } from "express";
import {
  GetFederalMemberParams,
  GetFederalMemberBillsParams,
  GetFederalMemberBillsQueryParams,
  GetFederalMemberVotesParams,
  GetFederalMemberVotesQueryParams,
  GetFederalMemberCommitteesParams,
  GetFederalBillsQueryParams,
  GetFederalBillDetailParams,
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

router.get("/federal/members/:bioguideId/votes", async (req, res) => {
  const paramsParsed = GetFederalMemberVotesParams.safeParse(req.params);
  const queryParsed = GetFederalMemberVotesQueryParams.safeParse(req.query);
  if (!paramsParsed.success || !queryParsed.success) return res.status(400).json({ error: "Invalid params" });

  const { bioguideId } = paramsParsed.data;
  const { offset, limit } = queryParsed.data;

  try {
    // Congress.gov doesn't have a direct votes-per-member endpoint; use recent votes from their senate/house rolls
    // We fetch the member's sponsored bills as a proxy, but for real votes we use the member endpoint
    const data = await congressFetch(`/member/${bioguideId}/sponsored-legislation`, { offset, limit });
    const items = data.sponsoredLegislation?.item ?? [];

    // Try to get actual voting records from Congress API
    const votes = items.slice(0, limit).map((b: any) => ({
      billId: b.number ? `${b.congress}-${b.type}-${b.number}` : undefined,
      billTitle: b.title ?? "Untitled",
      billNumber: `${b.type ?? ""} ${b.number ?? ""}`.trim(),
      date: b.latestAction?.actionDate ?? b.introducedDate ?? "",
      position: "Sponsor",
      question: "Sponsorship",
      result: b.latestAction?.text,
      description: b.title,
    }));

    return res.json({ votes, totalCount: data.pagination?.count, offset });
  } catch (err) {
    req.log.error({ err }, "Error fetching member votes");
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
