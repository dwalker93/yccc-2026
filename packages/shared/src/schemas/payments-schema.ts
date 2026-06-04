import { relations } from "drizzle-orm"
import {
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

import { invoices } from "./invoices-schema"
import { members } from "./member-schema"
import { paymentMethods } from "./payment-methods-schema"

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "success",
  "failed",
  "refunded",
])

// =============================================================================
// TABLE 9 — payments
// Each payment attempt against an invoice.
// One invoice can have multiple rows (failed attempts + eventual success).
// Never edited — only refunded.
//
// Automatic payments: gatewayId and gatewayResponse always populated
// Manual payments:    gatewayId and gatewayResponse are null
//                     admin creates this row when confirming bank transfer/cash
// =============================================================================

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id),

  amount: integer("amount").notNull(), // in LKR cents
  currency: text("currency").default("LKR").notNull(),
  status: paymentStatus("payment_status").default("pending").notNull(),
  paymentMethodId: text("payment_method_id")
    .notNull()
    .references(() => paymentMethods.id),

  // gateway — null for manual payments (BANK_TRANSFER, CASH)
  gatewayId: text("gateway_id"), // gateway's own transaction ID
  gatewayResponse: json("gateway_response"), // raw response — debugging only

  paidAt: timestamp("paid_at"), // null until status = success
  failureReason: text("failure_reason"), // populated on failure

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// =============================================================================
// TABLE 10 — refunds
// Each refund against a payment.
// One payment can have multiple rows (partial or full refunds).
//
// Manual refunds:      admin creates this row when confirming bank transfer/cash
// Gateway refunds:     gatewayId and gatewayResponse always populated
// =============================================================================
export const refunds = pgTable("refunds", {
  id: text("id").primaryKey(),
  paymentId: text("payment_id")
    .notNull()
    .references(() => payments.id),
  amount: integer("amount").notNull(), // partial refunds possible
  reason: text("reason").notNull(),
  gatewayRefundId: text("gateway_refund_id"), // gateway's refund transaction id
  refundedAt: timestamp("refunded_at").notNull(),
  actionedBy: text("actioned_by").notNull(), // admin id OR "system"
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  member: one(members, {
    fields: [payments.memberId],
    references: [members.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [payments.paymentMethodId],
    references: [paymentMethods.id],
  }),
}))

export const refundsRelations = relations(refunds, ({ one }) => ({
  payment: one(payments, {
    fields: [refunds.paymentId],
    references: [payments.id],
  }),
}))
