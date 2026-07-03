import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table"
import {
  parseAsArrayOf,
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs"

import { Districts } from "@workspace/shared/constants/districts"

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

const PLAN_OPTIONS = ["free", "pro"] as const // TODO: replace with actual plan options from plans api response

function getSearchFilter(q: string, searchBy: SearchableColumn) {
  return q ? { id: searchBy, value: q } : null
}

function getSearchFilterUpdate(nextFilters: ColumnFiltersState) {
  const update = {
    q: null as string | null,
    searchBy: null as SearchableColumn | null,
  }

  for (const filter of nextFilters) {
    if (SEARCHABLE_COLUMNS.includes(filter.id as SearchableColumn)) {
      update.q = filter.value ? String(filter.value) : null
      update.searchBy = filter.id as SearchableColumn
      break
    }
  }

  if (!update.q) update.searchBy = null
  return update
}

export const filterParsers = {
  q: parseAsString.withDefault(""),
  searchBy: parseAsStringLiteral(SEARCHABLE_COLUMNS).withDefault("id"),
  status: parseAsArrayOf(parseAsStringLiteral(STATUS_OPTIONS)).withDefault([]),
  plan: parseAsArrayOf(parseAsStringLiteral(PLAN_OPTIONS)).withDefault([]),
  district: parseAsArrayOf(parseAsStringLiteral(Districts)).withDefault([]),
}

export function useMemberFilterSearchParams() {
  const [params, setParams] = useQueryStates(filterParsers)

  // URL params → ColumnFiltersState
  const columnFilters: ColumnFiltersState = [
    getSearchFilter(params.q, params.searchBy),
    params.status.length ? { id: "status", value: params.status } : null,
    params.plan.length ? { id: "plan", value: params.plan } : null,
    params.district.length ? { id: "district", value: params.district } : null,
  ].filter(Boolean) as ColumnFiltersState

  // ColumnFiltersState → URL params
  const handleChange: OnChangeFn<ColumnFiltersState> = (updaterOrValue) => {
    const next =
      typeof updaterOrValue === "function"
        ? updaterOrValue(columnFilters)
        : updaterOrValue

    const searchUpdate = getSearchFilterUpdate(next)

    const update = {
      ...searchUpdate,
      status: null as (typeof STATUS_OPTIONS)[number][] | null,
      plan: null as (typeof PLAN_OPTIONS)[number][] | null,
      district: null as (typeof Districts)[number][] | null,
    }

    for (const filter of next) {
      if (filter.id === "status") {
        const val = filter.value as string[]
        const filtered = val.filter((v): v is (typeof STATUS_OPTIONS)[number] =>
          STATUS_OPTIONS.includes(v as Status)
        )
        update.status = filtered.length ? filtered : null
        continue
      }

      if (filter.id === "plan") {
        const val = filter.value as string[]
        const filtered = val.filter((v): v is (typeof PLAN_OPTIONS)[number] =>
          PLAN_OPTIONS.includes(v as (typeof PLAN_OPTIONS)[number])
        )
        update.plan = filtered.length ? filtered : null
        continue
      }

      if (filter.id === "district") {
        const val = filter.value as string[]
        const filtered = val.filter((v): v is (typeof Districts)[number] =>
          Districts.includes(v as (typeof Districts)[number])
        )
        update.district = filtered.length ? filtered : null
        continue
      }
    }

    setParams(update)
  }

  return [columnFilters, handleChange] as const
}

export const pendingFilterParsers = {
  q: parseAsString.withDefault(""),
  searchBy: parseAsStringLiteral(SEARCHABLE_COLUMNS).withDefault("id"),
}

export function usePendingMemberFilterSearchParams() {
  const [params, setParams] = useQueryStates(pendingFilterParsers)

  // URL params → ColumnFiltersState
  const columnFilters: ColumnFiltersState = [
    getSearchFilter(params.q, params.searchBy),
  ].filter(Boolean) as ColumnFiltersState

  // ColumnFiltersState → URL params
  const handleChange: OnChangeFn<ColumnFiltersState> = (updaterOrValue) => {
    const next =
      typeof updaterOrValue === "function"
        ? updaterOrValue(columnFilters)
        : updaterOrValue

    const update = getSearchFilterUpdate(next)
    setParams(update)
  }

  return [columnFilters, handleChange] as const
}
