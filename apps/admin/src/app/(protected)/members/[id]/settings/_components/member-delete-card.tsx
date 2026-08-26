import { TriangleAlert } from "lucide-react"

import { Field, FieldDescription } from "@workspace/ui/components/field"

import { MemberProfileCard } from "@/components/member-profile-card"

import { MemberDeleteConfirmForm } from "./member-delete-confirm-form"

export async function MemberDeleteCard({ memberId }: { memberId: string }) {
  return (
    <MemberProfileCard
      title="Danger Zone"
      variant="destructive"
      titleIcon={<TriangleAlert />}
    >
      <Field className="max-w-md">
        <FieldDescription>
          Permanently delete member's account and remove all of their data from
          our servers. This action cannot be undone.
        </FieldDescription>

        <MemberDeleteConfirmForm memberId={memberId} />
      </Field>
    </MemberProfileCard>
  )
}
