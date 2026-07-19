import { MemberSubscription } from "@/services/member-service"
import { formatDate } from "@/utils/utils"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

import {
  SubscriptionPlanBadge,
  SubscriptionStatusBadge,
} from "@/components/badge"

import { MemberCardRow } from "./member-card-row"

export default function MemberSubscriptionCard({
  subscription,
}: {
  subscription: MemberSubscription
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle
          className="text-[0.625rem] tracking-widest text-muted-foreground
            uppercase"
        >
          Subscription
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-3">
        <MemberCardRow
          title="Plan"
          value={
            <SubscriptionPlanBadge
              plan={subscription.plan as "default" | "free" | "pro"}
            />
          }
        />
        <MemberCardRow
          title="Status"
          value={
            <SubscriptionStatusBadge
              status={subscription.subscriptionStatus || "inactive"}
            />
          }
        />
        {subscription.startDate && (
          <MemberCardRow
            title="Started"
            value={formatDate(subscription.startDate)}
          />
        )}
        {subscription.endDate && (
          <MemberCardRow
            title="Expires"
            value={formatDate(subscription.endDate)}
          />
        )}
      </CardContent>
    </Card>
  )
}
