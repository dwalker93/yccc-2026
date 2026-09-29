import { NextRequest, NextResponse } from "next/server"
import { getMemberLatestInvoiceService } from "@/services/member-invoice-service"
import { toMemberId } from "@/utils/member"

import { withAuth } from "@/lib/auth/with-auth"

export const GET = withAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const latestInvoice = await getMemberLatestInvoiceService(toMemberId(id))
    return NextResponse.json(latestInvoice)
  }
)
