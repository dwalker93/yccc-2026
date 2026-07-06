"use client"

import { Plus } from "lucide-react"

import { DistrictsWithProvinces } from "@workspace/shared/constants/districts"
import {
  memberInputSchema,
  type MemberInputData,
} from "@workspace/shared/zod-schemas/member-input-schema"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
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

import { CreateEducationDialog } from "./create-education-dialog"
import { CreateExperienceDialog } from "./create-experience-dialog"
import { EducationCard } from "./education-card"
import { ExperienceCard } from "./experience-card"

export function CreateMemberForm() {
  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      nic: "",
      dateOfBirth: "",
      //photo: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      district: "",
      phone: "",
      whatsapp: "",
      email: "",
      educations: [],
      experience: [],
      //legalDocuments: [],
    } satisfies MemberInputData as MemberInputData,
    validators: {
      onSubmit: memberInputSchema,
    },
    onSubmit: ({ value }) => {
      // Parse the raw form state to apply the Zod .transform()
      const finalData = memberInputSchema.parse(value)
      //console.log("Transformed data (with gender):", finalData)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex flex-col gap-4 pb-10"
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
                  />
                )}
              </form.AppField>

              <form.AppField name="lastName">
                {(field) => (
                  <field.input
                    label="Last Name"
                    placeholder="Enter last name"
                    autoComplete="family-name"
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
                      errorMap: Object.fromEntries(
                        Object.entries(prev.errorMap ?? {}).map(
                          ([event, error]) => [
                            event,
                            Array.isArray(error)
                              ? error.filter(
                                  (e) =>
                                    !e?.message?.includes(
                                      "Date of birth does not match with NIC"
                                    )
                                )
                              : error?.message?.includes(
                                    "Date of birth does not match with NIC"
                                  )
                                ? undefined
                                : error,
                          ]
                        )
                      ),
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
                />
              )}
            </form.AppField>

            <form.AppField name="addressLine2">
              {(field) => (
                <field.input
                  label="Address Line 2"
                  placeholder="Enter address line 2"
                  autoComplete="address-line2"
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
                  />
                )}
              </form.AppField>

              <form.AppField name="district">
                {(field) => (
                  <field.select label="District" placeholder="Select district">
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
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField name="email">
              {(field) => (
                <field.input
                  label="Email"
                  placeholder="Enter email"
                  autoComplete="email"
                  type="email"
                  inputMode="email"
                />
              )}
            </form.AppField>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend>Professional Information</FieldLegend>
          <FieldDescription>
            Professional information about the member
          </FieldDescription>

          <FieldGroup className="max-w-4xl gap-4">
            <form.AppField name="educations" mode="array">
              {(parentField) => {
                const isInvalid =
                  parentField.state.meta.isTouched &&
                  !parentField.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Education <span className="text-destructive">*</span>
                    </FieldLabel>
                    {form.state.values.educations?.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {form.state.values.educations.map(
                          (education, index) => (
                            <EducationCard
                              key={education.educationLevel + index}
                              education={education}
                              onEdit={(education) =>
                                parentField.replaceValue(index, education)
                              }
                              onRemove={() => parentField.removeValue(index)}
                            />
                          )
                        )}
                      </div>
                    )}
                    <CreateEducationDialog
                      onSave={(education) => parentField.pushValue(education)}
                      dialogTriggerButton={
                        <Button
                          type="button"
                          variant={"secondary"}
                          aria-invalid={isInvalid}
                        >
                          <Plus className="size-4" />
                          Add new education
                        </Button>
                      }
                    />
                    {isInvalid && (
                      <FieldError errors={parentField.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.AppField>

            <form.AppField name="experience" mode="array">
              {(parentField) => {
                const isInvalid =
                  parentField.state.meta.isTouched &&
                  !parentField.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Experience</FieldLabel>
                    {form.state.values.experience?.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {form.state.values.experience.map(
                          (experience, index) => (
                            <ExperienceCard
                              key={
                                experience.title +
                                experience.organizationName +
                                experience.fromYear
                              }
                              experience={experience}
                              onEdit={(experience) =>
                                parentField.replaceValue(index, experience)
                              }
                              onRemove={() => parentField.removeValue(index)}
                            />
                          )
                        )}
                      </div>
                    )}
                    <CreateExperienceDialog
                      onSave={(experience) => parentField.pushValue(experience)}
                      dialogTriggerButton={
                        <Button type="button" variant={"secondary"}>
                          <Plus className="size-4" />
                          Add new experience
                        </Button>
                      }
                    />
                    {isInvalid && (
                      <FieldError errors={parentField.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.AppField>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <div className="mt-6 flex max-w-4xl justify-end">
        <Button type="submit">Create</Button>
      </div>
    </form>
  )
}
