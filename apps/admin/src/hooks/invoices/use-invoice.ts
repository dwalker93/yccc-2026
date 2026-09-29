import { MemberInvoiceDetails } from "@/services/member-invoice-service"
import { useQuery } from "@tanstack/react-query"

import { invoiceKeys } from "./keys"

async function getInvoice({ id }: { id: string }) {
  const response = await fetch(`/api/invoices/${id}`)
  if (!response.ok) {
    throw new Error("Failed to get invoice")
  }
  return response.json() as Promise<MemberInvoiceDetails>
}

export function useInvoice(id: string, load: boolean = false) {
  return useQuery({
    queryKey: invoiceKeys.invoice(id),
    queryFn: () => getInvoice({ id }),
    enabled: load,
    refetchOnWindowFocus: false,
  })
}
