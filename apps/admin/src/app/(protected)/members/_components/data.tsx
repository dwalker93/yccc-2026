import dayjs from "dayjs"
import { Ban, CheckCircle, Clock, XCircle, type LucideIcon } from "lucide-react"

import { memberStatus } from "@workspace/shared/schemas/member-schema"

export type Status = (typeof memberStatus.enumValues)[number]

export const statuses = [
  {
    value: "pending",
    label: "Pending",
    icon: Clock,
  },
  {
    value: "approved",
    label: "Approved",
    icon: CheckCircle,
  },
  {
    value: "rejected",
    label: "Rejected",
    icon: XCircle,
  },
  {
    value: "suspended",
    label: "Suspended",
    icon: Ban,
  },
  {
    value: "banned",
    label: "Banned",
    icon: Ban,
  },
] as const satisfies readonly {
  value: Status
  label: string
  icon: LucideIcon
}[]

// Compile-time check to ensure all Status values are present in the statuses array.
// If a new status is added to memberStatus but not to statuses array, this will throw a type error.
type VerifyStatuses = [Status] extends [(typeof statuses)[number]["value"]]
  ? true
  : "Error: Some Status values are not included in the statuses array"
const _check: VerifyStatuses = true

export const searchableColumns = [
  { value: "id", label: "ID" }, // default
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
] as const satisfies readonly {
  value: string
  label: string
  default?: boolean
}[]

export type SearchableColumn = (typeof searchableColumns)[number]["value"]

export const getStatusBadgeClass = (status: Status) => {
  switch (status) {
    case "pending":
      return "bg-amber-200 text-amber-700 border border-amber-400 dark:bg-amber-700/20 dark:text-amber-400 dark:border-amber-900"
    case "approved":
      return "bg-emerald-200 text-emerald-700 border border-emerald-400 dark:bg-green-700/20 dark:text-green-400 dark:border-green-700"
    case "rejected":
      return "bg-red-200 text-red-700 border border-red-400 dark:bg-red-700/20 dark:text-red-400 dark:border-red-700"
    case "suspended":
      return "bg-purple-200 text-purple-700 border border-purple-400 dark:bg-purple-700/20 dark:text-purple-400 dark:border-purple-700"
    case "banned":
      return "bg-red-200 text-red-800 border border-red-400 dark:bg-red-700/20 dark:text-red-400 dark:border-red-700"
  }
}

const planBadgeClasses: Record<string, string> = {
  free: "bg-slate-200 text-slate-700 border border-slate-400 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-700",
  pro: "bg-emerald-200 text-emerald-700 border border-emerald-400 dark:bg-green-700/20 dark:text-green-400 dark:border-green-700",
}

const defaultPlanBadgeClass =
  "bg-blue-200 text-blue-700 border border-blue-400 dark:bg-blue-700/20 dark:text-blue-400 dark:border-blue-700"

export const getPlanBadgeClass = (plan: string) => {
  return planBadgeClasses[plan.toLowerCase()] ?? defaultPlanBadgeClass
}

export const getExpiryClass = (expiry: string) => {
  const expiryDate = dayjs(expiry)
  const today = dayjs()
  const daysUntilExpiry = expiryDate.diff(today, "day")

  if (daysUntilExpiry <= 7) {
    return "text-red-700 dark:text-red-400"
  } else if (daysUntilExpiry > 7 && daysUntilExpiry < 45) {
    return "text-amber-700 dark:text-amber-400"
  } else {
    return "text-emerald-700 dark:text-green-400"
  }
}
