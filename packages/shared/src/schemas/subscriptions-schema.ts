import { relations } from "drizzle-orm"
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { invoices } from "./invoices-schema"
import { members } from "./member-schema"
import { plans } from "./subscription-plans-schema"

/**
 * Subscription period lifecycle status.
 *
 * active    → currently valid, member has full access
 * inactive  → currently invalid, member has no access
 * scheduled → paid for, not yet started (prepaid future periods)
 * cancelled → will not renew, but access valid until currentPeriodEnd
 * expired   → currentPeriodEnd passed, no access
 * past_due  → renewal payment failed, in grace period (still has access)
 * paused    → reserved for future use
 *
 * Key rule: only one non-expired, non-scheduled row per member at any time.
 *
 * Transitions:
 *   inactive  → active     (member account activated)
 *   active    → cancelled  (member requests downgrade)
 *   active    → expired    (cron job on period end)
 *   active    → past_due   (renewal payment failed)
 *   scheduled → active     (cron activates on period start)
 *   scheduled → cancelled  (when member cancels, ALL scheduled rows cancelled too)
 */
export const subscriptionStatus = pgEnum("subscription_status", [
  "active",
  "scheduled",
  "cancelled",
  "expired",
  "past_due",
  "paused",
])

// =============================================================================
// TABLE 7 — subscriptions
// Source of truth for access rights.
//
// GOLDEN RULES:
// 1. Never edit a row's period or plan — only update status fields
// 2. Only one non-expired, non-scheduled row per member at any time
// 3. On upgrade → expire current row, insert new row (active)
// 4. On cancellation → mark current row "cancelled" only, no new row yet
//    Also cancel ALL downstream scheduled rows
// 5. On prepay → insert new row with status "scheduled"
// 6. Cron on currentPeriodEnd:
//    → expire current row
//    → if scheduled rows exist: activate next scheduled row
//    → else: insert new free row (active, periodEnd: 2099-12-31)
// =============================================================================

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),
  status: subscriptionStatus("status").default("active").notNull(),

  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(), // free = 2099-12-31

  // trial — null if no trial on this period
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),

  // cancellation
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),

  // audit chain — links to the row that preceded this one
  previousSubscriptionId: text("previous_subscription_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const subscriptionsRelations = relations(
  subscriptions,
  ({ one, many }) => ({
    member: one(members, {
      fields: [subscriptions.memberId],
      references: [members.id],
    }),
    plan: one(plans, {
      fields: [subscriptions.planId],
      references: [plans.id],
    }),
    invoices: many(invoices),
  })
)
