import React from "react"
import { MemberFinancials } from "@/services/member-service"
import { formatCurrency } from "@/utils/utils"
import dayjs from "dayjs"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

import { Status } from "@/config/data"

function MemberStatCard({
  title,
  value,
}: {
  title: string
  value: string | number | React.ReactNode
}) {
  return (
    <Card className="col-span-4 gap-2">
      <CardHeader>
        <CardTitle
          className="text-[0.625rem] tracking-widest text-muted-foreground
            uppercase"
        >
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 text-xl font-bold">
        {value}
      </CardContent>
    </Card>
  )
}

export function MemberStatCards({
  financials: { totalPaid, openInvoicesCount, currentExpiryDate },
  membershipStatus,
}: {
  financials: MemberFinancials
  membershipStatus: Status
}) {
  const totalPaidNode = (
    <span className="text-emerald-700 dark:text-green-400">
      {formatCurrency(totalPaid)}
    </span>
  )
  const daysUntilExpiry = dayjs(currentExpiryDate).diff(dayjs(), "day")

  let daysUntilExpiryNode: React.ReactNode
  if (
    !dayjs(currentExpiryDate).isValid() ||
    membershipStatus === "pending" ||
    membershipStatus === "rejected"
  ) {
    daysUntilExpiryNode = "N/A"
  } else if (daysUntilExpiry === 0) {
    daysUntilExpiryNode = (
      <span className="text-red-700 dark:text-red-400">Due Today</span>
    )
  } else if (daysUntilExpiry < 0) {
    daysUntilExpiryNode =
      daysUntilExpiry === -1
        ? `Expired 1 day ago`
        : `Expired ${Math.abs(daysUntilExpiry)} days ago`
  } else {
    daysUntilExpiryNode = (
      <span
        className={cn(
          "text-green-700 dark:text-green-400",
          daysUntilExpiry > 10 &&
            daysUntilExpiry <= 30 &&
            "text-yellow-700 dark:text-yellow-400",
          daysUntilExpiry <= 10 && "text-red-700 dark:text-red-400"
        )}
      >
        {daysUntilExpiry}
      </span>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <MemberStatCard title="Total Paid" value={totalPaidNode} />
      <MemberStatCard title="Open Invoices" value={`${openInvoicesCount}`} />
      <MemberStatCard title="Days Until Expiry" value={daysUntilExpiryNode} />
    </div>
  )
}
