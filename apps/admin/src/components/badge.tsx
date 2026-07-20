import { cva } from "class-variance-authority"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import { statuses, SubscriptionStatus, type Status } from "@/config/data"

const memberShipStatusVariants = cva(
  `text-[0.6875rem] font-light tracking-wide`,
  {
    variants: {
      status: {
        pending:
          "bg-amber-200 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400",
        approved:
          "bg-emerald-200 text-emerald-700 dark:bg-green-700/20 dark:text-green-400",
        rejected:
          "bg-red-200 text-red-700 dark:bg-red-700/20 dark:text-red-400",
        suspended:
          "bg-purple-200 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400",
        banned: "bg-red-200 text-red-800 dark:bg-red-700/20 dark:text-red-400",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
)

type MembershipStatusBadgeProps = React.ComponentProps<typeof Badge> & {
  status: Status
}

export function MembershipStatusBadge({
  status,
  className,
  ...props
}: MembershipStatusBadgeProps) {
  const { icon: Icon, label } = statuses.find((s) => s.value === status)!
  return (
    <Badge
      className={cn(memberShipStatusVariants({ status }), className)}
      {...props}
    >
      {Icon && <Icon className="size-2.5" data-icon="inline-start" />}
      {label}
    </Badge>
  )
}

const subscriptionPlanVariants = cva(
  `rounded-sm font-medium tracking-wide uppercase`,
  {
    variants: {
      plan: {
        free: "border border-slate-400 bg-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-700/20 dark:text-slate-400",
        pro: "border border-emerald-400 bg-emerald-200 text-emerald-700 dark:border-green-700 dark:bg-green-700/20 dark:text-green-400",
        default:
          "border border-blue-400 bg-blue-200 text-blue-700 dark:border-blue-700 dark:bg-blue-700/20 dark:text-blue-400",
      },
    },
    defaultVariants: {
      plan: "default",
    },
  }
)

type SubscriptionPlanBadgeProps = React.ComponentProps<typeof Badge> & {
  plan: "free" | "pro" | "default"
}

export function SubscriptionPlanBadge({
  plan,
  className,
  ...props
}: SubscriptionPlanBadgeProps) {
  return (
    <Badge
      className={cn(subscriptionPlanVariants({ plan }), className)}
      {...props}
    >
      {plan}
    </Badge>
  )
}

const subscriptionStatusVariants = cva(
  `flex items-center justify-center text-[0.6875rem] font-light tracking-wide capitalize`,
  {
    variants: {
      status: {
        active:
          "bg-emerald-200 text-emerald-700 dark:bg-green-700/20 dark:text-green-400",
        scheduled:
          "bg-blue-200 text-blue-700 dark:bg-blue-700/20 dark:text-blue-400",
        cancelled:
          "bg-gray-200 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400",
        expired: "bg-red-200 text-red-700 dark:bg-red-700/20 dark:text-red-400",
        past_due:
          "bg-yellow-200 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400",
        paused:
          "bg-purple-200 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400",
        inactive:
          "bg-slate-200 text-slate-700 dark:bg-slate-700/20 dark:text-slate-400",
      },
    },
    defaultVariants: {
      status: "inactive",
    },
  }
)

type SubscriptionStatusBadgeProps = React.ComponentProps<typeof Badge> & {
  status: SubscriptionStatus
}

export function SubscriptionStatusBadge({
  status,
  className,
  ...props
}: SubscriptionStatusBadgeProps) {
  return (
    <Badge
      className={cn(subscriptionStatusVariants({ status }), className)}
      {...props}
    >
      <span
        data-icon="inline-start"
        className="inline-block size-[5px] rounded-full bg-current"
      />
      {status}
    </Badge>
  )
}
