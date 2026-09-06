import { count, desc, eq, sql } from "drizzle-orm"

import {
  actorType,
  FieldOfStudy,
  memberEducation,
  Qualification,
} from "@workspace/shared/schemas"
import { generateId, IdPrefix } from "@workspace/shared/utils/generate-id"

import { appdb } from "@/lib/db"
import { EducationNotFoundError, ServiceError } from "@/services/errors"

/** Projection mapping fields for `getMemberEducationService`. */
export const getMemberEducationProjections = {
  id: memberEducation.id,
  institution: memberEducation.institution,
  qualification: memberEducation.qualification,
  fieldOfStudy: memberEducation.fieldOfStudy,
  startYear: memberEducation.startYear,
  startMonth: memberEducation.startMonth,
  endYear: memberEducation.endYear,
  endMonth: memberEducation.endMonth,
  isVerified: memberEducation.isVerified,
}

/**
 * Retrieves a paginated list of education history records for a specific member.
 *
 * @param params - Object containing `memberId`, 1-based `pageIndex`, and `pageSize`.
 * @returns Object containing an array of education records and the total count.
 */
export async function getMemberEducationService({
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
        .select(getMemberEducationProjections)
        .from(memberEducation)
        .where(eq(memberEducation.memberId, memberId))
        .orderBy(
          sql`${memberEducation.startYear} DESC NULLS LAST`,
          desc(memberEducation.id)
        )
        .limit(pageSize)
        .offset((pageIndex - 1) * pageSize),

      appdb
        .select({ total: count() })
        .from(memberEducation)
        .where(eq(memberEducation.memberId, memberId)),
    ])

    return {
      records,
      totalCount: countResult[0]?.total ?? 0,
    }
  } catch (error) {
    console.error("getMemberEducationService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get member education records")
  }
}

/** Individual member education record type. */
export type MemberEducation = Awaited<
  ReturnType<typeof getMemberEducationService>
>["records"][number]

/**
 * Verifies a member's education record by updating its verification status.
 *
 * @param educationId - Unique identifier of the education record to verify.
 * @param actionedBy - ID or identifier of the user/admin performing the verification.
 * @throws {EducationNotFoundError} If no education record is found with the provided ID.
 */
export async function verifyMemberEducationService(
  educationId: string,
  actionedBy: string
) {
  try {
    const [updated] = await appdb
      .update(memberEducation)
      .set({
        isVerified: true,
        updatedAt: new Date(),
        verifiedBy: actionedBy,
        verifiedAt: new Date(),
      })
      .where(eq(memberEducation.id, educationId))
      .returning({ id: memberEducation.id })

    if (!updated) {
      throw new EducationNotFoundError(educationId)
    }
  } catch (error) {
    console.error("verifyMemberEducationService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to verify member education record")
  }
}

/**
 * Adds a new education history record for a member.
 *
 * @param params - Object containing member and education details.
 * @returns Created education record.
 * @throws {ServiceError} If no education record is created.
 */
export async function addMemberEducationService({
  memberId,
  educationData,
  createdBy,
}: {
  memberId: string
  educationData: {
    institution: string
    qualification: string
    fieldOfStudy: string | null
    startYear: number | null
    startMonth: number | null
    endYear: number
    endMonth: number | null
  }
  createdBy: string
}) {
  const {
    institution,
    qualification,
    fieldOfStudy,
    startYear,
    startMonth,
    endYear,
    endMonth,
  } = educationData
  try {
    const [created] = await appdb
      .insert(memberEducation)
      .values({
        id: generateId(IdPrefix.EDUCATION),
        memberId,
        institution,
        qualification: qualification as Qualification,
        fieldOfStudy: fieldOfStudy as FieldOfStudy,
        startYear,
        startMonth,
        endYear,
        endMonth,
        createdBy,
        createdByType: actorType.enumValues[1],
      })
      .returning(getMemberEducationProjections)

    if (!created) {
      throw new ServiceError("Failed to create member education record")
    }

    return created
  } catch (error) {
    console.error("addMemberEducationService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to add member education record")
  }
}

/**
 * Updates an existing education history record for a member.
 *
 * @param params - Object containing member and education details.
 * @returns Updated education record.
 * @throws {EducationNotFoundError} If no education record is updated.
 */
export async function updateMemberEducationService({
  educationId,
  educationData,
  updatedBy,
}: {
  educationId: string
  educationData: {
    institution?: string
    qualification?: Qualification
    fieldOfStudy?: FieldOfStudy
    startYear?: number
    startMonth?: number
    endYear?: number
    endMonth?: number
  }
  updatedBy: string
}) {
  const {
    institution,
    qualification,
    fieldOfStudy,
    startYear,
    startMonth,
    endYear,
    endMonth,
  } = educationData
  try {
    const [updated] = await appdb
      .update(memberEducation)
      .set({
        institution,
        qualification: qualification,
        fieldOfStudy: fieldOfStudy,
        startYear,
        startMonth,
        endYear,
        endMonth,
        updatedAt: new Date(),
      })
      .where(eq(memberEducation.id, educationId))
      .returning(getMemberEducationProjections)

    if (!updated) {
      throw new EducationNotFoundError(educationId)
    }

    return updated
  } catch (error) {
    console.error("updateMemberEducationService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to update member education record")
  }
}

/**
 * Deletes an education history record for a member.
 *
 * @param educationId - Unique identifier of the education record to delete.
 * @throws {EducationNotFoundError} If no education record is deleted.
 */
export async function deleteMemberEducationService(
  educationId: string,
  deletedBy: string
) {
  try {
    const [deleted] = await appdb
      .delete(memberEducation)
      .where(eq(memberEducation.id, educationId))
      .returning({ id: memberEducation.id })

    if (!deleted) {
      throw new EducationNotFoundError(educationId)
    }
  } catch (error) {
    console.error("deleteMemberEducationService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to delete member education record")
  }
}

