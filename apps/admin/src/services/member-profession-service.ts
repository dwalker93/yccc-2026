import {
  ProfessionNotFoundError,
  ServiceError,
  ValidationError,
} from "@/services/errors"
import { count, desc, eq } from "drizzle-orm"

import { EmploymentType, memberProfession } from "@workspace/shared/schemas"
import { generateId, IdPrefix } from "@workspace/shared/utils/generate-id"

import { appdb } from "@/lib/db"

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
        createdByType: "admin",
        isVerified: true,
        verifiedBy: createdBy,
        verifiedAt: new Date(),
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
 * Updates an existing profession history record for a member.
 *
 * @param params - Object containing member and profession details.
 * @returns Updated profession record.
 * @throws {ProfessionNotFoundError} If no profession record is updated.
 */
export async function updateMemberProfessionService({
  professionId,
  professionData,
  updatedBy,
}: {
  professionId: string
  professionData: {
    employer?: string
    jobTitle?: string
    location?: string
    employmentType?: EmploymentType
    isCurrent?: boolean
    startYear?: number
    startMonth?: number
    endYear?: number
    endMonth?: number
  }
  updatedBy: string
}) {
  const {
    employer,
    jobTitle,
    location,
    employmentType,
    isCurrent,
    startYear,
    startMonth,
    endYear,
    endMonth,
  } = professionData
  try {
    const [existing] = await appdb
      .select()
      .from(memberProfession)
      .where(eq(memberProfession.id, professionId))
      .limit(1)

    if (!existing) {
      throw new ProfessionNotFoundError(professionId)
    }

    const mergedStartYear =
      startYear !== undefined ? startYear : existing.startYear
    const mergedStartMonth =
      startMonth !== undefined ? startMonth : existing.startMonth
    const mergedEndYear = endYear !== undefined ? endYear : existing.endYear
    const mergedEndMonth = endMonth !== undefined ? endMonth : existing.endMonth

    if (mergedStartYear != null && mergedEndYear != null) {
      const startVal = mergedStartYear * 100 + (mergedStartMonth ?? 1)
      const endVal = mergedEndYear * 100 + (mergedEndMonth ?? 12)
      if (startVal > endVal) {
        throw new ValidationError("Start date cannot be after end date")
      }
    }

    let newEndYear: number | null | undefined = endYear
    let newEndMonth: number | null | undefined = endMonth
    if (isCurrent) {
      newEndYear = null
      newEndMonth = null
    }

    const [updated] = await appdb
      .update(memberProfession)
      .set({
        ...(employer !== undefined && { employer }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(location !== undefined && { location }),
        ...(employmentType !== undefined && { employmentType }),
        ...(isCurrent !== undefined && { isCurrent }),
        ...(startYear !== undefined && { startYear }),
        ...(startMonth !== undefined && { startMonth }),
        endYear: newEndYear,
        endMonth: newEndMonth,
        updatedAt: new Date(),
      })
      .where(eq(memberProfession.id, professionId))
      .returning(getMemberProfessionProjections)

    if (!updated) {
      throw new ProfessionNotFoundError(professionId)
    }

    return updated
  } catch (error) {
    console.error("updateMemberProfessionService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to update member profession record")
  }
}

/**
 * Deletes a member's profession record.
 * @param professionId - The ID of the profession record to delete.
 * @throws {ServiceError} If no profession record is deleted.
 */
export async function deleteMemberProfessionService(
  professionId: string,
  deletedBy: string
) {
  try {
    const [deleted] = await appdb
      .delete(memberProfession)
      .where(eq(memberProfession.id, professionId))
      .returning({ id: memberProfession.id })

    if (!deleted) {
      throw new ServiceError("Failed to delete member profession record")
    }
  } catch (error) {
    console.error("deleteMemberProfessionService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to delete member profession record")
  }
}
