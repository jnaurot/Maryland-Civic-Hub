import { sql } from "drizzle-orm";
import { db, federalBillsTable } from "@workspace/db";

type InsertShape = typeof federalBillsTable.$inferInsert;

export interface FederalBillUpsertInput {
  // Always required
  id: string;
  title: string;

  // Provide undefined to leave the existing DB value untouched on conflict.
  // Provide null to explicitly clear a field.
  type?: string | null;
  number?: string | null;
  amendmentNumber?: string | null;
  congress?: number | null;
  introducedDate?: string | null;
  latestAction?: string | null;
  latestActionDate?: string | null;
  summary?: string | null;
  chamber?: string | null;
  category?: string | null;
  policyArea?: string | null;
  subjects?: string[];
  url?: string | null;
  textUrl?: string | null;
  updateDate?: string | null;
  stageIntroduced?: boolean;
  stageCommittee?: boolean;
  stageFloorVote?: boolean;
  stagePassed?: boolean;
  stageSignedEnacted?: boolean;
  stageDead?: boolean;
  summaryFetchedAt?: Date | null;
  textUrlFetchedAt?: Date | null;
  raw?: object | null;
}

// Drop keys whose value is undefined — used to build a selective onConflictDoUpdate
// so callers that don't have e.g. summary never overwrite a richer value with null.
function defined(obj: Partial<InsertShape>): Partial<InsertShape> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<InsertShape>;
}

function buildSearchVector(title: string, number: string | null | undefined, subjects: string[], summary: string | null | undefined) {
  const num = number ?? "";
  const subjectsText = subjects.join(" ");
  const sum = summary ?? "";
  return sql`
    setweight(to_tsvector('english', coalesce(${title}, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(${num}, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(${subjectsText}, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(${sum}, '')), 'C')
  `;
}

export async function upsertFederalBill(input: FederalBillUpsertInput): Promise<void> {
  const subjects = input.subjects ?? [];
  const searchVector = buildSearchVector(input.title, input.number, subjects, input.summary);

  await db
    .insert(federalBillsTable)
    .values({
      id: input.id,
      title: input.title,
      type: input.type ?? null,
      number: input.number ?? null,
      amendmentNumber: input.amendmentNumber ?? null,
      congress: input.congress ?? null,
      introducedDate: input.introducedDate ?? null,
      latestAction: input.latestAction ?? null,
      latestActionDate: input.latestActionDate ?? null,
      summary: input.summary ?? null,
      chamber: input.chamber ?? null,
      category: input.category ?? null,
      policyArea: input.policyArea ?? null,
      subjects,
      url: input.url ?? null,
      textUrl: input.textUrl ?? null,
      updateDate: input.updateDate ?? null,
      stageIntroduced: input.stageIntroduced ?? false,
      stageCommittee: input.stageCommittee ?? false,
      stageFloorVote: input.stageFloorVote ?? false,
      stagePassed: input.stagePassed ?? false,
      stageSignedEnacted: input.stageSignedEnacted ?? false,
      stageDead: input.stageDead ?? false,
      summaryFetchedAt: input.summaryFetchedAt ?? null,
      textUrlFetchedAt: input.textUrlFetchedAt ?? null,
      raw: input.raw ?? null,
      fetchedAt: new Date(),
      searchVector,
    })
    .onConflictDoUpdate({
      target: federalBillsTable.id,
      set: {
        // Always refresh these on every write
        title: input.title,
        fetchedAt: new Date(),
        searchVector,
        // Only update optional fields when the caller explicitly provides them,
        // so a lightweight path (e.g. bill list) never overwrites richer data
        // (e.g. a fetched summary) with null.
        ...defined({
          type: input.type,
          number: input.number,
          amendmentNumber: input.amendmentNumber,
          congress: input.congress,
          introducedDate: input.introducedDate,
          latestAction: input.latestAction,
          latestActionDate: input.latestActionDate,
          summary: input.summary,
          chamber: input.chamber,
          category: input.category,
          policyArea: input.policyArea,
          subjects: subjects.length > 0 ? subjects : undefined,
          url: input.url,
          textUrl: input.textUrl,
          updateDate: input.updateDate,
          stageIntroduced: input.stageIntroduced,
          stageCommittee: input.stageCommittee,
          stageFloorVote: input.stageFloorVote,
          stagePassed: input.stagePassed,
          stageSignedEnacted: input.stageSignedEnacted,
          stageDead: input.stageDead,
          summaryFetchedAt: input.summaryFetchedAt,
          textUrlFetchedAt: input.textUrlFetchedAt,
          raw: input.raw,
        }),
      },
    });
}
