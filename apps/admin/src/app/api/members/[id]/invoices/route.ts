import { NextRequest } from "next/server"
import {
  createInvoiceService,
  getMemberInvoicesService,
} from "@/services/member-invoice-service"
import { toMemberId } from "@/utils/member"

import { issueInvoiceFormSchema } from "@workspace/shared/zod-schemas/invoice-schema"

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

    const data = await getMemberInvoicesService({
      memberId: id,
      pageIndex,
      pageSize,
    })
    return Response.json(data)
  }
)

export const POST = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params
    const memberId = toMemberId(id)
    const data = await request.json()
    const validatedData = issueInvoiceFormSchema.parse(data)
    const result = await createInvoiceService(memberId, validatedData)
    return Response.json(result)
  }
)
