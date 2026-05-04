import { pgTable, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const senatorIdentitiesTable = pgTable("senator_identities", {
  bioguideId: varchar("bioguide_id", { length: 10 }).notNull(),
  lisMemberId: varchar("lis_member_id", { length: 10 }).notNull(),
  name: varchar("name", { length: 100 }),
  state: varchar("state", { length: 2 }),
  party: varchar("party", { length: 10 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("senator_identities_bioguide_idx").on(table.bioguideId),
  uniqueIndex("senator_identities_lis_idx").on(table.lisMemberId),
]);

export const insertSenatorIdentitySchema = createInsertSchema(senatorIdentitiesTable);
export type InsertSenatorIdentity = z.infer<typeof insertSenatorIdentitySchema>;
export type SenatorIdentity = typeof senatorIdentitiesTable.$inferSelect;
