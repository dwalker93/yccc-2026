"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type SortingState,
  type Table,
  type VisibilityState,
} from "@tanstack/react-table"

import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { DataTablePagination } from "./data-table-pagination"
import { usePaginationSearchParams } from "./data-table-state-params-parser"
import {
  DataTableToolbar,
  type FacetedFilterConfig,
} from "./data-table-toolbar"

interface DataTableProps<TData extends { id: string }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  columnNameMappings?: Record<string, string>
  data: TData[]
  totalCount: number
  emptyState?: React.ReactNode
  isLoading: boolean
  searchKey?: string
  searchPlaceholder?: string
  facetedFilters?: FacetedFilterConfig[]
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  actionButton?: { label: string; hide?: (table: Table<TData>) => boolean } & (
    | { onClick?: never; href: string; render?: never }
    | { onClick: (table: Table<TData>) => void; href?: never; render?: never }
    | {
        onClick?: never
        href?: never
        render: (table: Table<TData>) => React.ReactNode
      }
  )
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  columnNameMappings,
  data: rawData,
  totalCount,
  emptyState,
  searchKey,
  searchPlaceholder,
  facetedFilters,
  actionButton,
  isLoading = false,
  columnFilters,
  onColumnFiltersChange,
}: DataTableProps<TData, TValue>) {
  // Deduplicate data by id to prevent "duplicate key" warnings that can occur
  // when keepPreviousData provides stale placeholder rows during transitions.
  const data = React.useMemo(() => {
    const seen = new Set<string>()
    return rawData.filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  }, [rawData])
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [sorting, setSorting] = React.useState<SortingState>([])

  const [pagination, setPagination] = usePaginationSearchParams()

  React.useEffect(() => {
    setRowSelection({})
  }, [columnFilters, pagination.pageIndex, pagination.pageSize])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    onPaginationChange: setPagination,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    rowCount: totalCount,
  })

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        columnNameMappings={columnNameMappings}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        facetedFilters={facetedFilters}
        actionButton={actionButton}
      />
      <div
        className="overflow-hidden rounded-md border bg-table
          dark:text-muted-foreground"
      >
        <ShadcnTable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : emptyState ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </ShadcnTable>
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
