import { MemberProfile } from "@/services/member-service"
import { avatarFallback, formatMemberId } from "@/utils/member"
import { formatDate } from "@/utils/utils"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

import { MembershipStatusBadge } from "@/components/badge"

import { MemberCardRow } from "./member-card-row"

export default function MemberDetailsCard({
  profile,
}: {
  profile: MemberProfile
}) {
  return (
    <Card>
      <CardHeader>
        <Avatar className="mb-2 h-16 w-16">
          <AvatarImage src={profile.photo || ""} alt={profile.name} />
          <AvatarFallback
            className="text-lg font-bold tracking-widest text-muted-foreground
              dark:text-primary"
          >
            {avatarFallback(profile.name)}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-base font-bold">{profile.name}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {formatMemberId(profile.id)}
        </CardDescription>
        <MembershipStatusBadge
          status={profile.membershipStatus}
          className="mt-2"
        />
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-3">
        <MemberCardRow title="Email" value={profile.email} />
        <MemberCardRow title="Phone" value={profile.phone} />
        {profile.whatsapp && (
          <MemberCardRow title="WhatsApp" value={profile.whatsapp} />
        )}
        <MemberCardRow title="NIC" value={profile.nic} />
        <MemberCardRow
          title="Date of Birth"
          value={formatDate(profile.dateOfBirth)}
        />
        <MemberCardRow
          title="Address"
          value={`${profile.addressLine1} ${profile.addressLine2 || ""}`}
        />
        <MemberCardRow title="City" value={profile.city} />
        <MemberCardRow title="District" value={profile.district} />
        <MemberCardRow
          title="Member Since"
          value={formatDate(profile.memberSince)}
        />
      </CardContent>
    </Card>
  )
}
