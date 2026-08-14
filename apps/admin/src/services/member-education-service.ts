import { count, desc, eq } from "drizzle-orm"

import {
  FieldOfStudy,
  memberEducation,
  Qualification,
} from "@workspace/shared/schemas"
import { generateId, IdPrefix } from "@workspace/shared/utils/generate-id"

import { appdb } from "@/lib/db"

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
        .orderBy(desc(memberEducation.startYear))
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
    throw new Error("Failed to get member education records")
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
 * @throws {Error} If no education record is found with the provided ID.
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
      throw new Error(`Member education record not found: ${educationId}`)
    }
  } catch (error) {
    console.error("verifyMemberEducationService failed", error)
    throw new Error("Failed to verify member education record")
  }
}

/**
 * Adds a new education history record for a member.
 *
 * @param params - Object containing member and education details.
 * @returns Created education record.
 * @throws {Error} If no education record is created.
 */
export async function addMemberEducationService({
  memberId,
  institution,
  qualification,
  fieldOfStudy,
  startYear,
  startMonth,
  endYear,
  endMonth,
}: {
  memberId: string
  institution: string
  qualification: string
  fieldOfStudy: string
  startYear: number
  startMonth: number
  endYear: number
  endMonth: number
}) {
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
      })
      .returning(getMemberEducationProjections)

    if (!created) {
      throw new Error("Failed to create member education record")
    }

    return created
  } catch (error) {
    console.error("addMemberEducationService failed", error)
    throw new Error("Failed to add member education record")
  }
}
