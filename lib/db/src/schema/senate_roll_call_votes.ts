import { pgTable, serial, integer, varchar, text, date, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const senateRollCallVotesTable = pgTable("senate_roll_call_votes", {
  id: serial("id").primaryKey(),
  congress: integer("congress").notNull(),
  session: integer("session").notNull(),
  rollCallNumber: integer("roll_call_number").notNull(),
  chamber: varchar("chamber", { length: 10 }).notNull().default("Senate"),
  voteDate: date("vote_date"),
  voteQuestion: text("vote_question"),
  voteResult: varchar("vote_result", { length: 100 }),
  majorityRequirement: varchar("majority_requirement", { length: 20 }),
  issue: text("issue"),
  documentType: varchar("document_type", { length: 20 }),
  documentNumber: varchar("document_number", { length: 30 }),
  documentTitle: text("document_title"),
  voteTitle: text("vote_title"),
  sourceXmlUrl: text("source_xml_url"),
  sourceHtmlUrl: text("source_html_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("senate_votes_unique_idx").on(table.congress, table.session, table.rollCallNumber),
]);

export const insertSenateRollCallVoteSchema = createInsertSchema(senateRollCallVotesTable).omit({ id: true, createdAt: true });
export type InsertSenateRollCallVote = z.infer<typeof insertSenateRollCallVoteSchema>;
export type SenateRollCallVote = typeof senateRollCallVotesTable.$inferSelect;
