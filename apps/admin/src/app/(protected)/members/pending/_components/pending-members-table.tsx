"use client"

import { bulkApproveMemberAction } from "@/actions/members-actions"
import { useQueryClient } from "@tanstack/react-query"
import { ClipboardList } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

import { memberKeys } from "@/hooks/members/keys"
import { useMembers } from "@/hooks/members/use-members"
import { ChangeMemberStatusDialog } from "@/components/change-member-status-dialog"
import { DataTable } from "@/components/data-tables/data-table"
import { DataTableEmptyState } from "@/components/data-tables/data-table-empty-state"
import { usePendingMemberFilterSearchParams } from "@/components/data-tables/data-table-state-params-parser"

import { columnMappings } from "./column-name-mappings"
import { columns } from "./columns"

export function PendingMembersTable() {
  const { data, isLoading } = useMembers({
    status: "pending",
    projection: "pending",
  })
  const [columnFilters, setColumnFilters] = usePendingMemberFilterSearchParams()
  const isSearching = columnFilters.some((f) => f.value)
  const queryClient = useQueryClient()

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
          icon={ClipboardList}
          message={
            isSearching
              ? "No results for your search"
              : "No pending applications"
          }
          description={
            isSearching
              ? "Try a different search term."
              : "All applications have been reviewed."
          }
        />
      }
      actionButton={{
        label: "Approve all",
        hide: (table) => {
          const totalCount = data?.totalCount ?? 0
          const selectedCount = Object.keys(
            table.getState().rowSelection
          ).length
          return selectedCount ? selectedCount > 10 : totalCount > 10
        },
        render: (table) => {
          const selectedCount = Object.keys(
            table.getState().rowSelection
          ).length

          return (
            <ChangeMemberStatusDialog
              trigger={
                <Button className="h-8">
                  {selectedCount > 0
                    ? `Approve ${selectedCount}`
                    : "Approve all"}
                </Button>
              }
              members={
                selectedCount > 0
                  ? (data?.members.filter((m) =>
                      table
                        .getState()
                        .rowSelection.hasOwnProperty(m.id.toString())
                    ) ?? [])
                  : (data?.members ?? [])
              }
              action="bulkApprove"
              onSubmit={async (data) => {
                const result = await bulkApproveMemberAction(
                  data.memberIds,
                  data.reason,
                  data.note
                )
                if (result.success) {
                  toast.success("Members approved")
                  queryClient.invalidateQueries({ queryKey: memberKeys.all })
                  table.resetRowSelection()
                } else {
                  toast.error(result.error)
                }
                return result
              }}
            />
          )
        },
      }}
    />
  )
}
