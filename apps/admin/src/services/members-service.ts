import { and, count, desc, eq, ilike, inArray, sql, SQL } from "drizzle-orm"

import {
  members,
  memberStatusHistory,
} from "@workspace/shared/schemas/member-schema"
import { plans } from "@workspace/shared/schemas/subscription-plans-schema"
import { generateId, IdPrefix } from "@workspace/shared/utils/generate-id"

import { appdb, DBTransaction } from "@/lib/db"
import {
  SearchableColumn,
  Status,
} from "@/app/(protected)/members/_components/data"

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

  const [memberData, countResult] = await Promise.all([
    projection === "rejected" ||
    projection === "suspended" ||
    projection === "banned"
      ? (() => {
          const latestHistory = appdb
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

          return appdb
            .select(selectFields)
            .from(members)
            .leftJoin(plans, eq(members.currentPlanId, plans.id))
            .leftJoin(latestHistory, eq(members.id, latestHistory.memberId))
            .leftJoin(
              memberStatusHistory,
              eq(memberStatusHistory.id, latestHistory.maxId)
            )
            .where(whereClause)
            .orderBy(desc(members.createdAt))
            .limit(Math.max(1, pageSize))
            .offset(
              Math.max(0, (Math.max(1, pageIndex) - 1) * Math.max(1, pageSize))
            )
        })()
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

    appdb.select({ count: count() }).from(members).where(whereClause),
  ])

  return {
    members: memberData as InferProjection<(typeof projections)[TProjection]>[],
    totalCount: countResult[0]?.count ?? 0,
  }
}

export type Member = Awaited<
  ReturnType<typeof getMembersService>
>["members"][number]

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
    // read current status — never hardcode fromStatus
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
      id: generateId(IdPrefix.MEMBER_STATUS_HISTORY),
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

export async function approveMemberService({
  memberId,
  actionedBy,
  reason = "Payment confirmed — membership approved",
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
    reason,
    actionedBy,
    note,
  })
}

export async function bulkApproveMemberService({
  memberIds,
  actionedBy,
  reason = "Membership approved",
  note,
}: {
  memberIds: string[]
  actionedBy: string
  reason?: string
  note?: string
}) {
  if (memberIds.length === 0) {
    throw new Error("No members selected")
  }

  await appdb.transaction(async (tx) => {
    await Promise.all(
      memberIds.map((memberId) =>
        changeMemberStatusService({
          tx,
          memberId,
          toStatus: "approved",
          reason,
          actionedBy,
          note,
        })
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
  reason = "Suspension period expired — auto reinstated",
  note,
}: {
  memberId: string
  actionedBy: string
  reason: string
  note?: string
}) {
  await changeMemberStatusService({
    memberId,
    toStatus: "approved",
    reason,
    actionedBy,
    note,
  })
}
