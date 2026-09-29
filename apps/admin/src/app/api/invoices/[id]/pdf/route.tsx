import { NextRequest, NextResponse } from "next/server"
import { getMemberInvoiceService } from "@/services/member-invoice-service"
import { renderToStream } from "@react-pdf/renderer"
import QRCode from "qrcode"

import { withAuth } from "@/lib/auth/with-auth"
import {
  InvoicePdfDocument,
  type InvoicePdfData,
} from "@/components/invoice-pdf-template"

export const GET = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params
    const invoice = await getMemberInvoiceService(id)

    const verificationUrl = `${request.nextUrl.origin}/verify/invoices/${invoice.invoiceNumber}`
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 120,
    })

    const pdfData: InvoicePdfData = {
      invoiceNumber: invoice.invoiceNumber,
      subscriptionPlan: invoice.subscriptionPlan,
      periodStart: invoice.periodStart ?? "",
      periodEnd: invoice.periodEnd ?? "",
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      memberName: invoice.memberName ?? "",
      billingAddress1: invoice.billingAddress1 ?? "",
      billingAddress2: invoice.billingAddress2,
      billingCity: invoice.billingCity ?? "",
      subscriptionPlanAmount: invoice.subscriptionPlanAmount,
      amount: invoice.amount,
      discount: invoice.discount ?? 0,
      paymentCategory: invoice.paymentCategory,
      paymentMethod: invoice.paymentMethod,
    }

    const stream = await renderToStream(
      <InvoicePdfDocument
        data={pdfData}
        qrDataUrl={qrDataUrl}
        verificationUrl={verificationUrl}
      />
    )

    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    })
  }
)
