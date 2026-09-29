import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import {
  deleteMemberService,
  updateMemberPersonalInformationService,
} from "@/services/member-service"
import { toMemberId } from "@/utils/member"

import { memberPersonalInformationUpdateSchema } from "@workspace/shared/zod-schemas/member-input-schema"

import { withAuth } from "@/lib/auth/with-auth"

export const PUT = withAuth(
  async (request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const memberId = toMemberId(id)

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const validation = memberPersonalInformationUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid member personal information data",
          errors: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const updatedMember = await updateMemberPersonalInformationService(
      memberId,
      validation.data
    )

    revalidatePath(`/members/${id}/settings`)
    revalidatePath(`/members/${memberId}/settings`)

    return NextResponse.json({ success: true, member: updatedMember })
  }
)

export const DELETE = withAuth(
  async (_request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const memberId = toMemberId(id)

    const deletedMemberId = await deleteMemberService(memberId)

    revalidatePath(`/members`)

    return NextResponse.json({ success: true, memberId: deletedMemberId })
  }
)
