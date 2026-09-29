import { NextRequest } from "next/server"
import {
  deleteMemberEducationService,
  updateMemberEducationService,
} from "@/services/member-education-service"

import { educationUpdateSchema } from "@workspace/shared/zod-schemas/member-input-schema"

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

    const validation = educationUpdateSchema.safeParse(body)

    if (!validation.success) {
      return Response.json(
        { error: "Invalid education data", errors: validation.error.issues },
        { status: 400 }
      )
    }

    const data = await updateMemberEducationService({
      educationId: id,
      educationData: validation.data as Parameters<
        typeof updateMemberEducationService
      >[0]["educationData"],
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
    await deleteMemberEducationService(id, session.user.id)
    return Response.json({ success: true })
  }
)
