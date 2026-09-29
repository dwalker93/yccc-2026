import { NextRequest, NextResponse } from "next/server"
import { getMemberMetadata } from "@/services/member-service"
import { toMemberId } from "@/utils/member"

import { withAuth } from "@/lib/auth/with-auth"

export const GET = withAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const metadata = await getMemberMetadata({ id: toMemberId(id) })
    return NextResponse.json(metadata)
  }
)
