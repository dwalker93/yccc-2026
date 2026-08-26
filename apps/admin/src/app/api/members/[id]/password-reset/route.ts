import { NextResponse } from "next/server"
import { updateMemberPasswordService } from "@/services/member-service"
import { toMemberId } from "@/utils/member"

import { memberPasswordSchema } from "@workspace/shared/zod-schemas/member-input-schema"

import { withAuth } from "@/lib/auth/with-auth"

export const PATCH = withAuth(
  async (request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const memberId = toMemberId(id)

    const body = await request.json()

    const validation = memberPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid member password data",
          errors: validation.error.issues,
        },
        { status: 400 }
      )
    }

    await updateMemberPasswordService(memberId, validation.data)

    return NextResponse.json({ success: true })
  }
)
