import { NextRequest } from "next/server"
import {
  getMemberInvoiceService,
  settleInvoiceService,
} from "@/services/member-invoice-service"

import { invoiceSettlementSchema } from "@workspace/shared/zod-schemas/invoice-schema"

import { withAuth } from "@/lib/auth/with-auth"

export const GET = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params
    const invoice = await getMemberInvoiceService(id)
    return Response.json(invoice)
  }
)

export const PUT = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params

    const body = await request.json()
    const invoiceSettlement = invoiceSettlementSchema.parse(body)

    const data = await settleInvoiceService(id, invoiceSettlement)
    return Response.json(data)
  }
)
