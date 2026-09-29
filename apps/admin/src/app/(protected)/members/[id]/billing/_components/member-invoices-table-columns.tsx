import { ComponentProps } from "react"
import { MemberInvoice } from "@/services/member-invoice-service"
import { formatCurrency, formatDate } from "@/utils/utils"

import { InvoiceStatusBadge } from "@/components/badge"
import { InvoiceDetails } from "@/components/invoice-viewer"
import { SettleInvoiceDialog } from "@/components/settle-invoice-dialog"
import { createColumns } from "@/components/simple-table/simple-table"

export const getInvoicesColumns = ({ memberId }: { memberId: string }) => {
  return createColumns<MemberInvoice>([
    { key: "invoiceNumber", label: "Invoice #" },
    {
      key: "amount",
      label: "Amount (before discounts)",
      render: (row) => (
        <span className="text-emerald-700 dark:text-green-400">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "period",
      label: "Period",
      render: (row) =>
        formatDate(row.periodStart) + " - " + formatDate(row.periodEnd),
    },
    {
      key: "issuedDate",
      label: "Issued",
      render: (row) => formatDate(row.issueDate),
    },
    {
      key: "dueDate",
      label: "Due",
      render: (row) => formatDate(row.dueDate),
    },
    {
      key: "paid",
      label: "Paid",
      render: (row) => formatDate(row.paidDate),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <InvoiceStatusBadge status={row.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        return (
          <div className="flex gap-2">
            <InvoiceDetails invoiceId={row.id} />
            {row.status === "open" && (
              <SettleInvoiceDialog memberId={memberId} invoice={row} />
            )}
          </div>
        )
      },
    },
  ])
}
