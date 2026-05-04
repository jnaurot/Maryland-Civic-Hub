import { pgTable, serial, integer, varchar, text, date, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const houseVotesTable = pgTable("house_votes", {
  id: serial("id").primaryKey(),
  congress: integer("congress").notNull(),
  session: integer("session").notNull(),
  rollCallNumber: integer("roll_call_number").notNull(),
  year: integer("year").notNull(),
  voteDate: date("vote_date"),
  legislationType: varchar("legislation_type", { length: 20 }),
  legislationNumber: varchar("legislation_number", { length: 20 }),
  voteQuestion: text("vote_question"),
  voteResult: varchar("vote_result", { length: 50 }),
  voteDescription: text("vote_description"),
  sourceDataUrl: text("source_data_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("house_votes_unique_idx").on(table.congress, table.session, table.rollCallNumber),
]);

export const insertHouseVoteSchema = createInsertSchema(houseVotesTable).omit({ id: true, createdAt: true });
export type InsertHouseVote = z.infer<typeof insertHouseVoteSchema>;
export type HouseVote = typeof houseVotesTable.$inferSelect;
