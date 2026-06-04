"use client"

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export function SectionCards() {
  return (
    <div
      className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t
        *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card
        *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2
        @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card"
    >
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Members</CardDescription>
          <CardTitle
            className="text-2xl font-semibold tabular-nums
              @[250px]/card:text-3xl"
          >
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDownIcon />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% from last month <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle
            className="text-2xl font-semibold tabular-nums
              @[250px]/card:text-3xl"
          >
            23,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">From last month</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle
            className="text-2xl font-semibold tabular-nums
              @[250px]/card:text-3xl"
          >
            LKR 12,500.00
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Increased revenue <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">From last month</div>
        </CardFooter>
      </Card>
    </div>
  )
}
