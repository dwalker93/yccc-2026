import { and, count, desc, eq, ilike, inArray, sql, SQL } from "drizzle-orm"

import {
  invoices,
  members,
  memberStatusHistory,
  paymentMethods,
  payments,
  plans,
  subscriptions,
} from "@workspace/shared/schemas"
import {
  generateId,
  generateMshId,
  IdPrefix,
} from "@workspace/shared/utils/generate-id"

import { type Status } from "@/config/data"
import { appdb, DBTransaction } from "@/lib/db"
import { SearchableColumn } from "@/app/(protected)/members/_components/data"

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`)

export const projections = {
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
  },
  banned: {
    id: members.id,
    name: members.name,
    email: members.email,
    phone: members.phone,
    nic: members.nic,
    memberSince: members.memberSince,
  },
} as const

export type ProjectionPreset = keyof typeof projections

type GetMembersParams = {
  pageIndex: number
  pageSize: number
  search?: string | null
  searchBy: SearchableColumn
  status?: Status[]
  plan?: string[]
  district?: string[]
}

type InferColumnData<T> = T extends { _: { data: infer D } } ? D : never

type InferProjection<T extends Record<string, any>> = {
  [K in keyof T]: InferColumnData<T[K]>
}

export async function getMembersService<
  TProjection extends ProjectionPreset = "detailed",
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
  members: Array<InferProjection<(typeof projections)[TProjection]>>
  totalCount: number
}> {
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

  const selectFields = projections[projection]

  const isHistoryBackedProjection =
    projection === "rejected" ||
    projection === "suspended" ||
    projection === "banned"

  // For history-backed projections, only members with a matching latest
  // history row (toStatus === projection) should ever appear — both in the
  // paginated rows and in the total count, or the two will drift apart.
  const latestHistory = isHistoryBackedProjection
    ? appdb
        .select({
          memberId: memberStatusHistory.memberId,
          maxId: sql<string>`max(${memberStatusHistory.id})`.as(
            "max_history_id"
          ),
        })
        .from(memberStatusHistory)
        .where(eq(memberStatusHistory.toStatus, projection))
        .groupBy(memberStatusHistory.memberId)
        .as("latest_history")
    : undefined

  const [memberData, countResult] = await Promise.all([
    latestHistory
      ? appdb
          .select(selectFields)
          .from(members)
          .leftJoin(plans, eq(members.currentPlanId, plans.id))
          .innerJoin(latestHistory, eq(members.id, latestHistory.memberId))
          .innerJoin(
            memberStatusHistory,
            eq(memberStatusHistory.id, latestHistory.maxId)
          )
          .where(whereClause)
          .orderBy(desc(members.createdAt))
          .limit(Math.max(1, pageSize))
          .offset(
            Math.max(0, (Math.max(1, pageIndex) - 1) * Math.max(1, pageSize))
          )
      : projection === "pending"
        ? appdb
            .select(selectFields)
            .from(members)
            .leftJoin(plans, eq(members.currentPlanId, plans.id))
            .leftJoin(invoices, eq(members.id, invoices.memberId))
            .leftJoin(payments, eq(invoices.id, payments.invoiceId))
            .leftJoin(
              paymentMethods,
              eq(payments.paymentMethodId, paymentMethods.id)
            )
            .where(whereClause)
            .orderBy(desc(members.createdAt))
            .limit(Math.max(1, pageSize))
            .offset(
              Math.max(0, (Math.max(1, pageIndex) - 1) * Math.max(1, pageSize))
            )
        : appdb
            .select(selectFields)
            .from(members)
            .leftJoin(plans, eq(members.currentPlanId, plans.id))
            .where(whereClause)
            .orderBy(desc(members.createdAt))
            .limit(Math.max(1, pageSize))
            .offset(
              Math.max(0, (Math.max(1, pageIndex) - 1) * Math.max(1, pageSize))
            ),

    latestHistory
      ? appdb
          .select({ count: count() })
          .from(members)
          .innerJoin(latestHistory, eq(members.id, latestHistory.memberId))
          .where(whereClause)
      : appdb.select({ count: count() }).from(members).where(whereClause),
  ])

  return {
    members: memberData as InferProjection<(typeof projections)[TProjection]>[],
    totalCount: countResult[0]?.count ?? 0,
  }
}

export type Member = {
  [P in ProjectionPreset]: Awaited<
    ReturnType<typeof getMembersService<P>>
  >["members"][number]
}

// ---------------------------------------------------------------------------
// Approve / Reject / Suspend / Banned statuses change services
// ---------------------------------------------------------------------------

// core — handles all status transitions
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
  const run = async (tx: DBTransaction) => {
    // read current status
    const [current] = await tx
      .select({ membershipStatus: members.membershipStatus })
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1)

    if (!current) throw new Error("Member not found")

    await tx
      .update(members)
      .set({
        membershipStatus: toStatus,
        suspendedUntil:
          toStatus === "suspended" ? (suspendedUntil ?? null) : null,
      })
      .where(eq(members.id, memberId))

    await tx.insert(memberStatusHistory).values({
      id: generateMshId(),
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
}

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
  // 1. read member + plan
  const [member] = await tx
    .select({
      membershipStatus: members.membershipStatus,
      currentPlanId: members.currentPlanId,
    })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1)

  if (!member) throw new Error(`Member not found: ${memberId}`)

  if (!["pending", "rejected"].includes(member.membershipStatus)) {
    throw new Error(
      `Cannot approve member with status: ${member.membershipStatus}`
    )
  }

  if (!member.currentPlanId) throw new Error("Member has no plan assigned")

  const [plan] = await tx
    .select({ price: plans.price })
    .from(plans)
    .where(eq(plans.id, member.currentPlanId))
    .limit(1)

  if (!plan) throw new Error(`Plan not found: ${member.currentPlanId}`)

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
      .where(and(eq(invoices.memberId, memberId), eq(invoices.status, "open")))
      .limit(1)

    if (!existingInvoice)
      throw new Error(`No open invoice found for member: ${memberId}`)

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

    await tx
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
    id: generateMshId(),
    memberId,
    fromStatus: member.membershipStatus,
    toStatus: "approved",
    reason: reason ?? defaultReason,
    note: note ?? null,
    actionedBy,
  })
}

// ── single approve ──────────────────────────────────────────────────────────
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
}

// ── bulk approve ────────────────────────────────────────────────────────────
// Bulk approve has no paymentReference or paidAt — bulk approval is for free
// plan members or already gateway-confirmed members. Manual bank transfer/cash
// confirmations are always one at a time since each needs individual
// slip verification.
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
  if (memberIds.length === 0) throw new Error("No members selected")
  if (memberIds.length > 10)
    throw new Error("Maximum 10 members per bulk approve")

  await appdb.transaction(async (tx) => {
    await Promise.all(
      memberIds.map((memberId) =>
        approveMemberTx({ tx, memberId, actionedBy, reason, note })
      )
    )
  })
}

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
  await changeMemberStatusService({
    memberId,
    toStatus: "rejected",
    reason,
    actionedBy,
    note,
  })
}

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
  await changeMemberStatusService({
    memberId,
    toStatus: "suspended",
    reason,
    actionedBy,
    note,
    suspendedUntil,
  })
}

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
  await changeMemberStatusService({
    memberId,
    toStatus: "banned",
    reason,
    actionedBy,
    note,
  })
}

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
}
