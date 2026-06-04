import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table"
import {
  parseAsArrayOf,
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs"

import {
  SearchableColumn,
  searchableColumns,
  Status,
  statuses,
} from "@/app/(protected)/members/_components/data"

const paginationParsers = {
  pageIndex: parseAsIndex.withDefault(0),
  pageSize: parseAsInteger.withDefault(10),
}
const paginationUrlKeys = {
  pageIndex: "page",
  pageSize: "perPage",
}

export function usePaginationSearchParams() {
  return useQueryStates(paginationParsers, {
    urlKeys: paginationUrlKeys,
  })
}

const SEARCHABLE_COLUMNS = searchableColumns.map(
  (c) => c.value
) satisfies SearchableColumn[]

const STATUS_OPTIONS = statuses.map((s) => s.value) satisfies Status[]

export const filterParsers = {
  q: parseAsString.withDefault(""),
  searchBy: parseAsStringLiteral(SEARCHABLE_COLUMNS).withDefault("id"),
  status: parseAsArrayOf(parseAsStringLiteral(STATUS_OPTIONS)).withDefault([]),
}

export function useFilterSearchParams() {
  const [params, setParams] = useQueryStates(filterParsers)

  // URL params → ColumnFiltersState
  const columnFilters: ColumnFiltersState = [
    params.q ? { id: params.searchBy, value: params.q } : null,
    params.status.length ? { id: "status", value: params.status } : null,
  ].filter(Boolean) as ColumnFiltersState

  // ColumnFiltersState → URL params
  const handleChange: OnChangeFn<ColumnFiltersState> = (updaterOrValue) => {
    const next =
      typeof updaterOrValue === "function"
        ? updaterOrValue(columnFilters)
        : updaterOrValue

    const update: {
      q: string | null
      searchBy: SearchableColumn | null
      status: (typeof STATUS_OPTIONS)[number][] | null
    } = {
      q: null,
      searchBy: null,
      status: null,
    }

    for (const filter of next) {
      if (SEARCHABLE_COLUMNS.includes(filter.id as SearchableColumn)) {
        update.q = filter.value ? String(filter.value) : null
        update.searchBy = filter.id as SearchableColumn
        continue
      }

      if (filter.id === "status") {
        const val = filter.value as string[]
        const filtered = val.filter((v): v is (typeof STATUS_OPTIONS)[number] =>
          STATUS_OPTIONS.includes(v as Status)
        )
        update.status = filtered.length ? filtered : null
        continue
      }
    }

    if (!update.q) update.searchBy = null

    setParams(update)
  }

  return [columnFilters, handleChange] as const
}
