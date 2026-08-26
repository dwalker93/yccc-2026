import { getMemberProfile } from "@/services/member-service"
import { toMemberId } from "@/utils/member"

import { MemberDeleteCard } from "./_components/member-delete-card"
import { MemberEmailCard } from "./_components/member-email-card"
import { MemberPasswordCard } from "./_components/member-password-card"
import { MemberPersonalInformationCard } from "./_components/member-personal-information-card"

interface MemberSettingsPageProps {
  params: Promise<{ id: string }>
}

export default async function MemberSettingsPage({
  params,
}: MemberSettingsPageProps) {
  const { id: rawId } = await params
  const memberId = toMemberId(rawId)
  const member = await getMemberProfile(memberId)

  return (
    <div className="space-y-4">
      <MemberPersonalInformationCard member={member} />
      <MemberEmailCard email={member.email} />
      <MemberPasswordCard memberId={member.id} />
      <MemberDeleteCard memberId={member.id} />
    </div>
  )
}
