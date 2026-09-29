import dayjs from "dayjs"
import { and, count, desc, eq, inArray, sql } from "drizzle-orm"

import {
  invoices,
  members,
  paymentMethods,
  payments,
  plans,
  subscriptions,
} from "@workspace/shared/schemas"
import { generateId, IdPrefix } from "@workspace/shared/utils/generate-id"
import { IssueInvoiceFormValues } from "@workspace/shared/zod-schemas/invoice-schema"

import { SubscriptionStatus } from "@/config/data"
import { appdb } from "@/lib/db"

import { ServiceError } from "./errors"

/*
 * Get member invoices projections
 */
const getMemberInvoicesProjections = {
  id: invoices.id,
  invoiceNumber: invoices.invoiceNumber,
  amount: invoices.subtotal,
  discount: invoices.discountAmount,
  periodStart: invoices.periodStart,
  periodEnd: invoices.periodEnd,
  issueDate: invoices.issuedAt,
  dueDate: invoices.dueAt,
  paidDate: invoices.paidAt,
  status: invoices.status,
}

/**
 * Retrieves member invoices for a member.
 *
 * @param memberId - Unique identifier of the member.
 * @param pageIndex - Page number of the results.
 * @param pageSize - Number of records per page.
 * @returns Object containing array of member invoices and total count.
 * @throws {ServiceError} If no member invoices are found.
 */
export async function getMemberInvoicesService({
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
        .select(getMemberInvoicesProjections)
        .from(invoices)
        .where(eq(invoices.memberId, memberId))
        .orderBy(sql`${invoices.createdAt} DESC NULLS LAST`, desc(invoices.id))
        .limit(pageSize)
        .offset((pageIndex - 1) * pageSize),

      appdb
        .select({ total: count() })
        .from(invoices)
        .where(eq(invoices.memberId, memberId)),
    ])

    return {
      records,
      totalCount: countResult[0]?.total ?? 0,
    }
  } catch (error) {
    console.error("getMemberInvoicesService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get member invoices")
  }
}

/** Individual member invoice record type. */
export type MemberInvoice = Awaited<
  ReturnType<typeof getMemberInvoicesService>
>["records"][number]

/**
 * Settles a member invoice.
 *
 * @param invoiceId - The ID of the invoice to settle.
 * @param data - The settlement data.
 * @returns The updated invoice.
 * @throws {ServiceError} If the invoice is not found or already paid.
 */
export async function settleInvoiceService(
  invoiceId: string,
  data: {
    method: "cash" | "bank_transfer"
    discount: number
    referenceNumber?: string
  }
) {
  try {
    // Check if invoice exists and is not paid
    const [existingInvoice] = await appdb
      .select({
        ...getMemberInvoicesProjections,
        subscriptionId: invoices.subscriptionId,
        subscriptionStatus: subscriptions.status,
        memberId: invoices.memberId,
      })

      .from(invoices)
      .innerJoin(subscriptions, eq(subscriptions.id, invoices.subscriptionId))
      .where(eq(invoices.id, invoiceId))

    if (!existingInvoice) {
      throw new ServiceError("Invoice not found or already paid")
    }

    // Check if invoice has subscription
    if (!existingInvoice.subscriptionId) {
      throw new ServiceError("Invoice has no subscription")
    }

    const discount = existingInvoice.discount
      ? existingInvoice.discount
      : data.discount

    if (discount >= existingInvoice.amount) {
      throw new ServiceError(
        "Discount cannot be greater than or equal to total"
      )
    }

    // Calculate total with discount
    const total = existingInvoice.amount - discount
    const paidAt = new Date()

    await appdb.transaction(async (tx) => {
      // Update invoice
      await tx
        .update(invoices)
        .set({
          status: "paid",
          discountAmount: discount,
          total: existingInvoice.amount - discount,
          amountPaid: existingInvoice.amount - discount,
          amountDue: 0,
          paidAt,
        })
        .where(eq(invoices.id, invoiceId))

      let newSubscriptionStatus: SubscriptionStatus = "inactive"
      const now = new Date()
      if (dayjs(now).isBefore(existingInvoice.periodStart)) {
        newSubscriptionStatus = "scheduled"
      } else if (dayjs(now).isAfter(existingInvoice.periodStart)) {
        newSubscriptionStatus = "active"
      }

      // Update subscription to active
      const [subscription] = await tx
        .update(subscriptions)
        .set({
          status: newSubscriptionStatus,
        })
        .where(eq(subscriptions.id, existingInvoice.subscriptionId!))
        .returning({ planId: subscriptions.planId })

      // Update member
      if (newSubscriptionStatus === "active") {
        await tx
          .update(members)
          .set({
            currentPlanId: subscription!.planId,
            membershipStatus: "approved",
            subscriptionStatus: "active",
            subscriptionCurrentPeriodEnd: existingInvoice.periodEnd,
          })
          .where(eq(members.id, existingInvoice.memberId))
      }

      // Create payment record
      await tx.insert(payments).values({
        id: generateId(IdPrefix.PAYMENT),
        invoiceId: existingInvoice.id,
        memberId: existingInvoice.memberId,
        amount: total,
        status: "success",
        paymentMethodId: data.method === "cash" ? "PMT0016" : "PMT0015",
        reference:
          data.method === "bank_transfer" ? data.referenceNumber : null,
        paidAt,
      })
    })
    return true
  } catch (error) {
    console.error("settleInvoiceService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to settle invoice")
  }
}

// Projections for a single invoice
const getMemberInvoiceProjections = {
  ...getMemberInvoicesProjections,
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
export async function getMemberInvoiceService(invoiceId: string) {
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

// Projections for member billing stats
const getMemberBillingStatsProjections = {
  totalPaid: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.amountPaid} ELSE 0 END), 0)`,
  outstanding: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'open' THEN ${invoices.amountDue} ELSE 0 END), 0)`,
  totalInvoices: sql<number>`COUNT(${invoices.id})`,
}

/**
 * Retrieves billing statistics for a member.
 *
 * @param memberId - The ID of the member to retrieve billing statistics for.
 * @returns The billing statistics for the member.
 * @throws {ServiceError} If the member is not found.
 */
export async function getMemberBillingStatsService(memberId: string) {
  try {
    const [stats] = await appdb
      .select(getMemberBillingStatsProjections)
      .from(invoices)
      .where(eq(invoices.memberId, memberId))

    return stats ?? { totalPaid: 0, outstanding: 0, totalInvoices: 0 }
  } catch (error) {
    console.error("getMemberBillingStatsService failed", error)
    throw new ServiceError("Failed to get member billing stats")
  }
}

/** Individual member invoice record type. */
export type MemberBillingStats = Awaited<
  ReturnType<typeof getMemberBillingStatsService>
>

const getMemberLatestInvoiceProjections = {
  id: invoices.id,
  invoiceNumber: invoices.invoiceNumber,
  status: invoices.status,
  subscriptionStatus: subscriptions.status,
  periodStart: invoices.periodStart,
  periodEnd: invoices.periodEnd,
  subscriptionPlan: plans.name,
  amount: invoices.subtotal,
}
export async function getMemberLatestInvoiceService(memberId: string) {
  try {
    const [invoice] = await appdb
      .select(getMemberLatestInvoiceProjections)
      .from(invoices)
      .innerJoin(subscriptions, eq(subscriptions.id, invoices.subscriptionId))
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(
        and(
          eq(invoices.memberId, memberId),
          inArray(invoices.status, ["paid", "open"])
        )
      )
      .orderBy(desc(invoices.periodEnd))
      .limit(1)
    if (!invoice) {
      return null
    }
    return invoice
  } catch (error) {
    console.error("getMemberLatestPaidInvoiceService failed", error)
    throw new ServiceError("Failed to get latest paid invoice")
  }
}

/** Individual member invoice record type. */
export type MemberLatestInvoice = Awaited<
  ReturnType<typeof getMemberLatestInvoiceService>
>

/**
 * Creates an invoice for a member.
 *
 * @param memberId - The ID of the member to create an invoice for.
 * @param data - The data for the invoice.
 * @returns True if the invoice was created successfully.
 * @throws {ServiceError} If the invoice could not be created.
 */
export async function createInvoiceService(
  memberId: string,
  data: IssueInvoiceFormValues
) {
  try {
    const latestInvoice = await getMemberLatestInvoiceService(memberId)
    const isLatestInvoiceScheduled = Boolean(
      latestInvoice?.subscriptionStatus === "scheduled"
    )

    const isLatestInvoicePaid = Boolean(latestInvoice?.status === "paid")

    if (isLatestInvoiceScheduled) {
      throw new ServiceError("Latest invoice is already scheduled.")
    }

    if (dayjs(data.periodEnd).isBefore(dayjs(data.periodStart))) {
      throw new ServiceError("Invoice period is invalid.")
    }

    await appdb.transaction(async (tx) => {
      const [plan] = await tx
        .select({
          id: plans.id,
          price: plans.price,
        })
        .from(plans)
        .where(eq(plans.id, data.planId))
        .limit(1)

      if (!plan) {
        throw new ServiceError("Plan not found")
      }

      if (plan.price <= data.discount) {
        throw new ServiceError(
          "Discount cannot be greater than or equal to total"
        )
      }

      const [subscription] = await tx
        .insert(subscriptions)
        .values({
          id: generateId(IdPrefix.SUBSCRIPTION),
          currentPeriodStart: new Date(data.periodStart),
          currentPeriodEnd: new Date(data.periodEnd),
          memberId: memberId,
          planId: plan.id,
          status: isLatestInvoicePaid ? "scheduled" : "inactive",
        })
        .returning()

      if (!subscription) {
        throw new ServiceError("Failed to create subscription")
      }

      await tx.insert(invoices).values({
        id: generateId(IdPrefix.INVOICE),
        memberId: memberId,
        subscriptionId: subscription.id,
        status: "open",
        subtotal: plan.price,
        discountAmount: data.discount,
        total: plan.price - data.discount,
        amountDue: plan.price - data.discount,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        dueAt: new Date(data.dueDate),
      })
    })

    return true
  } catch (error) {
    console.error("createInvoiceService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to create invoice")
  }
}

/** Individual member create invoice service response type. */
export type CreateInvoice = Awaited<ReturnType<typeof createInvoiceService>>
