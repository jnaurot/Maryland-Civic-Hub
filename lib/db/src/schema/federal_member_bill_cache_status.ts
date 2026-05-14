import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const federalMemberBillCacheStatusTable = pgTable(
  "federal_member_bill_cache_status",
  {
    bioguideId: text("bioguide_id").notNull(),
    role: text("role").notNull(),
    congress: text("congress"),
    fullyIngested: boolean("fully_ingested").default(false).notNull(),
    localCount: integer("local_count").default(0).notNull(),
    sourceTotalCount: integer("source_total_count"),
    lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastHeadSyncAt: timestamp("last_head_sync_at", { withTimezone: true }),
    lastFullSyncAt: timestamp("last_full_sync_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("idx_federal_member_bill_cache_status_pk").on(
      table.bioguideId,
      table.role,
      table.congress,
    ),
    index("idx_federal_member_bill_cache_status_lookup").on(
      table.bioguideId,
      table.role,
    ),
  ],
);

export const insertFederalMemberBillCacheStatusSchema = createInsertSchema(
  federalMemberBillCacheStatusTable,
).omit({ lastFetchedAt: true });
export type InsertFederalMemberBillCacheStatus = import("zod/v4").infer<
  typeof insertFederalMemberBillCacheStatusSchema
>;
export type FederalMemberBillCacheStatus =
  typeof federalMemberBillCacheStatusTable.$inferSelect;
