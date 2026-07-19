"use client"

import Link from "next/link"
import { type Member } from "@/services/members-service"
import { formatMemberId } from "@/utils/member"
import { formatDate } from "@/utils/utils"
import { type ColumnDef } from "@tanstack/react-table"

import { ageFromDob } from "@workspace/shared/utils/age-calculator"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { cn } from "@workspace/ui/lib/utils"

import {
  MembershipStatusBadge,
  SubscriptionPlanBadge,
} from "@/components/badge"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"

import { getExpiryClass } from "./data"
import { RowActions } from "./row-actions"

export const columns: ColumnDef<Member["detailed"]>[] = [
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
      <div className="w-[80px]">{formatMemberId(row.getValue("id"))}</div>
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
          <Link href={`/members/${formatMemberId(row.getValue("id"))}`}>
            {row.getValue("name")}
          </Link>
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
    accessorKey: "plan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plan" />
    ),
    cell: ({ row }) => {
      const plan = row.getValue("plan") as "free" | "pro" | "default"
      return <SubscriptionPlanBadge plan={plan} />
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

      return age
    },
  },
  {
    accessorKey: "district",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="District" />
    ),
    cell: ({ row }) => {
      return row.getValue("district")
    },
  },
  {
    accessorKey: "memberSince",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Member since" />
    ),
    cell: ({ row }) => {
      if (
        row.getValue("status") === "pending" ||
        row.getValue("status") === "rejected"
      )
        return <div className="w-[100px] truncate">N/A</div>

      const memberSince = row.getValue("memberSince") as string

      return <div className="w-[100px] truncate">{formatDate(memberSince)}</div>
    },
  },
  {
    accessorKey: "expiry",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expiry" />
    ),
    cell: ({ row }) => {
      if (
        row.getValue("status") === "pending" ||
        row.getValue("status") === "rejected"
      )
        return <div className="w-[100px] truncate">N/A</div>

      const expiry = row.getValue("expiry") as string

      return (
        <div className={cn("w-[100px] truncate", getExpiryClass(expiry))}>
          {formatDate(expiry)}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return <MembershipStatusBadge status={row.getValue("status")} />
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <RowActions row={row.original} />,
  },
]
