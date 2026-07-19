"use client"

import { XCircle } from "lucide-react"

import { useMembers } from "@/hooks/members/use-members"
import { DataTable } from "@/components/data-tables/data-table"
import { DataTableEmptyState } from "@/components/data-tables/data-table-empty-state"
import { usePendingMemberFilterSearchParams } from "@/components/data-tables/data-table-state-params-parser"

import { columnMappings } from "./column-name-mappings"
import { columns } from "./columns"

export function RejectedMembersTable() {
  const { data, isLoading } = useMembers<"rejected">({
    status: "rejected",
    projection: "rejected",
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
          icon={XCircle}
          message={
            isSearching ? "No results for your search" : "No rejected members"
          }
          description={
            isSearching
              ? "Try a different search term."
              : "All applications have been approved or are pending review."
          }
        />
      }
    />
  )
}
