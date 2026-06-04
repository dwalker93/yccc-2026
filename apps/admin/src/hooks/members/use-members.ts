import { useSearchParams } from "next/navigation"
import { Member } from "@/services/members-service"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { SearchableColumn } from "@/app/(protected)/members/_components/data"

import { memberKeys } from "./keys"

type MembersParams = {
  pageIndex: string
  pageSize: string
  searchTerm: string
  searchBy: SearchableColumn
  status: string
}

type MembersResponse = {
  members: Member[]
  totalCount: number
}

function buildMembersUrl(params: MembersParams) {
  const sp = new URLSearchParams()
  if (params.searchTerm) sp.set("q", params.searchTerm)
  if (params.searchTerm) sp.set("searchBy", params.searchBy)
  if (params.status) sp.set("status", params.status)
  sp.set("page", params.pageIndex)
  sp.set("perPage", params.pageSize)
  return `/api/members?${sp}`
}

export const useMembers = () => {
  const searchParams = useSearchParams()
  const pageIndex = searchParams.get("page") || "1"
  const pageSize = searchParams.get("perPage") || "10"

  const searchTerm = searchParams.get("q") || ""
  const searchBy = (searchParams.get("searchBy") || "id") as SearchableColumn
  const status = searchParams.get("status") || ""

  const params: MembersParams = {
    pageIndex,
    pageSize,
    searchTerm,
    searchBy,
    status,
  }

  return useQuery<MembersResponse>({
    queryKey: memberKeys.filtered(params),
    queryFn: async () => {
      const res = await fetch(buildMembersUrl(params))
      if (!res.ok) {
        throw new Error(`Failed to fetch members (${res.status})`)
      }
      return res.json() as Promise<MembersResponse>
    },
    placeholderData: keepPreviousData,
  })
}
