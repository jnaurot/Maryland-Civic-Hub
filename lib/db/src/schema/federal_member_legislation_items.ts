import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
  primaryKey,
  customType,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const federalMemberLegislationItemsTable = pgTable(
  "federal_member_legislation_items",
  {
    bioguideId: text("bioguide_id").notNull(),
    itemId: text("item_id").notNull(),
    role: text("role").notNull(),
    congress: text("congress"),
    category: text("category").notNull(),
    type: text("type"),
    number: text("number"),
    amendmentNumber: text("amendment_number"),
    title: text("title").notNull(),
    introducedDate: text("introduced_date"),
    latestAction: text("latest_action"),
    latestActionDate: text("latest_action_date"),
    policyArea: text("policy_area"),
    url: text("url"),
    raw: jsonb("raw"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    searchVector: tsvector("search_vector"),
  },
  (table) => [
    primaryKey({ columns: [table.bioguideId, table.itemId, table.role] }),
    index("idx_federal_member_legislation_lookup").on(
      table.bioguideId,
      table.role,
      table.category,
      table.introducedDate,
    ),
    index("idx_federal_member_legislation_search").using(
      "gin",
      table.searchVector,
    ),
    index("idx_federal_member_legislation_fetched_at").on(table.fetchedAt),
  ],
);

export const insertFederalMemberLegislationItemSchema = createInsertSchema(
  federalMemberLegislationItemsTable,
).omit({ fetchedAt: true });
export type InsertFederalMemberLegislationItem = import("zod/v4").infer<
  typeof insertFederalMemberLegislationItemSchema
>;
export type FederalMemberLegislationItem =
  typeof federalMemberLegislationItemsTable.$inferSelect;
