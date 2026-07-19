import { type Metadata } from "next"
import { getMemberOverviewService } from "@/services/member-service"

import { MemberCurrentRoleCard } from "./_components/member-current-role-card"
import MemberDetailsCard from "./_components/member-details-card"
import { MemberRemarksCard } from "./_components/member-remarks-card"
import { MemberStatCards } from "./_components/member-stat-cards"
import MemberSubscriptionCard from "./_components/member-subscription-card"

export const metadata: Metadata = {
  title: "Member Overview",
  description: "Member details.",
}

export default async function MemberOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { profile, subscription, financials, role, remarks } =
    await getMemberOverviewService("MEM" + id)
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-2 flex flex-col gap-4">
        <MemberDetailsCard profile={profile} />
        <MemberSubscriptionCard subscription={subscription} />
      </div>
      <div className="col-span-10 flex flex-col gap-4">
        <MemberStatCards
          financials={{ ...financials }}
          membershipStatus={profile.membershipStatus}
        />
        <MemberCurrentRoleCard role={role} />
        <MemberRemarksCard remarks={remarks} />
      </div>
    </div>
  )
}
