import { Ban, CheckCircle, Clock, XCircle, type LucideIcon } from "lucide-react"

import { memberStatus, subscriptionStatus } from "@workspace/shared/schemas"

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

export type SubscriptionStatus =
  | (typeof subscriptionStatus.enumValues)[number]
  | "inactive"
