import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const providerStatusTable = pgTable("provider_status", {
  provider: text("provider").primaryKey(),
  blockedUntil: timestamp("blocked_until", { withTimezone: true }),
  reason: text("reason"),
  lastStatusCode: integer("last_status_code"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertProviderStatusSchema = createInsertSchema(providerStatusTable);
export type InsertProviderStatus = import("zod/v4").infer<typeof insertProviderStatusSchema>;
export type ProviderStatus = typeof providerStatusTable.$inferSelect;
