import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { IssueInvoiceFormValues } from "@workspace/shared/zod-schemas/invoice-schema"

import { memberKeys } from "../members/keys"

async function issueInvoice(memberId: string, values: IssueInvoiceFormValues) {
  const response = await fetch(`/api/members/${memberId}/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    let errorMessage = "Failed to issue invoice"
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

export function useIssueInvoiceMutation({ memberId }: { memberId: string }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: IssueInvoiceFormValues) =>
      issueInvoice(memberId, values),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.invoices({ id: memberId }),
      })
      queryClient.invalidateQueries({
        queryKey: memberKeys.latestInvoice(memberId),
      })
      toast.success("Invoice issued successfully")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
