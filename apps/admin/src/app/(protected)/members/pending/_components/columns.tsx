"use client"

import { type Member } from "@/services/members-service"
import { formatMemberId } from "@/utils/member"
import { type ColumnDef } from "@tanstack/react-table"

import { Checkbox } from "@workspace/ui/components/checkbox"
import { cn } from "@workspace/ui/lib/utils"

import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"

import {
  getInvoiceStatusClass,
  getPlanBadgeClass,
} from "../../_components/data"
import { RowActions } from "./row-actions"

export const columns: ColumnDef<Member["pending"]>[] = [
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
    accessorKey: "memberSince",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Applied on" />
    ),
    cell: ({ row }) => {
      const memberSince = row.getValue("memberSince") as string
      const date = new Date(memberSince)
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

      return <div className="w-[100px] truncate">{formattedDate}</div>
    },
  },
  {
    accessorKey: "plan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plan" />
    ),
    cell: ({ row }) => {
      const plan = row.getValue("plan") as string
      return (
        <span
          className={cn(
            "rounded-sm px-2 py-0.5 font-medium uppercase",
            getPlanBadgeClass(plan.toLowerCase())
          )}
        >
          {plan}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "paymentMethodName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Method" />
    ),
    cell: ({ row }) => {
      const paymentMethodName = row.getValue("paymentMethodName") as string
      return <div>{paymentMethodName}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invoice Number" />
    ),
    cell: ({ row }) => {
      const invoiceNumber = row.getValue("invoiceNumber") as string
      return <div>{invoiceNumber}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: "invoiceStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invoice Status" />
    ),
    cell: ({ row }) => {
      const invoiceStatus = row.getValue("invoiceStatus") as string
      return (
        <span
          className={cn(
            "rounded-sm px-2 py-0.5 capitalize",
            getInvoiceStatusClass(invoiceStatus)
          )}
        >
          {invoiceStatus}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "invoiceDueAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invoice Due Date" />
    ),
    cell: ({ row }) => {
      const invoiceDueAt = row.getValue("invoiceDueAt") as string
      const date = new Date(invoiceDueAt)
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

      return <div className="w-[100px] truncate">{formattedDate}</div>
    },
    enableSorting: false,
  },
  {
    id: "actions",
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => <RowActions row={row.original} />,
  },
]
