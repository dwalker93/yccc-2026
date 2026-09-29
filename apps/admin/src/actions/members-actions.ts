"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import {
  addMemberEducationActionSchema,
  addMemberProfessionActionSchema,
  approveMemberSchema,
  banMemberSchema,
  bulkApproveMemberSchema,
  reinstateMemberSchema,
  rejectMemberSchema,
  suspendMemberSchema,
} from "@/schemas/member-schema"
import {
  addMemberEducationService,
  verifyMemberEducationService,
} from "@/services/member-education-service"
import {
  addMemberProfessionService,
  verifyMemberProfessionService,
} from "@/services/member-profession-service"
import {
  approveMemberService,
  banMemberService,
  bulkApproveMemberService,
  reinstateMemberService,
  rejectMemberService,
  suspendMemberService,
} from "@/services/member-service"
import { formatMemberId } from "@/utils/member"

import { auth } from "@/lib/auth/auth"

/**
 * Server action to create a new member.
 * Validates session authentication and extracts member data from form input.
 */
export async function createMemberAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const dateOfBirth = new Date(formData.get("dateOfBirth") as string)
  const nic = formData.get("nic") as string
  const city = formData.get("city") as string

  // await appdb.insert(member).values({
  //   id: crypto.randomUUID(),
  //   name,
  //   email,
  //   phone,
  //   dateOfBirth,
  //   nic,
  //   city,
  //   education: formData.get("education") as string,
  //   profession: formData.get("profession") as string,
  //   address: formData.get("address") as string,
  //   photo: formData.get("photo") as string,
  //   district: formData.get("district") as string,
  // })

  revalidatePath("/members")
}

/**
 * Server action to approve a single member registration.
 * Validates input parameters, checks authentication, and delegates approval to member service.
 */
export async function approveMemberAction(
  memberId: string,
  reason?: string,
  note?: string
) {
  const parsed = approveMemberSchema.safeParse({ memberId, reason, note })
  if (!parsed.success) {
    return { error: parsed.error.message ?? "Invalid input" }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    await approveMemberService({
      memberId: parsed.data.memberId,
      reason: parsed.data.reason,
      note: parsed.data.note,
      actionedBy: session.user.id,
    })

    revalidatePath("/members")
    return { success: true }
  } catch (error) {
    console.error("Failed to approve member:", error)
    return { error: "Failed to approve member" }
  }
}

/**
 * Server action to approve multiple member registrations in bulk (up to 10 members).
 * Validates input array and batch limit, checks authentication, and delegates approval to member service.
 */
export async function bulkApproveMemberAction(
  memberIds: string[],
  reason?: string,
  note?: string
) {
  const parsed = bulkApproveMemberSchema.safeParse({ memberIds, reason, note })
  if (!parsed.success) {
    return { error: parsed.error.message ?? "Invalid input" }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  if (parsed.data.memberIds.length > 10) {
    return { error: "You can only approve 10 members at a time" }
  }

  try {
    await bulkApproveMemberService({
      memberIds: parsed.data.memberIds,
      reason: parsed.data.reason,
      note: parsed.data.note,
      actionedBy: session.user.id,
    })

    revalidatePath("/members")
    return { success: true }
  } catch (error) {
    console.error("Failed to approve member:", error)
    return { error: "Failed to approve member" }
  }
}

/**
 * Server action to reject a member registration.
 * Validates input parameters including rejection reason, checks authentication, and updates member status via service.
 */
export async function rejectMemberAction(
  memberId: string,
  reason: string,
  note?: string
) {
  const parsed = rejectMemberSchema.safeParse({ memberId, reason, note })
  if (!parsed.success) {
    return { error: parsed.error.message ?? "Invalid input" }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    await rejectMemberService({
      memberId: parsed.data.memberId,
      actionedBy: session.user.id,
      reason: parsed.data.reason,
      note: parsed.data.note,
    })

    revalidatePath("/members")
    return { success: true }
  } catch (error) {
    console.error("Failed to reject member:", error)
    return { error: "Failed to reject member" }
  }
}

/**
 * Server action to suspend a member's active status.
 * Accepts optional suspension end date and reason, checks authentication, and applies suspension via service.
 */
export async function suspendMemberAction(
  memberId: string,
  reason: string,
  note?: string,
  suspendedUntil?: Date
) {
  const parsed = suspendMemberSchema.safeParse({
    memberId,
    reason,
    note,
    suspendedUntil,
  })
  if (!parsed.success) {
    return { error: parsed.error.message ?? "Invalid input" }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    await suspendMemberService({
      memberId: parsed.data.memberId,
      actionedBy: session.user.id,
      reason: parsed.data.reason,
      note: parsed.data.note,
      suspendedUntil: parsed.data.suspendedUntil,
    })

    revalidatePath("/members")
    return { success: true }
  } catch (error) {
    console.error("Failed to suspend member:", error)
    return { error: "Failed to suspend member" }
  }
}

/**
 * Server action to ban a member.
 * Validates input, checks authentication, and updates member status to banned via service.
 */
export async function banMemberAction(
  memberId: string,
  reason: string,
  note?: string
) {
  const parsed = banMemberSchema.safeParse({ memberId, reason, note })
  if (!parsed.success) {
    return { error: parsed.error.message ?? "Invalid input" }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    await banMemberService({
      memberId: parsed.data.memberId,
      actionedBy: session.user.id,
      reason: parsed.data.reason,
      note: parsed.data.note,
    })

    revalidatePath("/members")
    return { success: true }
  } catch (error) {
    console.error("Failed to ban member:", error)
    return { error: "Failed to ban member" }
  }
}

/**
 * Server action to reinstate a suspended or banned member back to active status.
 * Validates input parameters, checks authentication, and reinstates member via service.
 */
export async function reinstateMemberAction(
  memberId: string,
  reason: string,
  note?: string
) {
  const parsed = reinstateMemberSchema.safeParse({ memberId, reason, note })
  if (!parsed.success) {
    return { error: parsed.error.message ?? "Invalid input" }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    await reinstateMemberService({
      memberId: parsed.data.memberId,
      actionedBy: session.user.id,
      reason: parsed.data.reason,
      note: parsed.data.note,
    })

    revalidatePath("/members")
    return { success: true }
  } catch (error) {
    console.error("Failed to reinstate member:", error)
    return { error: "Failed to reinstate member" }
  }
}

/**
 * Server action to add a member's education record.
 * Validates session authentication, adds education record via service, and revalidates relevant member paths.
 *
 * @param memberId - ID of the member to add education to.
 * @param institution - Name of the educational institution.
 * @param qualification - Qualification obtained.
 * @param fieldOfStudy - Field of study.
 * @param startYear - Year when education started.
 * @param startMonth - Month when education started.
 * @param endYear - Year when education ended.
 * @param endMonth - Month when education ended.
 */
export async function addMemberEducationAction(
  memberId: string,
  educationData: {
    institution: string
    qualification: string
    fieldOfStudy: string | null
    startYear: number | null
    startMonth: number | null
    endYear: number
    endMonth: number | null
  }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  const parsed = addMemberEducationActionSchema.safeParse(educationData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid education data" }
  }

  try {
    await addMemberEducationService({
      memberId,
      educationData: parsed.data,
      createdBy: session.user.id,
    })

    revalidatePath(`/members/${formatMemberId(memberId)}/career`)
    return { success: true }
  } catch (error) {
    console.error("Failed to add member education:", error)
    return { error: "Failed to add member education" }
  }
}

/**
 * Server action to verify a member's education record.
 * Validates session authentication, updates education verification status, and revalidates relevant member paths.
 *
 * @param educationId - Unique identifier of the education record to verify.
 * @param memberId - Optional member ID or path to revalidate (e.g., "mem123" or "/members/mem123").
 */
export async function verifyMemberEducationAction(
  educationId: string,
  memberId?: string
) {
  if (!educationId) {
    return { error: "Education ID is required" }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    await verifyMemberEducationService(educationId, session.user.id)

    if (memberId) {
      revalidatePath(`/members/${formatMemberId(memberId)}/career`)
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to verify member education:", error)
    return { error: "Failed to verify member education" }
  }
}

export async function addMemberProfessionAction(
  memberId: string,
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
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  const parsed = addMemberProfessionActionSchema.safeParse(professionData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profession data" }
  }

  try {
    await addMemberProfessionService({
      memberId,
      professionData: parsed.data,
      createdBy: session.user.id,
    })

    revalidatePath(`/members/${formatMemberId(memberId)}/career`)
    return { success: true }
  } catch (error) {
    console.error("Failed to add member profession:", error)
    return { error: "Failed to add member profession" }
  }
}

/**
 * Server action to verify a member's profession record.
 * Validates session authentication, updates profession verification status, and revalidates relevant member paths.
 *
 * @param professionId - Unique identifier of the profession record to verify.
 * @param memberId - Optional member ID or path to revalidate (e.g., "mem123" or "/members/mem123").
 */
export async function verifyMemberProfessionAction(
  professionId: string,
  memberId?: string
) {
  if (!professionId) {
    return { error: "Profession ID is required" }
  }
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    await verifyMemberProfessionService(professionId, session.user.id)

    if (memberId) {
      revalidatePath(`/members/${formatMemberId(memberId)}/career`)
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to verify member profession:", error)
    return { error: "Failed to verify member profession" }
  }
}
