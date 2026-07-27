"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { type ColumnFiltersState, type Table } from "@tanstack/react-table"
import { Check, ChevronDownIcon, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"

import {
  SearchableColumn,
  searchableColumns,
} from "@/app/(protected)/members/_components/data"

import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { DataTableViewOptions } from "./data-table-view-options"

export interface FacetedFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface FacetedFilterConfig {
  columnKey: string
  title: string
  options: FacetedFilterOption[]
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  columnNameMappings?: Record<string, string>
  searchPlaceholder?: string
  facetedFilters?: FacetedFilterConfig[]
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

// Single source of truth for "which searchable column currently has a
// filter value, and what is it" — used for both the initial state and
// the render-phase reverse-sync below.
function getExternalSearch(columnFilters: ColumnFiltersState) {
  const match = columnFilters.find((f) =>
    searchableColumns.some((col) => col.value === f.id)
  )
  return {
    column: (match?.id as SearchableColumn) ?? "id",
    value: typeof match?.value === "string" ? match.value : "",
  }
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  columnNameMappings,
  searchPlaceholder = "Filter...",
  facetedFilters = [],
  actionButton,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const [searchColumn, setSearchColumn] = React.useState<SearchableColumn>(
    () => getExternalSearch(table.getState().columnFilters).column
  )

  const [searchInput, setSearchInput] = React.useState<string>(
    () => getExternalSearch(table.getState().columnFilters).value
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      table.setColumnFilters((prev) => {
        const filtered = prev.filter(
          (f) => !searchableColumns.some((col) => col.value === f.id)
        )
        if (searchInput) {
          filtered.push({
            id: searchColumn,
            value: searchInput,
          })
        }
        return filtered
      })
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput, searchColumn, table])

  // Reverse sync: URL-driven columnFilters → toolbar local state.
  // Uses React's render-phase state adjustment pattern to avoid setState in effects.
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const external = getExternalSearch(table.getState().columnFilters)

  const [prevExternal, setPrevExternal] = React.useState(external)
  if (
    prevExternal.value !== external.value ||
    prevExternal.column !== external.column
  ) {
    setPrevExternal(external)
    setSearchInput(external.value)
    setSearchColumn(external.column)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        {searchKey && (
          <InputGroup className="h-8 w-[300px] lg:w-[400px]">
            <InputGroupInput
              placeholder={searchPlaceholder}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <InputGroupButton variant="ghost" className="pr-1.5! text-xs">
                    Search{" "}
                    {searchableColumns.find((c) => c.value === searchColumn)
                      ?.label ?? searchColumn}{" "}
                    <ChevronDownIcon className="size-3" />
                  </InputGroupButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    {searchableColumns.map((column) => (
                      <DropdownMenuItem
                        key={column.value}
                        onClick={() => {
                          setSearchColumn(column.value)
                        }}
                        className="flex items-center justify-between"
                      >
                        {column.label}
                        {searchColumn === column.value && (
                          <Check className="size-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </InputGroupAddon>
          </InputGroup>
        )}
        {facetedFilters.map((filter) =>
          table.getColumn(filter.columnKey) ? (
            <DataTableFacetedFilter
              key={filter.columnKey}
              column={table.getColumn(filter.columnKey)}
              title={filter.title}
              options={filter.options}
            />
          ) : null
        )}
        {isFiltered && (
          <Button
            variant="destructive"
            className="h-8"
            onClick={() => {
              setSearchInput("")
              table.resetColumnFilters()
              setSearchColumn("id")
            }}
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions
          table={table}
          columnNameMappings={columnNameMappings}
        />
        {actionButton &&
          !actionButton.hide?.(table) &&
          (actionButton.href !== undefined ? (
            <Button size="sm" asChild>
              <Link className="h-8" href={actionButton.href}>
                {actionButton.label}
              </Link>
            </Button>
          ) : actionButton.onClick !== undefined ? (
            <Button
              size="sm"
              className="h-8"
              onClick={() => actionButton.onClick(table)}
            >
              {actionButton.label}
            </Button>
          ) : actionButton.render !== undefined ? (
            actionButton.render(table)
          ) : null)}
      </div>
    </div>
  )
}
