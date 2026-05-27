import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const federalBillsSyncStateTable = pgTable("federal_bills_sync_state", {
  key: text("key").primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  billsProcessed: integer("bills_processed").default(0).notNull(),
  fromDate: timestamp("from_date", { withTimezone: true }),
});

export type FederalBillsSyncState =
  typeof federalBillsSyncStateTable.$inferSelect;
