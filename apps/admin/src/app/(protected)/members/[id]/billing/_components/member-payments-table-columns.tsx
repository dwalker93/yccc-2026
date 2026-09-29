import { MemberPayment } from "@/services/member-payments-service"
import { formatCurrency, formatDate } from "@/utils/utils"

import { PaymentStatusBadge } from "@/components/badge"
import { createColumns } from "@/components/simple-table/simple-table"

export const getPaymentsColumns = () =>
  createColumns<MemberPayment>([
    { key: "id", label: "Payment ID" },
    { key: "invoiceNumber", label: "Invoice" },
    {
      key: "amount",
      label: "Amount paid",
      render: (row) => (
        <span className="text-emerald-700 dark:text-green-400">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Method",
      render: (row) => row.paymentMethod,
    },
    {
      key: "reference",
      label: "Reference",
      render: (row) => row.reference ?? "-",
    },
    {
      key: "paidAt",
      label: "Date",
      render: (row) => (row.paidAt ? formatDate(row.paidAt) : "--"),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <PaymentStatusBadge status={row.status} />,
    },
  ])
