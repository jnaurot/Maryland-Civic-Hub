import { pgTable, text, boolean, timestamp, jsonb, uniqueIndex, index, customType } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const federalBillsTable = pgTable("federal_bills", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  number: text("number"),
  type: text("type"),
  amendmentNumber: text("amendment_number"),
  congress: text("congress"),
  introducedDate: text("introduced_date"),
  latestActionDate: text("latest_action_date"),
  summary: text("summary"),
  latestAction: text("latest_action"),
  chamber: text("chamber"),
  category: text("category"),
  policyArea: text("policy_area"),
  subjects: text("subjects").array(),
  url: text("url"),
  textUrl: text("text_url"),
  stageIntroduced: boolean("stage_introduced").default(false).notNull(),
  stageCommittee: boolean("stage_committee").default(false).notNull(),
  stageFloorVote: boolean("stage_floor_vote").default(false).notNull(),
  stagePassed: boolean("stage_passed").default(false).notNull(),
  stageSignedEnacted: boolean("stage_signed_enacted").default(false).notNull(),
  stageDead: boolean("stage_dead").default(false).notNull(),
  updateDate: text("update_date"),
  summaryFetchedAt: timestamp("summary_fetched_at", { withTimezone: true }),
  raw: jsonb("raw"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
  searchVector: tsvector("search_vector"),
}, (table) => [
  uniqueIndex("federal_bills_id_idx").on(table.id),
  index("idx_federal_bills_congress").on(table.congress),
  index("idx_federal_bills_category").on(table.category),
  index("idx_federal_bills_introduced_date").on(table.introducedDate),
  index("idx_federal_bills_policy_area").on(table.policyArea),
  index("idx_federal_bills_search").using("gin", table.searchVector),
  index("idx_federal_bills_fetched_at").on(table.fetchedAt),
  index("idx_federal_bills_stage_signed").on(table.stageSignedEnacted, table.category, table.introducedDate),
  index("idx_federal_bills_stage_committee").on(table.stageCommittee, table.category, table.introducedDate),
  index("idx_federal_bills_stage_floor_vote").on(table.stageFloorVote, table.category, table.introducedDate),
  index("idx_federal_bills_stage_passed").on(table.stagePassed, table.category, table.introducedDate),
  index("idx_federal_bills_stage_dead").on(table.stageDead, table.category, table.introducedDate),
]);

export const insertFederalBillSchema = z.object({
  id: z.string(),
  title: z.string(),
  number: z.string().optional(),
  congress: z.string().optional(),
  introducedDate: z.string().optional(),
  summary: z.string().optional(),
  policyArea: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  url: z.string().optional(),
  textUrl: z.string().optional(),
  raw: z.any().optional(),
});
export type InsertFederalBill = z.infer<typeof insertFederalBillSchema>;
export type FederalBill = typeof federalBillsTable.$inferSelect;
