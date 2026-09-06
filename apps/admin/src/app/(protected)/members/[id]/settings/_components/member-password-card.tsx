import { MemberProfileCard } from "@/components/member-profile-card"

import { MemberPasswordForm } from "./member-password-form"

export function MemberPasswordCard({ memberId }: { memberId: string }) {
  return (
    <MemberProfileCard title="Password">
      <MemberPasswordForm memberId={memberId} />
    </MemberProfileCard>
  )
}
