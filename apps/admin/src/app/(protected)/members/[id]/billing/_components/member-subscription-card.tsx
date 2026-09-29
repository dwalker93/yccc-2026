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
          Subscription Period
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SubscriptionPlanBadge
            plan={subscription.plan as "default" | "free" | "pro"}
          />
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-nowrap">
              {formatDate(subscription.startDate)}
            </span>{" "}
            →{" "}
            <span className="text-nowrap">
              {formatDate(subscription.endDate)}
            </span>
          </div>
        </div>
        <SubscriptionStatusBadge
          status={subscription.subscriptionStatus || "inactive"}
        />
      </CardContent>
    </Card>
  )
}
