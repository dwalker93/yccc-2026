"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { memberKeys } from "@/hooks/members/keys"
import { IssueInvoiceDialog } from "@/components/issue-invoice-dialog"
import { SimpleTable } from "@/components/simple-table/simple-table"

import { getInvoicesColumns } from "./member-invoices-table-columns"
import { getPaymentsColumns } from "./member-payments-table-columns"

export function MemberBillingTables({ memberId }: { memberId: string }) {
  const [invoicePage, setInvoicePage] = useState(1)
  const [paymentPage, setPaymentPage] = useState(1)
  const pageSize = 5

  const { data: invoicesData } = useQuery({
    queryKey: memberKeys.invoices({
      id: memberId,
      pageIndex: invoicePage,
      pageSize,
    }),
    queryFn: () =>
      fetch(
        `/api/members/${memberId}/invoices?page=${invoicePage}&pageSize=${pageSize}`
      ).then((r) => r.json()),
    // page 1 is already hydrated from server — no loading state on initial render
  })

  const { data: paymentsData } = useQuery({
    queryKey: memberKeys.payments({
      id: memberId,
      pageIndex: paymentPage,
      pageSize,
    }),
    queryFn: () =>
      fetch(
        `/api/members/${memberId}/payments?page=${paymentPage}&pageSize=${pageSize}`
      ).then((r) => r.json()),
    // page 1 is already hydrated from server — no loading state on initial render
  })

  return (
    <div className="flex flex-col gap-4">
      <SimpleTable
        title="Invoices"
        action={<IssueInvoiceDialog />}
        data={invoicesData?.records ?? []}
        emptyMessage="No invoices found."
        columns={getInvoicesColumns({
          memberId,
        })}
      />
      <SimpleTable
        title="Payments"
        data={paymentsData?.records ?? []}
        emptyMessage="No payments found."
        columns={getPaymentsColumns()}
      />
    </div>
  )
}
