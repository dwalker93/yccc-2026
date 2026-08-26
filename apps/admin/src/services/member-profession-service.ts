import { count, desc, eq } from "drizzle-orm"

import {
  actorType,
  EmploymentType,
  memberProfession,
} from "@workspace/shared/schemas"
import { generateId, IdPrefix } from "@workspace/shared/utils/generate-id"

import { appdb } from "@/lib/db"
import { ProfessionNotFoundError, ServiceError } from "@/services/errors"

/** Projection mapping fields for `getMemberProfessionService`. */
export const getMemberProfessionProjections = {
  id: memberProfession.id,
  employer: memberProfession.employer,
  jobTitle: memberProfession.jobTitle,
  location: memberProfession.location,
  employmentType: memberProfession.employmentType,
  startYear: memberProfession.startYear,
  startMonth: memberProfession.startMonth,
  endYear: memberProfession.endYear,
  endMonth: memberProfession.endMonth,
  isCurrent: memberProfession.isCurrent,
  isVerified: memberProfession.isVerified,
}

/**
 * Retrieves a paginated list of professional background records for a specific member.
 *
 * @param params - Object containing `memberId`, 1-based `pageIndex`, and `pageSize`.
 * @returns Object containing an array of profession records and the total count.
 */
export async function getMemberProfessionService({
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
        .select(getMemberProfessionProjections)
        .from(memberProfession)
        .where(eq(memberProfession.memberId, memberId))
        .orderBy(desc(memberProfession.startYear), desc(memberProfession.id))
        .limit(pageSize)
        .offset((pageIndex - 1) * pageSize),

      appdb
        .select({ total: count() })
        .from(memberProfession)
        .where(eq(memberProfession.memberId, memberId)),
    ])

    return {
      records,
      totalCount: countResult[0]?.total ?? 0,
    }
  } catch (error) {
    console.error("getMemberProfessionService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get member profession records")
  }
}

/** Individual member profession record type. */
export type MemberProfession = Awaited<
  ReturnType<typeof getMemberProfessionService>
>["records"][number]

/**
 * Verifies a member's profession record by updating its verification status.
 *
 * @param professionId - Unique identifier of the profession record to verify.
 * @param actionedBy - ID or identifier of the user/admin performing the verification.
 * @throws {ProfessionNotFoundError} If no profession record is found with the provided ID.
 */
export async function verifyMemberProfessionService(
  professionId: string,
  actionedBy: string
) {
  try {
    const [updated] = await appdb
      .update(memberProfession)
      .set({
        isVerified: true,
        updatedAt: new Date(),
        verifiedBy: actionedBy,
        verifiedAt: new Date(),
      })
      .where(eq(memberProfession.id, professionId))
      .returning({ id: memberProfession.id })

    if (!updated) {
      throw new ProfessionNotFoundError(professionId)
    }
  } catch (error) {
    console.error("verifyMemberProfessionService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to verify member profession")
  }
}

/**
 * Adds a new professional background record for a member.
 *
 * @param params - Object containing member and profession details.
 * @returns Created profession record.
 * @throws {ServiceError} If no profession record is created.
 */
export async function addMemberProfessionService({
  memberId,
  professionData,
  createdBy,
}: {
  memberId: string
  professionData: {
    employer: string
    jobTitle: string
    location: string
    employmentType: string
    startYear: number
    startMonth: number
    endYear: number | null
    endMonth: number | null
    isCurrent: boolean
  }
  createdBy: string
}) {
  const {
    employer,
    jobTitle,
    location,
    employmentType,
    startYear,
    startMonth,
    endYear,
    endMonth,
    isCurrent,
  } = professionData
  try {
    const [created] = await appdb
      .insert(memberProfession)
      .values({
        id: generateId(IdPrefix.PROFESSION),
        memberId,
        employer,
        jobTitle,
        location,
        employmentType: employmentType as EmploymentType,
        startYear,
        startMonth,
        endYear,
        endMonth,
        isCurrent,
        createdBy,
        createdByType: actorType.enumValues[1],
      })
      .returning(getMemberProfessionProjections)

    if (!created) {
      throw new ServiceError("Failed to create member profession record")
    }

    return created
  } catch (error) {
    console.error("addMemberProfessionService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to add member profession record")
  }
}
