import { unstable_cache } from "next/cache"
import dayjs from "dayjs"
import { and, eq, sql } from "drizzle-orm"

import {
  invoices,
  memberEducation,
  memberProfession,
  members,
  payments,
  plans,
  refunds,
  subscriptions,
} from "@workspace/shared/schemas"

import { appdb } from "@/lib/db"

type GetMemberMetadataParams = {
  id: string
}

const getMemberMetadataProjections = {
  id: members.id,
  name: members.name,
  status: members.membershipStatus,
  currentPlanId: members.currentPlanId,

  openInvoicesCount: sql<number>`(
    SELECT count(*)::int FROM ${invoices}
    WHERE ${invoices}.member_id = ${members}.id
    AND ${invoices}.invoice_status = 'open'
  )`,

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

export class MemberNotFoundError extends Error {
  constructor(id: string) {
    super(`Member not found: ${id}`)
    this.name = "MemberNotFoundError"
  }
}

export async function getMemberMetadata({ id }: GetMemberMetadataParams) {
  return unstable_cache(
    async () => {
      const [result] = await appdb
        .select(getMemberMetadataProjections)
        .from(members)
        .where(eq(members.id, id))
        .limit(1)

      if (!result) throw new MemberNotFoundError(id)
      return result
    },
    ["member-metadata", id],
    { tags: [`member-${id}-metadata`] }
  )()
}

export type MemberMetadata = Awaited<ReturnType<typeof getMemberMetadata>>

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

async function getMemberProfile(id: string) {
  const [result] = await appdb
    .select(getMemberProfileProjections)
    .from(members)
    .where(eq(members.id, id))
    .limit(1)

  if (!result) throw new MemberNotFoundError(id)
  return result
}

const getActiveSubscriptionProjections = {
  plan: plans.name,
  subscriptionStatus: subscriptions.status,
  startDate: subscriptions.currentPeriodStart,
  endDate: subscriptions.currentPeriodEnd,
}

async function getActiveSubscription(id: string) {
  const [result] = await appdb
    .select(getActiveSubscriptionProjections)
    .from(members)
    .leftJoin(plans, eq(members.currentPlanId, plans.id))
    .leftJoin(subscriptions, eq(subscriptions.memberId, id))
    .where(eq(members.id, id))
    .limit(1)

  if (!result?.plan)
    throw new Error(`Subscription plan not found for member: ${id}`)

  return result
}

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

  openInvoicesCount: sql<number>`(
    SELECT count(*)::int FROM ${invoices}
    WHERE ${invoices}.member_id = ${members}.id
    AND ${invoices}.invoice_status = 'open'
  )`,

  currentExpiryDate: sql<string | null>`(
  SELECT ${subscriptions}.current_period_end
  FROM ${subscriptions}
  WHERE ${subscriptions}.member_id = ${members}.id
  AND ${subscriptions}.status NOT IN ('expired', 'scheduled')
  LIMIT 1
)`,
}

async function getMemberFinancials(id: string) {
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
}

const getCurrentRoleProjections = {
  jobTitle: memberProfession.jobTitle,
  employer: memberProfession.employer,
  location: memberProfession.location,
  startYear: memberProfession.startYear,
  isVerified: memberProfession.isVerified,
}

async function getCurrentRole(id: string) {
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
}

async function getMemberRemarks(id: string) {
  const [result] = await appdb
    .select({ remarks: members.remarks })
    .from(members)
    .where(eq(members.id, id))
    .limit(1)

  return result
}

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
    if (error instanceof MemberNotFoundError) {
      throw error
    }
    throw new Error("Failed to get member overview")
  }
}

export type MemberProfile = Awaited<ReturnType<typeof getMemberProfile>>
export type MemberSubscription = Awaited<
  ReturnType<typeof getActiveSubscription>
>
export type MemberFinancials = Awaited<ReturnType<typeof getMemberFinancials>>
export type MemberCurrentRole = Awaited<ReturnType<typeof getCurrentRole>>
export type MemberRemarks = Awaited<ReturnType<typeof getMemberRemarks>>
export type MemberOverview = Awaited<
  ReturnType<typeof getMemberOverviewService>
>
