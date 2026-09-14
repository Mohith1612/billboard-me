import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Waitlist capture.
 *
 * This is pre-domain lead capture, deliberately kept outside the canonical
 * User → Asset → Surface → Spot → Listing model in AGENTS.md §4. Nothing here
 * represents a real asset, surface or listing — none of those exist yet.
 *
 * `asset_type` / `inventory_type` are free `text`, not Postgres enums, so the
 * schema never hard-codes the asset categories the UI happens to show today.
 */

export const sellerWaitlist = pgTable("seller_waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  xHandle: text("x_handle"),
  location: text("location"),
  assetType: text("asset_type"),
  priceExpectation: text("price_expectation"),
  audienceReach: text("audience_reach"),
  eventContext: text("event_context"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const brandWaitlist = pgTable("brand_waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyName: text("company_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  website: text("website"),
  industry: text("industry"),
  inventoryType: text("inventory_type"),
  budgetRange: text("budget_range"),
  campaignTiming: text("campaign_timing"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();
