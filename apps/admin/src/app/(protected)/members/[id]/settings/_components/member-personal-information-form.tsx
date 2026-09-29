"use client"

import { DistrictsWithProvinces } from "@workspace/shared/constants/districts"
import {
  clearNicDobMismatchErrors,
  memberPersonalInformationUpdateSchema,
  type MemberPersonalInformationUpdateData,
} from "@workspace/shared/zod-schemas/member-input-schema"
import { Button } from "@workspace/ui/components/button"
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@workspace/ui/components/field"
import {
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@workspace/ui/components/select"
import { useAppForm } from "@workspace/ui/hooks/form"

import { useUpdateMemberPersonalInformationMutation } from "@/hooks/members/update-member-personal-information-mutation"

type MemberPersonalInformationFormProps = {
  memberId: string
  member: MemberPersonalInformationUpdateData
}

export function MemberPersonalInformationForm({
  memberId,
  member,
}: MemberPersonalInformationFormProps) {
  const { isPending, mutateAsync: updateMember } =
    useUpdateMemberPersonalInformationMutation({ memberId })
  const form = useAppForm({
    defaultValues: member,
    validators: {
      onSubmit: memberPersonalInformationUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      // Parse the raw form state to apply the Zod .transform()
      try {
        const finalData = memberPersonalInformationUpdateSchema.parse(value)
        await updateMember({
          memberId,
          memberData: finalData,
        })
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
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Personal Information</FieldLegend>
          <FieldDescription>
            Basic information about the member
          </FieldDescription>

          <FieldGroup className="max-w-4xl gap-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <form.AppField name="firstName">
                {(field) => (
                  <field.input
                    label="First Name"
                    placeholder="Enter first name"
                    autoComplete="given-name"
                    requiredIcon={false}
                    disabled={isPending}
                  />
                )}
              </form.AppField>

              <form.AppField name="lastName">
                {(field) => (
                  <field.input
                    label="Last Name"
                    placeholder="Enter last name"
                    autoComplete="family-name"
                    requiredIcon={false}
                    disabled={isPending}
                  />
                )}
              </form.AppField>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <form.AppField
                name="nic"
                validators={{
                  onChange: () => {
                    form.setFieldMeta("dateOfBirth", (prev) => ({
                      ...prev,
                      errorMap: clearNicDobMismatchErrors(prev.errorMap),
                    }))

                    return undefined
                  },
                }}
              >
                {(field) => (
                  <field.input
                    label="NIC"
                    placeholder="Enter NIC"
                    autoComplete="nic"
                    requiredIcon={false}
                    disabled={isPending}
                  />
                )}
              </form.AppField>

              <form.AppField name="dateOfBirth">
                {(field) => (
                  <field.input
                    label="Date of Birth"
                    placeholder="Enter date of birth"
                    type="date"
                    autoComplete="bday"
                    requiredIcon={false}
                    disabled={isPending}
                  />
                )}
              </form.AppField>
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend>Contact Information</FieldLegend>
          <FieldDescription>
            Contact information about the member
          </FieldDescription>

          <FieldGroup className="max-w-4xl gap-4">
            <form.AppField name="addressLine1">
              {(field) => (
                <field.input
                  label="Address Line 1"
                  placeholder="Enter address line 1"
                  autoComplete="address-line1"
                  requiredIcon={false}
                  disabled={isPending}
                />
              )}
            </form.AppField>

            <form.AppField name="addressLine2">
              {(field) => (
                <field.input
                  label="Address Line 2"
                  placeholder="Enter address line 2"
                  autoComplete="address-line2"
                  optionalField
                  disabled={isPending}
                />
              )}
            </form.AppField>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <form.AppField name="city">
                {(field) => (
                  <field.input
                    label="City"
                    placeholder="Enter city"
                    autoComplete="city"
                    requiredIcon={false}
                    disabled={isPending}
                  />
                )}
              </form.AppField>

              <form.AppField name="district">
                {(field) => (
                  <field.select
                    label="District"
                    placeholder="Select district"
                    requiredIcon={false}
                    disabled={isPending}
                  >
                    {Object.entries(DistrictsWithProvinces).map(
                      ([region, DistrictsWithProvinces]) => (
                        <SelectGroup key={region}>
                          <SelectLabel>{region}</SelectLabel>
                          {DistrictsWithProvinces.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )
                    )}
                  </field.select>
                )}
              </form.AppField>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <form.AppField name="phone">
                {(field) => (
                  <field.input
                    label="Phone"
                    placeholder="Enter phone number"
                    autoComplete="tel"
                    type="tel"
                    inputMode="tel"
                    requiredIcon={false}
                    disabled={isPending}
                  />
                )}
              </form.AppField>

              <form.AppField name="whatsapp">
                {(field) => (
                  <field.input
                    label="WhatsApp"
                    placeholder="Enter WhatsApp number"
                    autoComplete="tel"
                    type="tel"
                    inputMode="tel"
                    requiredIcon={false}
                    disabled={isPending}
                  />
                )}
              </form.AppField>
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />
      </FieldGroup>

      <div className="mt-6 flex max-w-4xl justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update"}
        </Button>
      </div>
    </form>
  )
}
