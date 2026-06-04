"use client"

import { useMembers } from "@/hooks/members/use-members"
import { DataTable } from "@/components/data-tables/data-table"

import { columns } from "./columns"
import { statuses } from "./data"

export function MembersTable() {
  const { data, isLoading } = useMembers()
  return (
    <DataTable
      data={data?.members ?? []}
      totalCount={data?.totalCount ?? 0}
      columns={columns}
      isLoading={isLoading}
      searchKey="name" // TODO: this need to be changed in future
      searchPlaceholder="Search members..."
      facetedFilters={[
        {
          columnKey: "status",
          title: "Status",
          options: [...statuses],
        },
      ]}
      actionButton={{ label: "Add member", href: "/members/create" }}
    />
  )
}
