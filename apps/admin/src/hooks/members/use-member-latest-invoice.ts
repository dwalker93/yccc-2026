import { MemberLatestInvoice } from "@/services/member-invoice-service"
import { useQuery } from "@tanstack/react-query"

import { memberKeys } from "./keys"

export const useMemberLatestInvoice = (memberId: string) => {
  return useQuery<MemberLatestInvoice>({
    queryKey: memberKeys.latestInvoice(memberId),
    queryFn: async () => {
      const res = await fetch(`/api/members/${memberId}/latest-invoice`)
      if (!res.ok) {
        throw new Error("Failed to fetch member latest invoice")
      }
      return res.json()
    },
  })
}
