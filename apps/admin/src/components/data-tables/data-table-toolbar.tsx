"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { type Table } from "@tanstack/react-table"
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
  searchPlaceholder?: string
  facetedFilters?: FacetedFilterConfig[]
  actionButton?: {
    label: string
    href: string
  }
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Filter...",
  facetedFilters = [],
  actionButton,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const [searchColumn, setSearchColumn] = React.useState<SearchableColumn>(
    () => {
      const defaultColumn = searchableColumns.find((column) =>
        table.getColumn(column.value)?.getFilterValue()
      )
      return defaultColumn?.value ?? "id"
    }
  )

  const [searchInput, setSearchInput] = React.useState<string>(() => {
    const v = table.getColumn(searchColumn)?.getFilterValue()
    return typeof v === "string" ? v : ""
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!searchInput) {
        table.getColumn(searchColumn)?.setFilterValue(null)
        return
      }
      table.getColumn(searchColumn)?.setFilterValue(searchInput)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput, searchColumn, table])

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
                    Search
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
            variant="ghost"
            size="sm"
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
        <DataTableViewOptions table={table} />
        {actionButton && (
          <Button size="sm" asChild>
            <Link href={actionButton.href}>{actionButton.label}</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
