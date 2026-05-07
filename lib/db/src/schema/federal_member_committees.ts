import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const federalMemberCommitteesTable = pgTable("federal_member_committees", {
  bioguideId: text("bioguide_id").notNull(),
  committeeId: text("committee_id").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.bioguideId, table.committeeId] }),
]);

export const insertFederalMemberCommitteeSchema = createInsertSchema(federalMemberCommitteesTable).omit({ fetchedAt: true });
export type InsertFederalMemberCommittee = import("zod/v4").infer<typeof insertFederalMemberCommitteeSchema>;
export type FederalMemberCommittee = typeof federalMemberCommitteesTable.$inferSelect;
