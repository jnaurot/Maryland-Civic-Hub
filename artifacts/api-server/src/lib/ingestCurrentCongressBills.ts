import { max, sql, eq } from "drizzle-orm";
import {
  db,
  federalBillsTable,
  federalMemberBillRolesTable,
} from "@workspace/db";
import {
  classifyFederalLegislationItem,
  getFederalLegislationDisplayNumber,
  getFederalLegislationTitle,
} from "./federalMemberLegislation";
import { computeLegislationStageFlags } from "./legislationStages";
import { getCurrentCongressNumber } from "./federalBillProgress";
import { logger } from "./logger";
import { logRefreshEvent } from "./ingestFederalMembers";

const BASE = "https://api.congress.gov/v3";
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;

async function fetchWithRetry(url: string, maxAttempts = 3): Promise<any> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      return res.json();
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        const delay = attempt * 2000;
        logger.warn({ err, attempt, url }, `Congress bill fetch failed, retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

async function ingestCongressBillsPage(
  congress: number,
  offset: number,
): Promise<{ inserted: number; totalExpected: number }> {
  if (!CONGRESS_API_KEY) throw new Error("CONGRESS_API_KEY not configured");

  const url = new URL(`${BASE}/bill/${congress}`);
  url.searchParams.set("api_key", CONGRESS_API_KEY);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "250");
  url.searchParams.set("offset", String(offset));

  const data = await fetchWithRetry(url.toString());
  const bills: any[] = data.bills ?? [];
  const totalExpected: number = data.pagination?.count ?? 0;

  await Promise.all(
    bills.map(async (b) => {
      const billType = (b.type ?? "").toLowerCase();
      const billNumber = b.number ?? b.billNumber;
      if (!billType || !billNumber) return;

      const billId = `${b.congress}-${billType}-${billNumber}`;
      const displayNumber = getFederalLegislationDisplayNumber(b) ?? `${b.type} ${billNumber}`;
      const title = getFederalLegislationTitle(b);
      const latestActionText = b.latestAction?.text ?? null;
      const latestActionDate = b.latestAction?.actionDate ?? null;
      // subjects may be absent from the bill-list endpoint; use what's available
      const subjects: string[] =
        b.subjects?.legislativeSubjects?.item?.map((s: any) => s.name ?? s) ??
        b.subjects?.item ??
        (Array.isArray(b.subjects) ? b.subjects : []);
      const subjectsText = subjects.join(" ");
      const stageFlags = computeLegislationStageFlags({
        latestAction: latestActionText,
        introducedDate: b.introducedDate ?? null,
      });

      const category = classifyFederalLegislationItem(b);

      // Upsert the bill with full metadata including stage flags and category
      await db
        .insert(federalBillsTable)
        .values({
          id: billId,
          title,
          number: displayNumber,
          type: b.type ?? null,
          congress: String(b.congress),
          introducedDate: b.introducedDate ?? null,
          latestActionDate,
          summary: null,
          latestAction: latestActionText,
          chamber: b.originChamber ?? null,
          category,
          policyArea: b.policyArea?.name ?? null,
          subjects,
          url: b.url ?? null,
          stageIntroduced: stageFlags.introduced,
          stageCommittee: stageFlags.committee,
          stageFloorVote: stageFlags.floor_vote,
          stagePassed: stageFlags.passed,
          stageSignedEnacted: stageFlags.signed_enacted,
          stageDead: stageFlags.dead,
          raw: null,
          searchVector: sql`
            setweight(to_tsvector('english', coalesce(${title}, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(${displayNumber}, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(${subjectsText}, '')), 'C')
          `,
          fetchedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: federalBillsTable.id,
          set: {
            title,
            number: displayNumber,
            type: b.type ?? null,
            congress: String(b.congress),
            introducedDate: b.introducedDate ?? null,
            latestActionDate,
            latestAction: latestActionText,
            chamber: b.originChamber ?? null,
            category,
            policyArea: b.policyArea?.name ?? null,
            subjects,
            url: b.url ?? null,
            stageIntroduced: stageFlags.introduced,
            stageCommittee: stageFlags.committee,
            stageFloorVote: stageFlags.floor_vote,
            stagePassed: stageFlags.passed,
            stageSignedEnacted: stageFlags.signed_enacted,
            stageDead: stageFlags.dead,
            fetchedAt: new Date(),
            searchVector: sql`
              setweight(to_tsvector('english', coalesce(${title}, '')), 'A') ||
              setweight(to_tsvector('english', coalesce(${displayNumber}, '')), 'B') ||
              setweight(to_tsvector('english', coalesce(${subjectsText}, '')), 'C')
            `,
          },
        });

      // Insert sponsor into the member-bill roles join table
      const sponsorId: string | undefined = b.sponsors?.[0]?.bioguideId;
      if (sponsorId) {
        await db
          .insert(federalMemberBillRolesTable)
          .values({
            bioguideId: sponsorId,
            billId,
            congress: String(b.congress),
            role: "sponsor",
            fetchedAt: new Date(),
          })
          .onConflictDoNothing();
      }
    }),
  );

  return { inserted: bills.length, totalExpected };
}

export async function ingestAllCurrentCongressBills(): Promise<{ count: number }> {
  const congress = getCurrentCongressNumber();
  const start = Date.now();
  logger.info({ congress }, "Starting bulk current Congress bill ingestion");
  logRefreshEvent({ event: "congress_bills_ingest_start", congress });

  let offset = 0;
  let totalIngested = 0;
  let totalExpected = 0;
  const MAX_PAGES = 200;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await ingestCongressBillsPage(congress, offset);
    totalIngested += result.inserted;
    totalExpected = result.totalExpected;

    if (result.inserted === 0) break;
    if (totalIngested >= totalExpected) break;
    offset += result.inserted;
  }

  const durationMs = Date.now() - start;
  logger.info({ congress, count: totalIngested, durationMs }, "Congress bill ingestion complete");
  logRefreshEvent({ event: "congress_bills_ingest_complete", congress, count: totalIngested, durationMs });

  return { count: totalIngested };
}

export async function checkAndIngestCongressBillsIfStale(): Promise<void> {
  const congress = getCurrentCongressNumber();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const [row] = await db
    .select({ latest: max(federalBillsTable.fetchedAt) })
    .from(federalBillsTable)
    .where(eq(federalBillsTable.congress, String(congress)));

  const latest = row?.latest;
  if (latest && Date.now() - latest.getTime() < SEVEN_DAYS_MS) {
    logger.info({ latest, congress }, "Current Congress bills are fresh, skipping ingestion");
    return;
  }

  logger.info({ latest, congress }, "Current Congress bills are stale or absent, ingesting");
  await ingestAllCurrentCongressBills();
}
