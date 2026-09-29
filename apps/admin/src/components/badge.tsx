import { cva } from "class-variance-authority"

import { InvoiceStatus, PaymentStatus } from "@workspace/shared/schemas"
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
  const statusConfig = statuses.find((s) => s.value === status)
  const Icon = statusConfig?.icon
  const label = statusConfig?.label ?? status

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
        className="inline-block size-1.25 rounded-full bg-current"
      />
      {status}
    </Badge>
  )
}

export function PendingBadge() {
  return (
    <Badge
      className="rounded-sm bg-yellow-200 text-yellow-700 dark:bg-yellow-700/20
        dark:text-yellow-400"
    >
      ⏳ Pending
    </Badge>
  )
}

export function YesBadge() {
  return (
    <Badge
      className="rounded-sm bg-emerald-200 text-emerald-700 dark:bg-green-700/20
        dark:text-green-400"
    >
      ✓ Yes
    </Badge>
  )
}

export function NoBadge() {
  return (
    <Badge
      className="rounded-sm bg-red-200 text-red-700 dark:bg-red-700/20
        dark:text-red-400"
    >
      ✗ No
    </Badge>
  )
}

const invoiceStatusVariants = cva(
  `flex items-center justify-center text-[0.6875rem] font-light tracking-wide capitalize`,
  {
    variants: {
      status: {
        open: "bg-yellow-200 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400",
        paid: "bg-emerald-200 text-emerald-700 dark:bg-green-700/20 dark:text-green-400",
        void: "bg-gray-200 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400",
        uncollectible:
          "bg-slate-200 text-slate-700 dark:bg-slate-700/20 dark:text-slate-400",
      },
    },
    defaultVariants: {
      status: "open",
    },
  }
)

type InvoiceStatusBadgeProps = React.ComponentProps<typeof Badge> & {
  status: InvoiceStatus
}

export function InvoiceStatusBadge({
  status,
  className,
  ...props
}: InvoiceStatusBadgeProps) {
  return (
    <Badge
      className={cn(invoiceStatusVariants({ status }), className)}
      {...props}
    >
      <span
        data-icon="inline-start"
        className="inline-block size-1.25 rounded-full bg-current"
      />
      {status}
    </Badge>
  )
}

const paymentStatusVariants = cva(
  `flex items-center justify-center text-[0.6875rem] font-light tracking-wide capitalize`,
  {
    variants: {
      status: {
        success:
          "bg-emerald-200 text-emerald-700 dark:bg-green-700/20 dark:text-green-400",
        pending:
          "bg-yellow-200 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400",
        failed: "bg-red-200 text-red-700 dark:bg-red-700/20 dark:text-red-400",
        refunded:
          "bg-slate-200 text-slate-700 dark:bg-slate-700/20 dark:text-slate-400",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
)

type PaymentStatusBadgeProps = React.ComponentProps<typeof Badge> & {
  status: PaymentStatus
}

export function PaymentStatusBadge({
  status,
  className,
  ...props
}: PaymentStatusBadgeProps) {
  return (
    <Badge
      className={cn(paymentStatusVariants({ status }), className)}
      {...props}
    >
      <span
        data-icon="inline-start"
        className="inline-block size-1.25 rounded-full bg-current"
      />
      {status}
    </Badge>
  )
}
