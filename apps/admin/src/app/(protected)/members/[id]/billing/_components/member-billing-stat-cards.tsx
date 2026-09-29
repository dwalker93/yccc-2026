import { MemberBillingStats } from "@/services/member-invoice-service"
import { formatCurrency } from "@/utils/utils"

import { MemberStatCard } from "@/components/member-stat-card"

export function MemberBillingStatCards({
  billingStats,
}: {
  billingStats: MemberBillingStats
}) {
  const totalPaidNode = (
    <span className="text-emerald-700 dark:text-green-400">
      {formatCurrency(billingStats.totalPaid)}
    </span>
  )

  return (
    <div className="grid grid-cols-12 gap-4">
      <MemberStatCard title="Total Paid" value={totalPaidNode} />
      <MemberStatCard
        title="Outstanding"
        value={formatCurrency(billingStats.outstanding)}
      />
      <MemberStatCard title="Invoices" value={billingStats.totalInvoices} />
    </div>
  )
}
