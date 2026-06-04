import { relations } from "drizzle-orm"
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { members } from "./member-schema"
import { payments } from "./payments-schema"
import { subscriptions } from "./subscriptions-schema"

/**
 * Invoice lifecycle status.
 * draft removed — invoices go straight to open on creation.
 * Add draft back when automated billing with adjustment window is introduced.
 *
 * open          → issued to member, awaiting payment
 * paid          → fully settled
 * void          → cancelled — issued by mistake, was never a real debt
 * uncollectible → real debt, but written off — member won't pay (chargeback,
 *                 repeated gateway failure, member unreachable)
 */
export const invoiceStatus = pgEnum("invoice_status", [
  "open",
  "paid",
  "void",
  "uncollectible",
])

// =============================================================================
// TABLE 8 — invoices
// The official billing document issued to the member.
// One invoice per billing cycle / payment event.
// Immutable once issued — void and reissue if correction needed.
// Amounts in LKR cents.
//
// Two payment flows:
//   Automatic (gateway): webhook fires → payment row created → invoice marked paid
//   Manual (bank/cash):  admin confirms → payment row created → invoice marked paid
//
// periodStart/periodEnd copied from subscription at creation time so the
// invoice is self-contained regardless of future subscription state changes.
// =============================================================================

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id),

  // nullable — no subscription row exists at invoice creation for bank transfers
  // set when admin confirms payment and subscription row is inserted
  subscriptionId: text("subscription_id").references(() => subscriptions.id),

  invoiceNumber: text("invoice_number").notNull().unique(), // INV-2026-00001
  status: invoiceStatus("invoice_status").default("open").notNull(),

  // amounts in LKR cents
  subtotal: integer("subtotal").notNull(),
  discountAmount: integer("discount_amount").default(0).notNull(),
  total: integer("total").notNull(), // subtotal - discountAmount
  amountPaid: integer("amount_paid").default(0).notNull(),
  amountDue: integer("amount_due").notNull(), // total - amountPaid (0 when paid)
  currency: text("currency").default("LKR").notNull(),

  // nullable — period is unknown at invoice creation for bank transfers
  // set when admin confirms payment and subscription period is known
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),

  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  dueAt: timestamp("due_at"), // set on creation e.g. now + 7 days
  paidAt: timestamp("paid_at"), // null until fully paid
  voidedAt: timestamp("voided_at"),

  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  member: one(members, {
    fields: [invoices.memberId],
    references: [members.id],
  }),
  subscription: one(subscriptions, {
    fields: [invoices.subscriptionId],
    references: [subscriptions.id],
  }),
  payments: many(payments),
}))
