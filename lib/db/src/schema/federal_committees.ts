import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const federalCommitteesTable = pgTable("federal_committees", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  chamber: text("chamber"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertFederalCommitteeSchema = createInsertSchema(federalCommitteesTable).omit({ fetchedAt: true });
export type InsertFederalCommittee = import("zod/v4").infer<typeof insertFederalCommitteeSchema>;
export type FederalCommittee = typeof federalCommitteesTable.$inferSelect;
