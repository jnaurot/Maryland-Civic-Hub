import { pgTable, text, boolean, timestamp, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const federalMembersTable = pgTable("federal_members", {
  bioguideId: text("bioguide_id").primaryKey(),
  name: text("name").notNull(),
  party: text("party"),
  state: text("state"),
  chamber: text("chamber"),
  district: text("district"),
  phone: text("phone"),
  website: text("website"),
  photoUrl: text("photo_url"),
  terms: text("terms"),
  inOffice: boolean("in_office"),
  lisId: text("lis_id"),
  nextElection: text("next_election"),
  raw: jsonb("raw"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
  committeeFetchedAt: timestamp("committee_fetched_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("federal_members_bioguide_id_idx").on(table.bioguideId),
  index("idx_federal_members_state").on(table.state),
  index("idx_federal_members_fetched_at").on(table.fetchedAt),
]);

export const insertFederalMemberSchema = createInsertSchema(federalMembersTable).omit({ fetchedAt: true });
export type InsertFederalMember = import("zod/v4").infer<typeof insertFederalMemberSchema>;
export type FederalMember = typeof federalMembersTable.$inferSelect;
