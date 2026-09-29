import { getMemberProfile } from "@/services/member-service"

import { Field, FieldDescription } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

import { MemberProfileCard } from "@/components/member-profile-card"

export async function MemberEmailCard({ email }: { email: string }) {
  return (
    <MemberProfileCard title="Email">
      <Field className="max-w-4xl">
        <Input
          aria-label="Member's email address"
          readOnly
          defaultValue={email}
        />
        <FieldDescription>
          To change the member's email address, please contact the root
          administrator.
        </FieldDescription>
      </Field>
    </MemberProfileCard>
  )
}
