import { pgTable, serial, integer, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { senateRollCallVotesTable } from "./senate_roll_call_votes";

export const senatorVotePositionsTable = pgTable("senator_vote_positions", {
  id: serial("id").primaryKey(),
  voteId: integer("vote_id").notNull().references(() => senateRollCallVotesTable.id),
  bioguideId: varchar("bioguide_id", { length: 10 }),
  lisMemberId: varchar("lis_member_id", { length: 10 }).notNull(),
  senatorName: varchar("senator_name", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }),
  party: varchar("party", { length: 10 }),
  voteCast: varchar("vote_cast", { length: 20 }).notNull(), // Yea, Nay, Present, Absent
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("senator_positions_unique_idx").on(table.voteId, table.lisMemberId),
]);

export const insertSenatorVotePositionSchema = createInsertSchema(senatorVotePositionsTable).omit({ id: true, createdAt: true });
export type InsertSenatorVotePosition = z.infer<typeof insertSenatorVotePositionSchema>;
export type SenatorVotePosition = typeof senatorVotePositionsTable.$inferSelect;
