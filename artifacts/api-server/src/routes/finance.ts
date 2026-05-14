import { Router } from "express";
import {
  GetCandidateFinanceParams,
  GetCandidateFinanceQueryParams,
  SearchCandidateFinanceQueryParams,
} from "@workspace/api-zod";
import { fetchWithTimeout as fetch } from "../lib/http";
import { sendInternalError } from "../lib/respond";

const router = Router();

const FEC_BASE = "https://api.opensecrets.org";
const FEC_API_BASE = "https://api.open.fec.gov/v1";

// We use FEC (free, no key needed) for finance data
async function fecFetch(
  path: string,
  params: Record<string, string | number> = {},
) {
  const url = new URL(`${FEC_API_BASE}${path}`);
  url.searchParams.set("api_key", "DEMO_KEY");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FEC API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<any>;
}

router.get("/finance/search", async (req, res) => {
  const parsed = SearchCandidateFinanceQueryParams.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({ error: "name is required" });

  const { name, state } = parsed.data;

  try {
    const params: Record<string, string | number> = {
      q: name,
      per_page: 20,
      sort: "-receipts",
      is_active_candidate: "true",
    };
    if (state) params.state = state;

    const data = await fecFetch("/candidates/search", params);

    const candidates = (data.results ?? []).map((c: any) => ({
      id: c.candidate_id ?? "",
      name: c.name ?? "",
      party: c.party,
      state: c.state,
      office: c.office_full,
      cycle: c.election_years?.[c.election_years.length - 1],
    }));

    return res.json({ candidates });
  } catch (err) {
    req.log.error({ err }, "Error searching FEC candidates");
    return sendInternalError(res);
  }
});

router.get("/finance/:candidateId", async (req, res) => {
  const paramsParsed = GetCandidateFinanceParams.safeParse(req.params);
  const queryParsed = GetCandidateFinanceQueryParams.safeParse(req.query);
  if (!paramsParsed.success)
    return res.status(400).json({ error: "Invalid params" });

  const { candidateId } = paramsParsed.data;
  const cycle = queryParsed.success ? queryParsed.data.cycle : undefined;

  try {
    const financeParams: Record<string, string | number> = {
      candidate_id: candidateId,
      per_page: 1,
      sort: "-first_file_date",
    };
    if (cycle) financeParams.cycle = cycle;

    const [totalsData, donorsData, industriesData] = await Promise.allSettled([
      fecFetch("/candidate/totals", { candidate_id: candidateId, per_page: 1 }),
      fecFetch("/schedules/schedule_a/by_contributor", {
        candidate_id: candidateId,
        per_page: 10,
        sort: "-total",
      }),
      fecFetch("/schedules/schedule_a/by_industry", {
        candidate_id: candidateId,
        per_page: 10,
        sort: "-total",
      }),
    ]);

    const totals =
      totalsData.status === "fulfilled"
        ? (totalsData.value.results?.[0] ?? {})
        : {};
    const candidateName = totals.candidate_name ?? candidateId;

    const topDonors =
      donorsData.status === "fulfilled"
        ? (donorsData.value.results ?? []).map((d: any) => ({
            name: d.contributor_name ?? d.contributor_id ?? "Unknown",
            total: d.total ?? 0,
            type: (d.contributor_type === "C" ? "pac" : "individual") as
              | "pac"
              | "individual"
              | "other",
            industry: d.contributor_industry,
          }))
        : [];

    const topIndustries =
      industriesData.status === "fulfilled"
        ? (industriesData.value.results ?? []).map((d: any) => ({
            name: d.industry ?? d.industry_code ?? "Unknown",
            total: d.total ?? 0,
            type: "other" as "pac" | "individual" | "other",
            industry: d.industry,
          }))
        : [];

    return res.json({
      candidateId,
      candidateName,
      cycle: totals.cycle ?? cycle,
      totalRaised: totals.receipts,
      totalSpent: totals.disbursements,
      cashOnHand: totals.cash_on_hand_end_period,
      topDonors,
      topIndustries,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching candidate finance");
    return sendInternalError(res);
  }
});

export default router;
