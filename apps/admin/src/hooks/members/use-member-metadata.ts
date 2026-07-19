import { MemberMetadata } from "@/services/member-service"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { memberKeys } from "./keys"

export const useMemberMetadata = (id: string) => {
  return useQuery<MemberMetadata>({
    queryKey: memberKeys.metadata(id),
    queryFn: async () => {
      const res = await fetch(`/api/members/${id}/metadata`)
      if (!res.ok) {
        throw new Error("Failed to fetch member metadata")
      }
      return res.json() as Promise<MemberMetadata>
    },
    placeholderData: keepPreviousData,
  })
}
