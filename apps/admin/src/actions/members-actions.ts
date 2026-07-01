"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import {
  approveMemberSchema,
  banMemberSchema,
  bulkApproveMemberSchema,
  reinstateMemberSchema,
  rejectMemberSchema,
  suspendMemberSchema,
} from "@/schemas/member-schema"
import {
  approveMemberService,
  banMemberService,
  bulkApproveMemberService,
  reinstateMemberService,
  rejectMemberService,
  suspendMemberService,
} from "@/services/members-service"

import { auth } from "@/lib/auth/auth"

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
