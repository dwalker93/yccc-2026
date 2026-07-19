import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

import { subscriptions } from "./subscriptions-schema"

/**
 * Works with intervalCount on the plans table.
 * interval: "monthly"  + intervalCount: 1 = every month
 * interval: "monthly"  + intervalCount: 6 = every 6 months
 * interval: "annual"   + intervalCount: 1 = every year
 * interval: "lifetime" + intervalCount: 1 = never expires (free plan)
 */
export const billingInterval = pgEnum("billing_interval", [
  "monthly",
  "annual",
  "lifetime",
])

// =============================================================================
// TABLE 5 — plans
// NOT an enum. Adding a new plan = one INSERT, zero migrations.
// Price stored in LKR cents (250000 = LKR 2,500.00).
//
// Seed data:
// { id:"free", name:"Free", price:0,      interval:"lifetime", intervalCount:1, trialDays:0, isActive:true, sortOrder:0 }
// { id:"pro",  name:"Pro",  price:250000, interval:"annual",   intervalCount:1, trialDays:0, isActive:true, sortOrder:1 }
// =============================================================================

export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // "Free" | "Pro" | "Pro Plus"
  description: text("description"),
  price: integer("price").notNull(), // in LKR cents
  currency: text("currency").default("LKR").notNull(),
  interval: billingInterval("interval").notNull(),
  intervalCount: integer("interval_count").default(1).notNull(),
  trialDays: integer("trial_days").default(0).notNull(),
  features: json("features"), // ["job_applications", "priority_listing"]
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(), // display ordering in UI
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}))
