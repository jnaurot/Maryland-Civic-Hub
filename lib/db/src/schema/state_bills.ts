import { pgTable, text, timestamp, jsonb, uniqueIndex, index, customType } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const stateBillsTable = pgTable("state_bills", {
  id: text("id").primaryKey(),
  identifier: text("identifier"),
  title: text("title").notNull(),
  session: text("session"),
  chamber: text("chamber"),
  status: text("status"),
  introducedDate: text("introduced_date"),
  summary: text("summary"),
  subjects: text("subjects").array(),
  url: text("url"),
  textUrl: text("text_url"),
  jurisdiction: text("jurisdiction").notNull(),
  raw: jsonb("raw"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
  searchVector: tsvector("search_vector"),
}, (table) => [
  uniqueIndex("state_bills_id_idx").on(table.id),
  index("idx_state_bills_jurisdiction").on(table.jurisdiction),
  index("idx_state_bills_search").using("gin", table.searchVector),
  index("idx_state_bills_fetched_at").on(table.fetchedAt),
]);

export const insertStateBillSchema = z.object({
  id: z.string(),
  identifier: z.string().optional(),
  title: z.string(),
  session: z.string().optional(),
  chamber: z.string().optional(),
  status: z.string().optional(),
  introducedDate: z.string().optional(),
  summary: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  url: z.string().optional(),
  textUrl: z.string().optional(),
  jurisdiction: z.string(),
  raw: z.any().optional(),
});
export type InsertStateBill = z.infer<typeof insertStateBillSchema>;
export type StateBill = typeof stateBillsTable.$inferSelect;
