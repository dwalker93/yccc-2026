"use client"

import { useState } from "react"
import { formatCurrency, formatDate } from "@/utils/utils"
import { Download, Eye, Loader2, Printer } from "lucide-react"

import { capitalizeFirstLetter } from "@workspace/shared/utils/strings"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"

import { useInvoice } from "@/hooks/invoices/use-invoice"

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  subtotal: number
}

type InvoiceStatus = "open" | "paid" | "void" | "uncollectible"

export interface InvoiceDetailsProps {
  invoiceId: string
  onDownload?: (invoiceId: string) => void
  onPrint?: (invoiceId: string) => void
}

function getStatusConfig(status: InvoiceStatus) {
  switch (status) {
    case "paid":
      return {
        label: "Paid",
        variant: "default" as const,
        className: "bg-green-500/10 text-green-600 border-green-500/20",
      }
    case "open":
      return {
        label: "Open",
        variant: "secondary" as const,
        className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      }
    case "uncollectible":
      return {
        label: "Uncollectible",
        variant: "destructive" as const,
        className: "bg-destructive/10 text-destructive border-destructive/20",
      }
    case "void":
      return {
        label: "Void",
        variant: "secondary" as const,
        className: "",
      }
    default:
      return {
        label: "Unknown",
        variant: "secondary" as const,
        className: "",
      }
  }
}

export function InvoiceDetails({
  invoiceId,
  onDownload,
  onPrint,
}: InvoiceDetailsProps) {
  const [open, setOpen] = useState(false)
  const { data: invoicedata } = useInvoice(invoiceId, open)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const statusConfig = getStatusConfig(invoicedata?.status ?? "open")

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`)
      if (!res.ok) throw new Error("Failed to generate PDF")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${invoicedata?.invoiceNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      // toast.error("Couldn't download invoice")
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      //await onPrint?.(invoice.id)
      window.print()
    } finally {
      setIsPrinting(false)
    }
  }
  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((prev) => !prev)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
      </div>
      {invoicedata && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-2xl!"
            showCloseButton={false}
            id="invoice-print-area"
          >
            <SheetHeader className="shrink-0">
              <div
                className="flex flex-col gap-4 sm:flex-row sm:items-center
                  sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <SheetTitle className="wrap-break-word">
                    Invoice {invoicedata.invoiceNumber}
                  </SheetTitle>
                  <SheetDescription className="wrap-break-word">
                    {capitalizeFirstLetter(invoicedata.subscriptionPlan)} plan
                    for {formatDate(invoicedata.periodStart)} -{" "}
                    {formatDate(invoicedata.periodEnd)}
                  </SheetDescription>
                </div>
                <Badge
                  className={cn("shrink-0 text-xs", statusConfig.className)}
                  variant={statusConfig.variant}
                >
                  {statusConfig.label}
                </Badge>
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
              <div className="flex flex-col gap-6">
                <div
                  className="flex flex-col gap-4 sm:flex-row sm:justify-between"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-medium">Invoice Details</h3>
                    <div
                      className="flex flex-col gap-1 text-sm
                        text-muted-foreground"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span>Date:</span>
                        <span className="text-foreground">
                          {formatDate(invoicedata.issueDate)}
                        </span>
                      </div>
                      {invoicedata.dueDate && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span>Due Date:</span>
                          <span className="text-foreground">
                            {formatDate(invoicedata.dueDate)}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <span>Status:</span>
                        <Badge
                          className={cn("text-xs", statusConfig.className)}
                          variant={statusConfig.variant}
                        >
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-medium">Billing Address</h3>
                    <div
                      className="flex flex-col gap-1 text-sm
                        text-muted-foreground"
                    >
                      <div className="wrap-break-word text-foreground">
                        {invoicedata.memberName}
                      </div>
                      <div className="wrap-break-word">
                        {invoicedata.billingAddress1}
                      </div>
                      {invoicedata.billingAddress2 && (
                        <div className="wrap-break-word">
                          {invoicedata.billingAddress2}
                        </div>
                      )}
                      <div className="wrap-break-word">
                        {invoicedata.billingCity},{" "}
                      </div>
                      <div className="wrap-break-word">Sri Lanka</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-medium">Line Items</h3>
                  <div
                    className="flex flex-col gap-0 overflow-hidden rounded-lg
                      border"
                  >
                    <div
                      className="hidden grid-cols-[2fr_1fr_1fr_1fr] gap-4
                        border-b bg-muted/50 p-3 text-xs font-medium
                        text-muted-foreground sm:grid"
                    >
                      <div>Description</div>
                      <div className="text-right">Quantity</div>
                      <div className="text-right">Unit Price</div>
                      <div className="text-right">Subtotal</div>
                    </div>

                    <div
                      className="flex flex-col gap-2 border-b p-3
                        last:border-b-0 sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr]
                        sm:gap-4 sm:gap-y-0"
                    >
                      <div className="text-sm font-medium wrap-break-word">
                        {capitalizeFirstLetter(invoicedata.subscriptionPlan)}{" "}
                        Plan
                      </div>
                      <div
                        className="flex items-center justify-between text-sm
                          text-muted-foreground sm:justify-end"
                      >
                        <span className="sm:hidden">Quantity:</span>
                        <span>01</span>
                      </div>
                      <div
                        className="flex items-center justify-between text-sm
                          text-muted-foreground sm:justify-end"
                      >
                        <span className="sm:hidden">Unit Price:</span>
                        <span>
                          {formatCurrency(invoicedata.subscriptionPlanAmount)}
                        </span>
                      </div>
                      <div
                        className="flex items-center justify-between text-sm
                          font-medium sm:justify-end"
                      >
                        <span className="sm:hidden">Subtotal:</span>
                        <span>
                          {formatCurrency(invoicedata.subscriptionPlanAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(invoicedata.amount)}</span>
                  </div>
                  {!!invoicedata.discount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-600">
                        -{formatCurrency(invoicedata.discount)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tax (No Tax) {(0 * 100).toFixed(1)}%
                    </span>
                    <span>{formatCurrency(0)}</span>
                  </div>

                  <Separator />
                  <div
                    className="flex items-center justify-between text-base
                      font-semibold"
                  >
                    <span>Total</span>
                    <span>
                      {formatCurrency(
                        invoicedata.amount - invoicedata.discount
                      )}
                    </span>
                  </div>
                </div>

                {invoicedata.paymentMethod && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-medium">Payment Method</h3>
                      <div
                        className="flex flex-wrap items-center gap-2 text-sm
                          text-muted-foreground"
                      >
                        <span className="capitalize">
                          {invoicedata.paymentCategory}
                        </span>
                        {invoicedata.paymentMethod && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span className="capitalize">
                              {invoicedata.paymentMethod}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div
              className="flex shrink-0 flex-col gap-2 border-t p-4 sm:flex-row
                sm:justify-end"
              data-no-print
            >
              {true && (
                <Button
                  aria-label="Print invoice"
                  className="w-full sm:w-auto"
                  onClick={handlePrint}
                  type="button"
                  variant="outline"
                >
                  {isPrinting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Printing…
                    </>
                  ) : (
                    <>
                      <Printer className="size-4" />
                      Print
                    </>
                  )}
                </Button>
              )}
              {true && (
                <Button
                  aria-label={`Download invoice ${invoicedata.invoiceNumber}`}
                  className="w-full sm:w-auto"
                  onClick={handleDownload}
                  type="button"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Downloading…
                    </>
                  ) : (
                    <>
                      <Download className="size-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
