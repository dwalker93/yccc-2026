import {
  BulkActionLimitExceededError,
  InvalidStatusTransitionError,
  InvoiceNotFoundError,
  MemberNotFoundError,
  MemberPlanNotAssignedError,
  NoMembersSelectedError,
  PlanNotFoundError,
  ServiceError,
} from "@/services/errors"
import { and, count, desc, eq, ilike, inArray, sql, SQL } from "drizzle-orm"

import {
  invoices,
  memberEducation,
  memberProfession,
  members,
  memberStatusHistory,
  paymentMethods,
  payments,
  plans,
  refunds,
  subscriptions,
} from "@workspace/shared/schemas"
import { generateId, IdPrefix } from "@workspace/shared/utils/generate-id"
import {
  MemberPasswordData,
  MemberPersonalInformationUpdateData,
} from "@workspace/shared/zod-schemas/member-input-schema"

import { type Status } from "@/config/data"
import { appdb, DBTransaction } from "@/lib/db"
import { SearchableColumn } from "@/app/(protected)/members/_components/data"

export { MemberNotFoundError }

/**
 * Escapes special SQL wildcard characters (`%`, `_`, `\`) in search strings for safe `ILIKE` pattern matching.
 *
 * @param s - Raw input search query string.
 * @returns Escaped search string safe for SQL `LIKE` / `ILIKE` clauses.
 */
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`)

/**
 * Field selection projections for `getMembersService`, tailored for different UI tables/views:
 * - `detailed`: Full member detail fields for general member listings.
 * - `pending`: Fields relevant to pending applications, including open invoice and pending payment details.
 * - `rejected`: Reason and notes for rejected applications.
 * - `suspended`: Subscription, expiry, and status history notes for suspended members.
 * - `banned`: Status history details for banned members.
 */
export const getMembersProjections = {
  detailed: {
    id: members.id,
    name: members.name,
    email: members.email,
    phone: members.phone,
    dateOfBirth: members.dateOfBirth,
    nic: members.nic,
    district: members.district,
    status: members.membershipStatus,
    memberSince: members.memberSince,
    expiry: members.subscriptionCurrentPeriodEnd,
    plan: plans.name,
  },
  pending: {
    id: members.id,
    name: members.name,
    email: members.email,
    phone: members.phone,
    nic: members.nic,
    memberSince: members.memberSince,
    plan: plans.name,
    paymentMethodName: paymentMethods.name,
    invoiceNumber: invoices.invoiceNumber,
    invoiceStatus: invoices.status,
    invoiceDueAt: invoices.dueAt,
  },
  rejected: {
    id: members.id,
    name: members.name,
    email: members.email,
    phone: members.phone,
    nic: members.nic,
    reason: memberStatusHistory.reason,
    note: memberStatusHistory.note,
  },
  suspended: {
    id: members.id,
    name: members.name,
    email: members.email,
    phone: members.phone,
    nic: members.nic,
    memberSince: members.memberSince,
    expiry: members.subscriptionCurrentPeriodEnd,
    plan: plans.name,
    reason: memberStatusHistory.reason,
    note: memberStatusHistory.note,
  },
  banned: {
    id: members.id,
    name: members.name,
    email: members.email,
    phone: members.phone,
    nic: members.nic,
    memberSince: members.memberSince,
    reason: memberStatusHistory.reason,
    note: memberStatusHistory.note,
  },
} as const

/**
 * Projection preset keys supported by `getMembersProjections`.
 */
export type GetMembersProjectionPreset = keyof typeof getMembersProjections

/**
 * Alias for `GetMembersProjectionPreset`.
 */
export type ProjectionPreset = GetMembersProjectionPreset

/**
 * Filter and pagination parameters for querying members via `getMembersService`.
 */
type GetMembersParams = {
  /** 1-based page index for pagination. */
  pageIndex: number
  /** Number of items to retrieve per page. */
  pageSize: number
  /** Optional search query string. */
  search?: string | null
  /** Specific member column to apply the search query against. */
  searchBy: SearchableColumn
  /** Filter members by one or more membership statuses. */
  status?: Status[]
  /** Filter members by plan names. */
  plan?: string[]
  /** Filter members by district. */
  district?: string[]
}

/**
 * Utility type to infer the raw data type of a Drizzle ORM column object.
 */
type InferColumnData<T> = T extends { _: { data: infer D } } ? D : never

/**
 * Utility type to map a Drizzle projection object to its resulting JavaScript value types.
 */
type InferProjection<T extends Record<string, any>> = {
  [K in keyof T]: InferColumnData<T[K]>
}

/**
 * Retrieves a paginated and filtered list of members with fields determined by the selected projection preset.
 *
 * Handles custom queries for history-backed statuses (rejected, suspended, banned) as well as open invoice/payment tracking for pending members.
 *
 * @template TProjection - Projection preset key (defaults to `"detailed"`).
 * @param params - Pagination, filtering, search options, and projection preset.
 * @returns Object containing the list of projected member records and the total count matching the criteria.
 */
export async function getMembersService<
  TProjection extends GetMembersProjectionPreset = "detailed",
>({
  pageIndex,
  pageSize,
  projection = "detailed" as TProjection,
  search,
  searchBy,
  status,
  plan,
  district,
}: GetMembersParams & { projection?: TProjection }): Promise<{
  members: Array<InferProjection<(typeof getMembersProjections)[TProjection]>>
  totalCount: number
}> {
  try {
    // Build shared where conditions
    const conditions: SQL[] = []
    if (search) {
      conditions.push(ilike(members[searchBy], `%${escapeLike(search)}%`))
    }
    if (status?.length) {
      conditions.push(inArray(members.membershipStatus, status))
    }
    if (plan?.length) {
      const matchingPlanIds = appdb
        .select({ id: plans.id })
        .from(plans)
        .where(
          and(
            inArray(
              sql`lower(${plans.name})`,
              plan.map((p) => p.toLowerCase())
            ),
            eq(plans.isActive, true)
          )
        )

      conditions.push(inArray(members.currentPlanId, matchingPlanIds))
    }
    if (district?.length) {
      conditions.push(inArray(members.district, district))
    }
    const whereClause = conditions.length ? and(...conditions) : undefined

    const selectFields = getMembersProjections[projection]
    const limit = Math.max(1, pageSize)
    const offset = Math.max(0, (Math.max(1, pageIndex) - 1) * limit)

    const isHistoryBackedProjection =
      projection === "rejected" ||
      projection === "suspended" ||
      projection === "banned"

    let memberDataPromise: Promise<any[]>
    let countPromise: Promise<{ count: number }[]>

    if (isHistoryBackedProjection) {
      // Only members with a matching latest history row (toStatus ===
      // projection) should ever appear — both in the paginated rows and in
      // the total count, or the two will drift apart.
      const latestHistory = appdb
        .select({
          memberId: memberStatusHistory.memberId,
          maxCreatedAt: sql<string>`max(${memberStatusHistory.createdAt})`.as(
            "max_created_at"
          ),
        })
        .from(memberStatusHistory)
        .where(eq(memberStatusHistory.toStatus, projection))
        .groupBy(memberStatusHistory.memberId)
        .as("latest_history")

      memberDataPromise = appdb
        .select(selectFields)
        .from(members)
        .leftJoin(plans, eq(members.currentPlanId, plans.id))
        .innerJoin(latestHistory, eq(members.id, latestHistory.memberId))
        .innerJoin(
          memberStatusHistory,
          and(
            eq(memberStatusHistory.memberId, latestHistory.memberId),
            eq(memberStatusHistory.createdAt, latestHistory.maxCreatedAt)
          )
        )
        .where(whereClause)
        .orderBy(desc(members.createdAt))
        .limit(limit)
        .offset(offset)

      countPromise = appdb
        .select({ count: count() })
        .from(members)
        .innerJoin(latestHistory, eq(members.id, latestHistory.memberId))
        .where(whereClause)
    } else if (projection === "pending") {
      // Scope to the member's open invoice and its pending payment. Both
      // subqueries are grouped down to one row per key (memberId /
      // invoiceId) as a dedup safety net, so the leftJoin chain can never
      // fan out into multiple rows per member.
      const openInvoice = appdb
        .select({
          memberId: invoices.memberId,
          maxId: sql<string>`max(${invoices.id})`.as("max_invoice_id"),
        })
        .from(invoices)
        .where(eq(invoices.status, "open"))
        .groupBy(invoices.memberId)
        .as("open_invoice")

      const pendingPayment = appdb
        .select({
          invoiceId: payments.invoiceId,
          maxId: sql<string>`max(${payments.id})`.as("max_payment_id"),
        })
        .from(payments)
        .where(eq(payments.status, "pending"))
        .groupBy(payments.invoiceId)
        .as("pending_payment")

      memberDataPromise = appdb
        .select(selectFields)
        .from(members)
        .leftJoin(plans, eq(members.currentPlanId, plans.id))
        .leftJoin(openInvoice, eq(members.id, openInvoice.memberId))
        .leftJoin(invoices, eq(invoices.id, openInvoice.maxId))
        .leftJoin(pendingPayment, eq(invoices.id, pendingPayment.invoiceId))
        .leftJoin(payments, eq(payments.id, pendingPayment.maxId))
        .leftJoin(
          paymentMethods,
          eq(payments.paymentMethodId, paymentMethods.id)
        )
        .where(whereClause)
        .orderBy(desc(members.createdAt))
        .limit(limit)
        .offset(offset)

      // Left joins above can't multiply member rows (both subqueries are
      // deduped to ≤1 row per key), so a plain member count still matches.
      countPromise = appdb
        .select({ count: count() })
        .from(members)
        .where(whereClause)
    } else {
      memberDataPromise = appdb
        .select(selectFields)
        .from(members)
        .leftJoin(plans, eq(members.currentPlanId, plans.id))
        .where(whereClause)
        .orderBy(desc(members.createdAt))
        .limit(limit)
        .offset(offset)

      countPromise = appdb
        .select({ count: count() })
        .from(members)
        .where(whereClause)
    }

    const [memberData, countResult] = await Promise.all([
      memberDataPromise,
      countPromise,
    ])

    return {
      members: memberData as InferProjection<
        (typeof getMembersProjections)[TProjection]
      >[],
      totalCount: countResult[0]?.count ?? 0,
    }
  } catch (error) {
    console.error("getMembersService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get members")
  }
}

/**
 * Map of member record types keyed by projection preset.
 */
export type Member = {
  [P in GetMembersProjectionPreset]: Awaited<
    ReturnType<typeof getMembersService<P>>
  >["members"][number]
}

// ---------------------------------------------------------------------------
// Approve / Reject / Suspend / Banned statuses change services
// ---------------------------------------------------------------------------

/**
 * Internal helper to execute member status transitions and record audit entries in `memberStatusHistory`.
 *
 * @param params - Transition options including database transaction, target status, reason, acting user, and optional suspension end date.
 */
async function changeMemberStatusService({
  tx: externalTx,
  memberId,
  toStatus,
  reason,
  actionedBy,
  note,
  suspendedUntil,
}: {
  tx?: DBTransaction
  memberId: string
  toStatus: Status
  reason: string
  actionedBy: string
  note?: string
  suspendedUntil?: Date
}) {
  try {
    const run = async (tx: DBTransaction) => {
      // read current status
      const [current] = await tx
        .select({ membershipStatus: members.membershipStatus })
        .from(members)
        .where(eq(members.id, memberId))
        .limit(1)
        .for("update")

      if (!current) throw new MemberNotFoundError(memberId)

      await tx
        .update(members)
        .set({
          membershipStatus: toStatus,
          suspendedUntil:
            toStatus === "suspended" ? (suspendedUntil ?? null) : null,
        })
        .where(eq(members.id, memberId))

      await tx.insert(memberStatusHistory).values({
        id: generateId(IdPrefix.HISTORY),
        memberId,
        fromStatus: current.membershipStatus, // ← always read, never hardcode
        toStatus,
        reason,
        note: note ?? null,
        actionedBy,
      })
    }

    // use external transaction if provided, otherwise create own
    if (externalTx) {
      await run(externalTx)
    } else {
      await appdb.transaction(run)
    }
  } catch (error) {
    console.error("changeMemberStatusService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to change member status")
  }
}

/**
 * Internal transactional operation for approving a member application.
 *
 * Creates active subscription, updates invoice/payment status for paid plans, sets member status to approved,
 * and records an entry in `memberStatusHistory`.
 *
 * @param params - Transaction context, member ID, actioning admin ID, reason, note, and payment reference details.
 */
async function approveMemberTx({
  tx,
  memberId,
  actionedBy,
  reason,
  note,
  paymentReference,
  paidAt = new Date(),
}: {
  tx: DBTransaction
  memberId: string
  actionedBy: string
  reason?: string
  note?: string
  paymentReference?: string
  paidAt?: Date
}) {
  try {
    // 1. read member + plan
    const [member] = await tx
      .select({
        membershipStatus: members.membershipStatus,
        currentPlanId: members.currentPlanId,
      })
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1)

    if (!member) throw new MemberNotFoundError(memberId)

    if (!["pending", "rejected"].includes(member.membershipStatus)) {
      throw new InvalidStatusTransitionError(
        `Cannot approve member with status: ${member.membershipStatus}`
      )
    }

    if (!member.currentPlanId) throw new MemberPlanNotAssignedError(memberId)

    const [plan] = await tx
      .select({ price: plans.price })
      .from(plans)
      .where(eq(plans.id, member.currentPlanId))
      .limit(1)

    if (!plan) throw new PlanNotFoundError(member.currentPlanId)

    const now = new Date()
    const isFree = plan.price === 0
    const periodEnd = isFree
      ? new Date("2099-12-31")
      : new Date(new Date(now).setFullYear(now.getFullYear() + 1))

    const defaultReason = isFree
      ? "Free plan membership approved"
      : "Payment confirmed — membership approved"

    // 2. insert subscription row
    const subscriptionId = generateId(IdPrefix.SUBSCRIPTION)
    await tx.insert(subscriptions).values({
      id: subscriptionId,
      memberId,
      planId: member.currentPlanId,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    })

    // 3. handle invoice + payment — only for paid plans
    if (!isFree) {
      const [existingInvoice] = await tx
        .select({ id: invoices.id })
        .from(invoices)
        .where(
          and(eq(invoices.memberId, memberId), eq(invoices.status, "open"))
        )
        .limit(1)

      if (!existingInvoice) throw new InvoiceNotFoundError(memberId)

      await tx
        .update(invoices)
        .set({
          subscriptionId,
          status: "paid",
          amountPaid: plan.price,
          amountDue: 0,
          periodStart: now,
          periodEnd,
          paidAt,
        })
        .where(eq(invoices.id, existingInvoice.id))

      const [updatedPayment] = await tx
        .update(payments)
        .set({
          status: "success",
          gatewayId: paymentReference ?? null,
          paidAt,
        })
        .where(
          and(
            eq(payments.invoiceId, existingInvoice.id),
            eq(payments.status, "pending")
          )
        )
        .returning({ id: payments.id })

      // One thing worth deciding, since it changes whether this throw is actually
      // correct: is there a legitimate path where approveMemberTx runs for a paid
      // plan with no payment row at all (e.g. an admin manually approves before any
      // payment attempt was recorded)? If that's a real flow, this throw would incorrectly
      // block it — you'd want to either create a payment row in that branch instead
      // of throwing, or only throw when a payment row exists but isn't "pending"
      // (e.g. already "success" from a race, or "failed"). If
      // manual-approval-without-a-payment-row isn't a thing in your flow, the throw above
      // is exactly right.
      if (!updatedPayment)
        throw new ServiceError(
          `No pending payment found for invoice: ${existingInvoice.id}`
        )
    }

    // 4. update member snapshot
    await tx
      .update(members)
      .set({
        membershipStatus: "approved",
        subscriptionStatus: "active",
        subscriptionCurrentPeriodEnd: periodEnd,
        memberSince: now,
      })
      .where(eq(members.id, memberId))

    // 5. write status history
    await tx.insert(memberStatusHistory).values({
      id: generateId(IdPrefix.HISTORY),
      memberId,
      fromStatus: member.membershipStatus,
      toStatus: "approved",
      reason: reason ?? defaultReason,
      note: note ?? null,
      actionedBy,
    })
  } catch (error) {
    console.error("approveMemberTx failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to approve member")
  }
}

/**
 * Approves a single member application and initializes their subscription and payment records.
 *
 * @param params - Approval details including member ID, actioning admin user ID, reason, note, payment reference, and payment timestamp.
 */
export async function approveMemberService({
  memberId,
  actionedBy,
  reason,
  note,
  paymentReference,
  paidAt,
}: {
  memberId: string
  actionedBy: string
  reason?: string
  note?: string
  paymentReference?: string
  paidAt?: Date
}) {
  try {
    await appdb.transaction((tx) =>
      approveMemberTx({
        tx,
        memberId,
        actionedBy,
        reason,
        note,
        paymentReference,
        paidAt,
      })
    )
  } catch (error) {
    console.error("approveMemberService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to approve member")
  }
}

/**
 * Bulk approves multiple member applications in a single database transaction (maximum 10 members per batch).
 * Intended for free plan applications or pre-verified members.
 *
 * @param params - Batch approval parameters containing array of member IDs, actioning admin ID, optional reason, and notes.
 */
export async function bulkApproveMemberService({
  memberIds,
  actionedBy,
  reason,
  note,
}: {
  memberIds: string[]
  actionedBy: string
  reason?: string
  note?: string
}) {
  try {
    if (memberIds.length === 0) throw new NoMembersSelectedError()
    if (memberIds.length > 10) throw new BulkActionLimitExceededError(10)

    await appdb.transaction(async (tx) => {
      for (const memberId of memberIds) {
        await approveMemberTx({ tx, memberId, actionedBy, reason, note })
      }
    })
  } catch (error) {
    console.error("bulkApproveMemberService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to bulk approve members")
  }
}

/**
 * Rejects a member application and logs the rejection reason into status history.
 *
 * @param params - Rejection parameters containing member ID, actioning admin ID, mandatory reason, and optional notes.
 */
export async function rejectMemberService({
  memberId,
  actionedBy,
  reason,
  note,
}: {
  memberId: string
  actionedBy: string
  reason: string
  note?: string
}) {
  try {
    await changeMemberStatusService({
      memberId,
      toStatus: "rejected",
      reason,
      actionedBy,
      note,
    })
  } catch (error) {
    console.error("rejectMemberService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to reject member")
  }
}

/**
 * Suspends an active member with an optional end date and records the suspension in status history.
 *
 * @param params - Suspension parameters containing member ID, actioning admin ID, reason, optional notes, and suspension expiry date.
 */
export async function suspendMemberService({
  memberId,
  actionedBy,
  reason,
  note,
  suspendedUntil,
}: {
  memberId: string
  actionedBy: string
  reason: string
  note?: string
  suspendedUntil?: Date
}) {
  try {
    await changeMemberStatusService({
      memberId,
      toStatus: "suspended",
      reason,
      actionedBy,
      note,
      suspendedUntil,
    })
  } catch (error) {
    console.error("suspendMemberService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to suspend member")
  }
}

/**
 * Bans a member from the platform and logs the ban reason in status history.
 *
 * @param params - Ban parameters containing member ID, actioning admin ID, mandatory reason, and optional notes.
 */
export async function banMemberService({
  memberId,
  actionedBy,
  reason,
  note,
}: {
  memberId: string
  actionedBy: string
  reason: string
  note?: string
}) {
  try {
    await changeMemberStatusService({
      memberId,
      toStatus: "banned",
      reason,
      actionedBy,
      note,
    })
  } catch (error) {
    console.error("banMemberService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to ban member")
  }
}

/**
 * Reinstates a suspended, banned, or rejected member back to approved status.
 *
 * @param params - Reinstatement parameters containing member ID, actioning admin/system ID, optional reason, and notes.
 */
export async function reinstateMemberService({
  memberId,
  actionedBy,
  reason,
  note,
}: {
  memberId: string
  actionedBy: string
  reason?: string
  note?: string
}) {
  try {
    await changeMemberStatusService({
      memberId,
      toStatus: "approved",
      reason:
        reason ??
        (actionedBy === "system"
          ? "Suspension period expired — auto reinstated"
          : "Member reinstated by admin"),
      actionedBy,
      note,
    })
  } catch (error) {
    console.error("reinstateMemberService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to reinstate member")
  }
}

/** Shared SQL expression fragment calculating open invoice count correlated to `members.id`. */
const openInvoicesCountSql = sql<number>`(
  SELECT count(*)::int FROM ${invoices}
  WHERE ${invoices}.member_id = ${members}.id
  AND ${invoices}.invoice_status = 'open'
)`

/** Parameters for `getMemberMetadata`. */
type GetMemberMetadataParams = {
  id: string
}

/** Projection mapping fields for `getMemberMetadata`. */
const getMemberMetadataProjections = {
  id: members.id,
  name: members.name,
  status: members.membershipStatus,
  currentPlanId: members.currentPlanId,

  openInvoicesCount: openInvoicesCountSql,

  unverifiedEducationCount: sql<number>`(
    SELECT count(*)::int FROM ${memberEducation}
    WHERE ${memberEducation}.member_id = ${members}.id
    AND ${memberEducation}.is_verified = false
  )`,

  unverifiedProfessionsCount: sql<number>`(
    SELECT count(*)::int FROM ${memberProfession}
    WHERE ${memberProfession}.member_id = ${members}.id
    AND ${memberProfession}.is_verified = false
  )`,
}

/**
 * Retrieves cached member metadata including status, unverified education/profession counts, and open invoices.
 *
 * Results are cached using Next.js `unstable_cache` tagged by member ID.
 *
 * @param params - Object containing the target member ID.
 * @returns Cached metadata summary for the specified member.
 * @throws {MemberNotFoundError} If no member exists with the provided ID.
 */
export async function getMemberMetadata({ id }: GetMemberMetadataParams) {
  try {
    const [result] = await appdb
      .select(getMemberMetadataProjections)
      .from(members)
      .where(eq(members.id, id))
      .limit(1)

    if (!result) throw new MemberNotFoundError(id)
    return result
  } catch (error) {
    console.error("getMemberMetadata failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get member metadata")
  }
}

/** Member metadata type definition derived from `getMemberMetadata`. */
export type MemberMetadata = Awaited<ReturnType<typeof getMemberMetadata>>

/** Projection mapping fields for `getMemberProfile`. */
const getMemberProfileProjections = {
  id: members.id,
  name: members.name,
  email: members.email,
  photo: members.photo,
  phone: members.phone,
  whatsapp: members.whatsapp,
  nic: members.nic,
  dateOfBirth: members.dateOfBirth,
  membershipStatus: members.membershipStatus,
  memberSince: members.memberSince,
  city: members.city,
  district: members.district,
  addressLine1: members.addressLine1,
  addressLine2: members.addressLine2,
}

/**
 * Retrieves core profile fields for a member (contact info, demography, status).
 *
 * @param id - Unique member identifier.
 * @returns Member profile details object.
 * @throws {MemberNotFoundError} If the member does not exist.
 */
export async function getMemberProfile(id: string) {
  try {
    const [result] = await appdb
      .select(getMemberProfileProjections)
      .from(members)
      .where(eq(members.id, id))
      .limit(1)

    if (!result) throw new MemberNotFoundError(id)
    return result
  } catch (error) {
    console.error("getMemberProfile failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get member profile")
  }
}

/**
 * Projection mapping fields for `getActiveSubscription`.
 *
 * - `startDate` is read directly from the joined active subscription row.
 * - `endDate` uses a subquery to find the latest paid period end, which may
 *   come from a `scheduled` successor (prepaid renewal) rather than the
 *   current active row.
 */
const getActiveSubscriptionProjections = {
  plan: plans.name,
  subscriptionStatus: subscriptions.status,
  startDate: subscriptions.currentPeriodStart,
  endDate: sql<Date>`(
    SELECT s.current_period_end::timestamp
    FROM ${subscriptions} s
    WHERE s.member_id = ${members}.id
      AND s.status IN ('active', 'scheduled')
      AND EXISTS (
        SELECT 1
        FROM ${invoices} i
        WHERE i.subscription_id = s.id
          AND i.invoice_status = 'paid'
      )
    ORDER BY s.current_period_end DESC
    LIMIT 1
  )`,
}

/**
 * Retrieves active subscription details (plan name, status, start/end dates) for a member.
 *
 * @param id - Unique member identifier.
 * @returns Active subscription details object.
 * @throws {PlanNotFoundError} If no active subscription plan is found for the member.
 */
export async function getActiveSubscription(id: string) {
  try {
    const [result] = await appdb
      .select(getActiveSubscriptionProjections)
      .from(members)
      .innerJoin(plans, eq(members.currentPlanId, plans.id))
      .innerJoin(
        subscriptions,
        and(eq(subscriptions.memberId, id), eq(subscriptions.status, "active"))
      )
      .where(eq(members.id, id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1)

    if (!result) throw new PlanNotFoundError(id)

    return result
  } catch (error) {
    console.error("getActiveSubscription failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get active subscription")
  }
}

/** Projection mapping fields for `getMemberFinancials`. */
const getMemberFinancialsProjections = {
  id: members.id,

  totalCollected: sql<number>`(
    SELECT COALESCE(SUM(${payments}.amount), 0)::int
    FROM ${payments}
    WHERE ${payments}.member_id = ${members}.id
    AND ${payments}.payment_status = 'success'
  )`,

  totalRefunded: sql<number>`(
    SELECT COALESCE(SUM(${refunds}.amount), 0)::int
    FROM ${refunds}
    INNER JOIN ${payments} ON ${refunds}.payment_id = ${payments}.id
    WHERE ${payments}.member_id = ${members}.id
  )`,

  openInvoicesCount: openInvoicesCountSql,

  currentExpiryDate: sql<string | null>`(
  SELECT ${subscriptions}.current_period_end
  FROM ${subscriptions}
  WHERE ${subscriptions}.member_id = ${members}.id
  AND ${subscriptions}.status IN ('active', 'scheduled')
  AND EXISTS (
    SELECT 1 FROM ${invoices}
    WHERE ${invoices}.subscription_id = ${subscriptions}.id
    AND ${invoices}.invoice_status = 'paid'
  )
  ORDER BY ${subscriptions}.created_at DESC
  LIMIT 1
)`,
}

/**
 * Computes financial metrics for a member including total collected, total refunded, net total paid, open invoice count, and current expiry date.
 *
 * @param id - Unique member identifier.
 * @returns Financial overview object for the member.
 * @throws {MemberNotFoundError} If the member does not exist.
 */
async function getMemberFinancials(id: string) {
  try {
    const [result] = await appdb
      .select(getMemberFinancialsProjections)
      .from(members)
      .where(eq(members.id, id))
      .limit(1)

    if (!result) throw new MemberNotFoundError(id)

    return {
      ...result,
      totalPaid: result.totalCollected - result.totalRefunded,
    }
  } catch (error) {
    console.error("getMemberFinancials failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get member financials")
  }
}

/** Projection mapping fields for `getCurrentRole`. */
const getCurrentRoleProjections = {
  jobTitle: memberProfession.jobTitle,
  employer: memberProfession.employer,
  location: memberProfession.location,
  startYear: memberProfession.startYear,
  isVerified: memberProfession.isVerified,
}

/**
 * Retrieves the member's current active professional role.
 *
 * @param id - Unique member identifier.
 * @returns Professional role object if set, or undefined.
 */
async function getCurrentRole(id: string) {
  try {
    const [result] = await appdb
      .select(getCurrentRoleProjections)
      .from(memberProfession)
      .where(
        and(
          eq(memberProfession.memberId, id),
          eq(memberProfession.isCurrent, true)
        )
      )
      .limit(1)

    return result
  } catch (error) {
    console.error("getCurrentRole failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get current role")
  }
}

/**
 * Retrieves administrative remarks for a member.
 *
 * @param id - Unique member identifier.
 * @returns Object containing member remarks, or undefined.
 */
async function getMemberRemarks(id: string) {
  try {
    const [result] = await appdb
      .select({ remarks: members.remarks })
      .from(members)
      .where(eq(members.id, id))
      .limit(1)

    return result
  } catch (error) {
    console.error("getMemberRemarks failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get member remarks")
  }
}

/**
 * Fetches a comprehensive overview of a member's record by combining profile, active subscription, financial summary, current role, and admin remarks in parallel.
 *
 * @param id - Unique member identifier.
 * @returns Combined overview object for the member detail view.
 * @throws {MemberNotFoundError} If the member does not exist.
 * @throws {Error} If fetching overview fails for other database/system errors.
 */
export async function getMemberOverviewService(id: string) {
  try {
    const [profile, subscription, financials, role, remarks] =
      await Promise.all([
        getMemberProfile(id), // members table, sidebar fields
        getActiveSubscription(id), // subscriptions table, 1 row
        getMemberFinancials(id), // total paid, open invoices, expiry — invoices/subscriptions
        getCurrentRole(id), // memberProfession where isCurrent
        getMemberRemarks(id), // members.adminRemarks or a remarks table
      ])

    return { profile, subscription, financials, role, remarks }
  } catch (error) {
    console.error("getMemberOverviewService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get member overview")
  }
}

/** Member profile type derived from `getMemberProfile`. */
export type MemberProfile = Awaited<ReturnType<typeof getMemberProfile>>
/** Member active subscription type derived from `getActiveSubscription`. */
export type MemberSubscription = Awaited<
  ReturnType<typeof getActiveSubscription>
>
/** Member financial summary type derived from `getMemberFinancials`. */
export type MemberFinancials = Awaited<ReturnType<typeof getMemberFinancials>>
/** Member current role type derived from `getCurrentRole`. */
export type MemberCurrentRole = Awaited<ReturnType<typeof getCurrentRole>>
/** Member remarks type derived from `getMemberRemarks`. */
export type MemberRemarks = Awaited<ReturnType<typeof getMemberRemarks>>
/** Complete member overview type derived from `getMemberOverviewService`. */
export type MemberOverview = Awaited<
  ReturnType<typeof getMemberOverviewService>
>

/**
 * Updates a member's personal information.
 *
 * @param id - Unique member identifier.
 * @param data - Member personal information.
 * @throws {MemberNotFoundError} If the member does not exist.
 * @throws {Error} If updating member personal information fails for other database/system errors.
 */
export async function updateMemberPersonalInformationService(
  id: string,
  data: MemberPersonalInformationUpdateData
) {
  const { firstName, lastName, ...restData } = data
  const name = [firstName, lastName].filter(Boolean).join(" ").trim()

  try {
    const [result] = await appdb
      .update(members)
      .set({ ...restData, name })
      .where(eq(members.id, id))
      .returning()

    if (!result) throw new MemberNotFoundError(id)
    return result
  } catch (error) {
    console.error("updateMemberPersonalInformationService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to update member personal information")
  }
}

/**
 * Deletes a member and cascades deletion of all dependent records
 * (refunds, payments, invoices, subscriptions, education, profession, status history).
 *
 * @param id - Unique member identifier.
 * @throws {MemberNotFoundError} If the member does not exist.
 * @throws {ServiceError} If deleting member fails for other database/system errors.
 */
export async function deleteMemberService(id: string) {
  try {
    return await appdb.transaction(async (tx) => {
      const [existingMember] = await tx
        .select({ id: members.id, email: members.email })
        .from(members)
        .where(eq(members.id, id))
        .limit(1)

      if (!existingMember) throw new MemberNotFoundError(id)

      // 1. Delete refunds associated with member payments
      const memberPayments = await tx
        .select({ id: payments.id })
        .from(payments)
        .where(eq(payments.memberId, id))

      if (memberPayments.length > 0) {
        await tx.delete(refunds).where(
          inArray(
            refunds.paymentId,
            memberPayments.map((p) => p.id)
          )
        )
      }

      // 2. Cascade delete dependent child records
      await tx.delete(payments).where(eq(payments.memberId, id))
      await tx.delete(invoices).where(eq(invoices.memberId, id))
      await tx.delete(subscriptions).where(eq(subscriptions.memberId, id))
      await tx.delete(memberEducation).where(eq(memberEducation.memberId, id))
      await tx.delete(memberProfession).where(eq(memberProfession.memberId, id))
      await tx
        .delete(memberStatusHistory)
        .where(eq(memberStatusHistory.memberId, id))

      // 3. Delete member record
      const [result] = await tx
        .delete(members)
        .where(eq(members.id, id))
        .returning()

      if (!result) throw new MemberNotFoundError(id)

      const clerkUserResponse = await fetch(
        `${process.env.CLERK_BACKEND_API_URL}/users?email_address=${encodeURIComponent(result.email)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        }
      )

      if (!clerkUserResponse.ok) {
        throw new ServiceError("Failed to look up user in Clerk")
      }

      const [clerkUser] = await clerkUserResponse.json()

      if (!clerkUser) throw new MemberNotFoundError(id)

      const clerkUserDeleteResponse = await fetch(
        `${process.env.CLERK_BACKEND_API_URL}/users/${clerkUser.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        }
      )

      if (!clerkUserDeleteResponse.ok) {
        const errorBody = await clerkUserDeleteResponse.json().catch(() => null)
        const detail =
          errorBody?.errors?.[0]?.long_message ||
          errorBody?.errors?.[0]?.message
        throw new ServiceError(detail || "Failed to delete member in Clerk")
      }

      return result.id
    })
  } catch (error) {
    console.error("deleteMemberService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to delete member")
  }
}

/**
 * soft delete a member.
 *
 * @param id - Unique member identifier.
 * @throws {MemberNotFoundError} If the member does not exist.
 * @throws {Error} If deleting member fails for other database/system errors.
 */
// export async function softDeleteMemberService(id: string) {
//   try {
//     const [result] = await appdb
//       .update(members)
//       .set({ isDeleted: true })
//       .where(eq(members.id, id))
//       .returning()

//     if (!result) throw new MemberNotFoundError(id)
//     return result
//   } catch (error) {
//     console.error("softDeleteMemberService failed", error)
//     throw new Error("Failed to delete member")
//   }
// }

/**
 * Updates a member's password.
 *
 * @param memberId - Unique member identifier.
 * @param data - Member password data.
 * @throws {MemberNotFoundError} If the member does not exist.
 * @throws {Error} If updating member password fails for other database/system errors.
 */
export async function updateMemberPasswordService(
  memberId: string,
  data: MemberPasswordData
) {
  try {
    const [result] = await appdb
      .select({ email: members.email })
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1)

    if (!result) throw new MemberNotFoundError(memberId)

    const clerkUserResponse = await fetch(
      `${process.env.CLERK_BACKEND_API_URL}/users?email_address=${encodeURIComponent(result.email)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }
    )

    if (!clerkUserResponse.ok) {
      throw new ServiceError("Failed to look up user in Clerk")
    }

    const [clerkUser] = await clerkUserResponse.json()

    if (!clerkUser) throw new MemberNotFoundError(memberId)

    const clerkUserPasswordUpdateResponse = await fetch(
      `${process.env.CLERK_BACKEND_API_URL}/users/${clerkUser.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          password: data.newPassword,
          sign_out_of_other_sessions: data.signOutOfAllSessions,
          skip_password_checks: data.skipPasswordChecks,
        }),
      }
    )

    if (!clerkUserPasswordUpdateResponse.ok) {
      const errorBody = await clerkUserPasswordUpdateResponse
        .json()
        .catch(() => null)
      const detail =
        errorBody?.errors?.[0]?.long_message || errorBody?.errors?.[0]?.message
      throw new ServiceError(detail || "Failed to update password in Clerk")
    }

    return true
  } catch (error) {
    console.error("updateMemberPasswordService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to update member password")
  }
}
