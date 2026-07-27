import { count, desc, eq } from "drizzle-orm"

import { memberProfession } from "@workspace/shared/schemas"

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
  const [records, countResult] = await Promise.all([
    appdb
      .select(getMemberProfessionProjections)
      .from(memberProfession)
      .where(eq(memberProfession.memberId, memberId))
      .orderBy(desc(memberProfession.startYear))
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
 * @throws {Error} If no profession record is found with the provided ID.
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
      throw new Error(`Member profession record not found: ${professionId}`)
    }
  } catch (error) {
    console.error("verifyMemberProfessionService failed", error)
    throw new Error("Failed to verify member profession")
  }
}
