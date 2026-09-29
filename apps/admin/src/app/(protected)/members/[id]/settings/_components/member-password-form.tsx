"use client"

import { memberPasswordSchema } from "@workspace/shared/zod-schemas/member-input-schema"
import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { useAppForm } from "@workspace/ui/hooks/form"

import { useUpdateMemberPasswordMutation } from "@/hooks/members/update-member-password-mutation"

type MemberPasswordFormProps = {
  memberId: string
}

export function MemberPasswordForm({ memberId }: MemberPasswordFormProps) {
  const { isPending, mutateAsync: updateMemberPassword } =
    useUpdateMemberPasswordMutation()
  const form = useAppForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
      skipPasswordChecks: false,
      signOutOfAllSessions: false,
    },
    validators: {
      onChange: memberPasswordSchema,
      onSubmit: memberPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const finalData = memberPasswordSchema.parse(value)
        await updateMemberPassword({ memberId, ...finalData })
        form.reset()
      } catch {}
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <FieldGroup className="flex max-w-4xl flex-col gap-4">
        <form.AppField name="newPassword">
          {(field) => (
            <field.input
              label="New Password"
              placeholder="Enter new password"
              autoComplete="new-password"
              requiredIcon={false}
              disabled={isPending}
            />
          )}
        </form.AppField>

        <form.AppField name="confirmPassword">
          {(field) => (
            <field.input
              label="Confirm Password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              requiredIcon={false}
              disabled={isPending}
            />
          )}
        </form.AppField>

        <form.AppField name="skipPasswordChecks">
          {(field) => (
            <field.checkbox
              label="Skip password checks"
              requiredIcon={false}
              disabled={isPending}
            />
          )}
        </form.AppField>

        <form.AppField name="signOutOfAllSessions">
          {(field) => (
            <field.checkbox
              label="Sign out of all sessions"
              requiredIcon={false}
              disabled={isPending}
            />
          )}
        </form.AppField>
      </FieldGroup>
      <div className="mt-6 flex max-w-4xl justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update"}
        </Button>
      </div>
    </form>
  )
}
