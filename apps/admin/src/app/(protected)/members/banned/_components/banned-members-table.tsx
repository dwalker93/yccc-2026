"use client"

import { Ban } from "lucide-react"

import { useMembers } from "@/hooks/members/use-members"
import { DataTable } from "@/components/data-tables/data-table"
import { DataTableEmptyState } from "@/components/data-tables/data-table-empty-state"
import { usePendingMemberFilterSearchParams } from "@/components/data-tables/data-table-state-params-parser"

import { columnMappings } from "./column-name-mappings"
import { columns } from "./columns"

export function BannedMembersTable() {
  const { data, isLoading } = useMembers({
    status: "banned",
    projection: "banned",
  })
  const [columnFilters, setColumnFilters] = usePendingMemberFilterSearchParams()
  const isSearching = columnFilters.some((f) => f.value)

  return (
    <DataTable
      data={data?.members ?? []}
      totalCount={data?.totalCount ?? 0}
      columns={columns}
      columnFilters={columnFilters}
      onColumnFiltersChange={setColumnFilters}
      columnNameMappings={columnMappings}
      isLoading={isLoading}
      searchKey="name" // TODO: this need to be changed in future
      searchPlaceholder="Search members..."
      emptyState={
        <DataTableEmptyState
          icon={Ban}
          message={
            isSearching ? "No results for your search" : "No banned members"
          }
          description={
            isSearching
              ? "Try a different search term."
              : "No members have been banned from the platform."
          }
        />
      }
    />
  )
}
