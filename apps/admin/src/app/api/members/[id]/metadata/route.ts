import { NextRequest, NextResponse } from "next/server"
import { getMemberMetadata } from "@/services/member-service"

import { withAuth } from "@/lib/auth/with-auth"

export const GET = withAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const metadata = await getMemberMetadata({ id })
    return NextResponse.json(metadata)
  }
)


