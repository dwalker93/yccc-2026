"use client"

import { type Member } from "@/services/members-service"
import { type ColumnDef } from "@tanstack/react-table"

import { ageFromDob } from "@workspace/shared/utils/age-calculator"
import { Checkbox } from "@workspace/ui/components/checkbox"

import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"

import { statuses } from "./data"

export const columns: ColumnDef<Member>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        {(row.getValue("id") as string).split("MEM")[1]}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[500px] truncate font-medium">
          {row.getValue("name")}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[500px] truncate font-medium">
          {row.getValue("email")}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => {
      return row.getValue("phone")
    },
    enableSorting: false,
  },
  {
    accessorKey: "nic",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NIC" />
    ),
    cell: ({ row }) => {
      return row.getValue("nic")
    },
    enableSorting: false,
  },
  {
    accessorKey: "dateOfBirth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age" />
    ),
    cell: ({ row }) => {
      const dateOfBirth = row.getValue<string | null | undefined>("dateOfBirth")
      const age = dateOfBirth ? ageFromDob(dateOfBirth) : "—"

      return <div className="w-[100px] truncate">{age}</div>
    },
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }) => {
      return row.getValue("city")
    },
  },
  {
    accessorKey: "registeredAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Member since" />
    ),
    cell: ({ row }) => {
      if (row.getValue("status") !== "approved")
        return <div className="w-[100px] truncate">N/A</div>

      const registeredAt = row.getValue("registeredAt") as string
      const date = new Date(registeredAt)
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

      return <div className="w-[100px] truncate">{formattedDate}</div>
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center gap-2">
          {status.icon && (
            <status.icon className="size-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
]
