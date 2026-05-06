import { pgTable, text, timestamp, jsonb, uniqueIndex, index, customType } from "drizzle-orm/pg-core";
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
  congress: text("congress"),
  introducedDate: text("introduced_date"),
  summary: text("summary"),
  policyArea: text("policy_area"),
  subjects: text("subjects").array(),
  url: text("url"),
  textUrl: text("text_url"),
  raw: jsonb("raw"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
  searchVector: tsvector("search_vector"),
}, (table) => [
  uniqueIndex("federal_bills_id_idx").on(table.id),
  index("idx_federal_bills_congress").on(table.congress),
  index("idx_federal_bills_search").using("gin", table.searchVector),
  index("idx_federal_bills_fetched_at").on(table.fetchedAt),
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
