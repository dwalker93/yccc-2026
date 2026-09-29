import { PaymentMethodOption } from "@/services/payment-method-service"
import { useQuery } from "@tanstack/react-query"

import { paymentMethodKeys } from "./keys"

export const usePaymentMethods = () => {
  return useQuery<PaymentMethodOption[]>({
    queryKey: paymentMethodKeys.all,
    queryFn: async () => {
      const res = await fetch("/api/payment-methods")
      if (!res.ok) {
        throw new Error(`Failed to fetch payment methods (${res.status})`)
      }
      return res.json() as Promise<PaymentMethodOption[]>
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // keep in cache for 1 hour
  })
}
