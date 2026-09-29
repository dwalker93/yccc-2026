import { type Metadata } from "next"
import {
  getMemberBillingStatsService,
  getMemberInvoicesService,
} from "@/services/member-invoice-service"
import { getMemberPaymentsService } from "@/services/member-payments-service"
import { getActiveSubscription } from "@/services/member-service"
import { toMemberId } from "@/utils/member"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import { memberKeys } from "@/hooks/members/keys"

import { MemberBillingStatCards } from "./_components/member-billing-stat-cards"
import { MemberBillingTables } from "./_components/member-billing-tables"
import MemberSubscriptionCard from "./_components/member-subscription-card"

export const metadata: Metadata = {
  title: "Member Billing",
  description: "Member billing details.",
}

export default async function MemberBillingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: rawId } = await params
  const memberId = toMemberId(rawId)

  const queryClient = new QueryClient()

  // prefetch both on server in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: memberKeys.invoices({
        id: memberId,
        pageIndex: 1,
        pageSize: 5,
      }),
      queryFn: () =>
        getMemberInvoicesService({
          memberId: memberId,
          pageIndex: 1,
          pageSize: 5,
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: memberKeys.payments({
        id: memberId,
        pageIndex: 1,
        pageSize: 5,
      }),
      queryFn: () =>
        getMemberPaymentsService({
          memberId: memberId,
          pageIndex: 1,
          pageSize: 5,
        }),
    }),
  ])

  const billingStats = await getMemberBillingStatsService(memberId)
  const subscription = await getActiveSubscription(memberId)
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-4">
        <MemberBillingStatCards billingStats={billingStats} />
        <MemberSubscriptionCard subscription={subscription} />
        <MemberBillingTables memberId={memberId} />
      </div>
    </HydrationBoundary>
  )
}
