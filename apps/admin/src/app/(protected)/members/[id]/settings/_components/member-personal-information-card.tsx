import { getMemberProfile, MemberProfile } from "@/services/member-service"

import { MemberProfileCard } from "@/components/member-profile-card"

import { MemberPersonalInformationForm } from "./member-personal-information-form"

export function MemberPersonalInformationCard({
  member,
}: {
  member: MemberProfile
}) {
  const profileData = {
    firstName: member.name.split(" ")[0] as string,
    lastName: member.name.split(" ").slice(1).join(" ") || "",
    nic: member.nic,
    dateOfBirth: member.dateOfBirth,
    addressLine1: member.addressLine1,
    addressLine2: member.addressLine2 ?? "",
    city: member.city,
    district: member.district,
    phone: member.phone,
    whatsapp: member.whatsapp as string,
  }

  return (
    <MemberProfileCard title="Personal informations">
      <MemberPersonalInformationForm
        memberId={member.id}
        member={profileData}
      />
    </MemberProfileCard>
  )
}
