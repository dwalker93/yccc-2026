import { NextRequest } from "next/server"
import {
  deleteMemberProfessionService,
  updateMemberProfessionService,
} from "@/services/member-profession-service"

import { professionUpdateSchema } from "@workspace/shared/zod-schemas/member-input-schema"

import { withAuth } from "@/lib/auth/with-auth"

export const PUT = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
    session
  ) => {
    const { id } = await params
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const validation = professionUpdateSchema.safeParse(body)

    if (!validation.success) {
      return Response.json(
        { error: "Invalid profession data", errors: validation.error.issues },
        { status: 400 }
      )
    }

    const data = await updateMemberProfessionService({
      professionId: id,
      professionData: validation.data as Parameters<
        typeof updateMemberProfessionService
      >[0]["professionData"],
      updatedBy: session.user.id,
    })

    return Response.json(data)
  }
)

export const DELETE = withAuth(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
    session
  ) => {
    const { id } = await params
    await deleteMemberProfessionService(id, session.user.id)
    return Response.json({ success: true })
  }
)
