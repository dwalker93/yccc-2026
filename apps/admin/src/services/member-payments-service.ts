import { count, desc, eq, sql } from "drizzle-orm"

import {
  invoices,
  members,
  paymentMethods,
  payments,
  plans,
  subscriptions,
} from "@workspace/shared/schemas"

import { appdb } from "@/lib/db"

import { ServiceError } from "./errors"

/*
 * Get member payments projections
 */
const getMemberPaymentsProjections = {
  id: payments.id,
  invoiceNumber: invoices.invoiceNumber,
  amount: payments.amount,
  paidAt: payments.paidAt,
  paymentMethod: paymentMethods.name,
  reference: payments.reference,
  status: payments.status,
}

/**
 * Retrieves payments history records for a member.
 *
 * @param memberId - Unique identifier of the member.
 * @param pageIndex - Page number of the results.
 * @param pageSize - Number of records per page.
 * @returns Object containing array of payments records and total count.
 * @throws {ServiceError} If no payments records are found.
 */
export async function getMemberPaymentsService({
  memberId,
  pageIndex,
  pageSize,
}: {
  memberId: string
  pageIndex: number
  pageSize: number
}) {
  try {
    const [records, countResult] = await Promise.all([
      appdb
        .select(getMemberPaymentsProjections)
        .from(payments)
        .innerJoin(invoices, eq(invoices.id, payments.invoiceId))
        .innerJoin(
          paymentMethods,
          eq(paymentMethods.id, payments.paymentMethodId)
        )
        .where(eq(payments.memberId, memberId))
        .orderBy(sql`${payments.paidAt} DESC NULLS LAST`, desc(payments.id))
        .limit(pageSize)
        .offset((pageIndex - 1) * pageSize),

      appdb
        .select({ total: count() })
        .from(payments)
        .where(eq(payments.memberId, memberId)),
    ])

    return {
      records,
      totalCount: countResult[0]?.total ?? 0,
    }
  } catch (error) {
    console.error("getMemberPaymentsService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get member payments")
  }
}

/** Individual member payment record type. */
export type MemberPayment = Awaited<
  ReturnType<typeof getMemberPaymentsService>
>["records"][number]

// Projections for a single invoice
const getMemberInvoiceProjections = {
  ...getMemberPaymentsProjections,
  memberName: members.name,
  memberEmail: members.email,
  billingAddress1: members.addressLine1,
  billingAddress2: members.addressLine2,
  billingCity: members.city,
  subscription: subscriptions.id,
  subscriptionPlan: plans.name,
  subscriptionPlanAmount: plans.price,
  paymentCategory: paymentMethods.category,
  paymentMethod: paymentMethods.name,
}

/**
 * Retrieves details of a specific invoice.
 *
 * @param invoiceId - The ID of the invoice to retrieve.
 * @returns The invoice details.
 * @throws {ServiceError} If the invoice is not found.
 */
export default async function getMemberInvoiceService(invoiceId: string) {
  try {
    const [existingInvoice] = await appdb
      .select(getMemberInvoiceProjections)
      .from(invoices)
      .innerJoin(members, eq(members.id, invoices.memberId))
      .innerJoin(subscriptions, eq(subscriptions.id, invoices.subscriptionId))
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .leftJoin(payments, eq(payments.invoiceId, invoices.id))
      .leftJoin(paymentMethods, eq(paymentMethods.id, payments.paymentMethodId))
      .where(eq(invoices.id, invoiceId))

    if (!existingInvoice) {
      throw new ServiceError("Invoice not found")
    }

    return existingInvoice
  } catch (error) {
    console.error("getMemberInvoiceService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get member invoice")
  }
}

/** Individual member invoice record type. */
export type MemberInvoiceDetails = Awaited<
  ReturnType<typeof getMemberInvoiceService>
>
