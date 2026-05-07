import { pgTable, text, timestamp, index, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const federalMemberBillRolesTable = pgTable("federal_member_bill_roles", {
  bioguideId: text("bioguide_id").notNull(),
  billId: text("bill_id").notNull(),
  congress: text("congress"),
  role: text("role").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.bioguideId, table.billId, table.role] }),
  index("idx_federal_member_bill_roles_lookup").on(table.bioguideId, table.role),
  index("idx_federal_member_bill_roles_bill").on(table.billId),
]);

export const insertFederalMemberBillRoleSchema = createInsertSchema(federalMemberBillRolesTable).omit({ fetchedAt: true });
export type InsertFederalMemberBillRole = import("zod/v4").infer<typeof insertFederalMemberBillRoleSchema>;
export type FederalMemberBillRole = typeof federalMemberBillRolesTable.$inferSelect;
