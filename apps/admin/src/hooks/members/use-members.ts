import { useSearchParams } from "next/navigation"
import { type Member, type ProjectionPreset } from "@/services/members-service"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { SearchableColumn } from "@/app/(protected)/members/_components/data"

import { memberKeys } from "./keys"

type MembersParams<TProjection extends ProjectionPreset = "detailed"> = {
  pageIndex: string
  pageSize: string
  searchTerm: string
  searchBy: SearchableColumn
  status: string
  plan: string
  district: string
  projection?: TProjection
}

type MembersResponse<TProjection extends ProjectionPreset = "detailed"> = {
  members: Member[TProjection][]
  totalCount: number
}

function buildMembersUrl(params: MembersParams<ProjectionPreset>) {
  const sp = new URLSearchParams()
  if (params.searchTerm) sp.set("q", params.searchTerm)
  if (params.searchTerm) sp.set("searchBy", params.searchBy)
  if (params.status) sp.set("status", params.status)
  if (params.plan) sp.set("plan", params.plan)
  if (params.district) sp.set("district", params.district)
  if (params.projection) sp.set("projection", params.projection)
  sp.set("page", params.pageIndex)
  sp.set("perPage", params.pageSize)
  return `/api/members?${sp}`
}

export const useMembers = <TProjection extends ProjectionPreset = "detailed">(
  defaultParams?: Partial<MembersParams<TProjection>>
) => {
  const searchParams = useSearchParams()
  const pageIndex = searchParams.get("page") || "1"
  const pageSize = searchParams.get("perPage") || "10"

  const searchTerm = searchParams.get("q") || ""
  const searchBy = (searchParams.get("searchBy") || "id") as SearchableColumn
  const status = (defaultParams?.status ?? searchParams.get("status")) || ""
  const plan = searchParams.get("plan") || ""
  const district = searchParams.get("district") || ""
  const projection = defaultParams?.projection

  const params: MembersParams<TProjection> = {
    pageIndex,
    pageSize,
    searchTerm,
    searchBy,
    status,
    plan,
    district,
    projection,
  }

  return useQuery<MembersResponse<TProjection>>({
    queryKey: memberKeys.filtered(params),
    queryFn: async () => {
      const res = await fetch(buildMembersUrl(params))
      if (!res.ok) {
        throw new Error(`Failed to fetch members (${res.status})`)
      }
      return res.json() as Promise<MembersResponse<TProjection>>
    },
    placeholderData: keepPreviousData,
  })
}

