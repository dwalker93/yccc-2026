import { useQuery } from "@tanstack/react-query"

import { PlanOption } from "@/services/plans-service"

import { planKeys } from "./keys"

export const usePlans = () => {
  return useQuery<PlanOption[]>({
    queryKey: planKeys.active(),
    queryFn: async () => {
      const res = await fetch("/api/plans")
      if (!res.ok) {
        throw new Error(`Failed to fetch plans (${res.status})`)
      }
      return res.json() as Promise<PlanOption[]>
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // keep in cache for 1 hour
  })
}
