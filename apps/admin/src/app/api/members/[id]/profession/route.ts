import { NextRequest, NextResponse } from "next/server"
import { getMemberProfessionService } from "@/services/member-profession-service"

import { withAuth } from "@/lib/auth/with-auth"

export const GET = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams

    const rawPage = Number(searchParams.get("page"))
    const rawPageSize = Number(searchParams.get("pageSize"))
    const pageIndex = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1
    const pageSize =
      Number.isInteger(rawPageSize) && rawPageSize >= 1 && rawPageSize <= 100
        ? rawPageSize
        : 5

    const data = await getMemberProfessionService({
      memberId: id,
      pageIndex,
      pageSize,
    })

    return NextResponse.json(data)
  }
)


