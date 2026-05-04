import { pgTable, serial, integer, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { houseVotesTable } from "./house_votes";

export const houseVoteRecordsTable = pgTable("house_vote_records", {
  id: serial("id").primaryKey(),
  voteId: integer("vote_id").notNull().references(() => houseVotesTable.id),
  bioguideId: varchar("bioguide_id", { length: 10 }).notNull(),
  memberName: varchar("member_name", { length: 100 }).notNull(),
  party: varchar("party", { length: 10 }),
  state: varchar("state", { length: 2 }),
  voteCast: varchar("vote_cast", { length: 20 }).notNull(), // Yea, Nay, Present, Not Voting
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("house_vote_records_unique_idx").on(table.voteId, table.bioguideId),
]);

export const insertHouseVoteRecordSchema = createInsertSchema(houseVoteRecordsTable).omit({ id: true, createdAt: true });
export type InsertHouseVoteRecord = z.infer<typeof insertHouseVoteRecordSchema>;
export type HouseVoteRecord = typeof houseVoteRecordsTable.$inferSelect;
