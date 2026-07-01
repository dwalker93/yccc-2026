"use client"

import { Users } from "lucide-react"

import { Districts } from "@workspace/shared/constants/districts"

import { useMembers } from "@/hooks/members/use-members"
import { usePlans } from "@/hooks/plans/use-plans"
import { DataTable } from "@/components/data-tables/data-table"
import { DataTableEmptyState } from "@/components/data-tables/data-table-empty-state"
import { useMemberFilterSearchParams } from "@/components/data-tables/data-table-state-params-parser"

import { columnMappings } from "./column-name-mappings"
import { columns } from "./columns"
import { statuses } from "./data"

export function MembersTable() {
  const { data, isLoading } = useMembers()
  const { data: plans } = usePlans()
  const [columnFilters, setColumnFilters] = useMemberFilterSearchParams()
  const isSearching = columnFilters.some((f) => f.value)

  const planOptions = (plans ?? []).map((p) => ({
    value: p.name.toLowerCase(),
    label: p.name,
  }))

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
          icon={Users}
          message={
            isSearching ? "No members match your search" : "No members yet"
          }
          description={
            isSearching
              ? "Try a different search term."
              : "Members will appear here once they register."
          }
        />
      }
      facetedFilters={[
        {
          columnKey: "status",
          title: "Status",
          options: [...statuses],
        },
        {
          columnKey: "plan",
          title: "Plan",
          options: planOptions,
        },
        {
          columnKey: "district",
          title: "District",
          options: Districts.map((d) => ({
            value: d,
            label: d,
          })),
        },
      ]}
      actionButton={{ label: "+ Add member", href: "/members/create" }}
    />
  )
}
