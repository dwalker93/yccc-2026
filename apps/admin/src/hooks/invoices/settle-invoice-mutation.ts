import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { memberKeys } from "../members/keys"
import { invoiceKeys } from "./keys"

async function settleInvoice({
  invoiceId,
  discount,
  method,
  referenceNumber,
}: {
  invoiceId: string
  discount: number
  method: "cash" | "bank_transfer"
  referenceNumber?: string | null
}) {
  const response = await fetch(`/api/invoices/${invoiceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      discount,
      method,
      referenceNumber,
    }),
  })

  if (!response.ok) {
    let errorMessage = "Failed to settle invoice"
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
    } catch {
      // Response may not be JSON (e.g. plain text "Unauthorized")
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export function useSettleInvoiceMutation({
  memberId,
  invoicePage = 1,
  pageSize = 5,
}: {
  memberId: string
  invoicePage?: number
  pageSize?: number
}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: settleInvoice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.invoice(variables.invoiceId),
      })
      queryClient.invalidateQueries({
        queryKey: memberKeys.latestInvoice(memberId),
      })
      queryClient.invalidateQueries({
        queryKey: memberKeys.invoices({
          id: memberId,
          pageIndex: invoicePage,
          pageSize,
        }),
      })
      queryClient.invalidateQueries({
        queryKey: memberKeys.payments({
          id: memberId,
          pageIndex: invoicePage,
          pageSize,
        }),
      })
      toast.success("Invoice settled successfully")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
