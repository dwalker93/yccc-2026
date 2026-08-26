import { useState } from "react"
import { useStore } from "@tanstack/react-form"

import { MONTHS, YEARS } from "@workspace/shared/constants/dates"
import { EMPLOYMENT_TYPES } from "@workspace/shared/constants/educations"
import {
  ExperienceFormData,
  ExperienceInfo,
  experienceSchema,
} from "@workspace/shared/zod-schemas/member-input-schema"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import { SelectItem } from "@workspace/ui/components/select"
import { useAppForm } from "@workspace/ui/hooks/form"

type CreateExperienceDialogProps = {
  initialValues?: ExperienceInfo | null
  onSave: (data: ExperienceInfo) => void
  dialogTriggerButton: React.ReactNode
  isSaving?: boolean
}

export const defaultFormValues: ExperienceFormData = {
  jobTitle: "",
  employer: "",
  location: "",
  employmentType: "",
  isCurrent: true,
  startYear: null,
  startMonth: null,
  endYear: null,
  endMonth: null,
}

export function CreateExperienceDialog({
  initialValues,
  onSave,
  dialogTriggerButton,
  isSaving,
}: CreateExperienceDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useAppForm({
    defaultValues: initialValues ?? defaultFormValues,
    validators: {
      onSubmit: experienceSchema,
    },
    onSubmit: ({ value }) => {
      const parsedData = experienceSchema.safeParse(value)
      if (parsedData.success) {
        onSave(parsedData.data)
        form.reset()
        setOpen(false)
      }
      return null
    },
  })

  const isEditing = initialValues != null
  const isCurrentlyWorking = useStore(
    form.store,
    (state) => state.values.isCurrent
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (value === false) {
          form.reset()
        }
        setOpen(value)
      }}
    >
      <DialogTrigger asChild>{dialogTriggerButton}</DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Experience" : "Add Experience"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {isEditing ? "Edit experience form" : "Add new experience form"}
            </DialogDescription>
          </DialogHeader>

          <div
            className="-mx-4 max-h-[50vh] overflow-y-auto px-4 md:max-h-[70vh]"
          >
            <div className="grid gap-4 py-4">
              <form.AppField name="jobTitle">
                {(field) => (
                  <field.input
                    label="Job Title"
                    placeholder="Ex. Pastry Chef"
                    disabled={isSaving}
                  />
                )}
              </form.AppField>

              <form.AppField name="employer">
                {(field) => (
                  <field.input
                    label="Organization"
                    placeholder="Ex. Hilton Hotel, Colombo"
                    disabled={isSaving}
                  />
                )}
              </form.AppField>

              <form.AppField name="location">
                {(field) => (
                  <field.input
                    label="Location"
                    placeholder="Ex. Colombo, Sri Lanka"
                    disabled={isSaving}
                  />
                )}
              </form.AppField>

              <form.AppField name="employmentType">
                {(field) => (
                  <field.select
                    label="Employment Type"
                    placeholder="Select your employment type…"
                    disabled={isSaving}
                  >
                    {EMPLOYMENT_TYPES.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </field.select>
                )}
              </form.AppField>

              <form.AppField name="isCurrent">
                {(field) => (
                  <field.checkbox
                    label="Currently working"
                    disabled={isSaving}
                  />
                )}
              </form.AppField>

              <FieldSet>
                <FieldLegend className="mb-1" variant="label">
                  Start Date
                </FieldLegend>
                <FieldGroup className="grid grid-cols-2 gap-4">
                  <form.AppField name="startYear">
                    {(field) => (
                      <field.select
                        label="Year"
                        placeholder="Select a year…"
                        disabled={isSaving}
                      >
                        {YEARS.map((y) => (
                          <SelectItem key={y.value} value={y.value.toString()}>
                            {y.label}
                          </SelectItem>
                        ))}
                      </field.select>
                    )}
                  </form.AppField>

                  <form.AppField name="startMonth">
                    {(field) => (
                      <field.select
                        label="Month"
                        placeholder="Select a month…"
                        disabled={isSaving}
                      >
                        {MONTHS.map((m) => (
                          <SelectItem key={m.value} value={m.value.toString()}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </field.select>
                    )}
                  </form.AppField>
                </FieldGroup>
              </FieldSet>

              {!isCurrentlyWorking && (
                <FieldSet>
                  <FieldLegend className="mb-1" variant="label">
                    End Date
                  </FieldLegend>
                  <FieldGroup className="grid grid-cols-2 gap-4">
                    <form.AppField
                      name="endYear"
                      validators={{
                        onChangeListenTo: [
                          "startYear",
                          "startMonth",
                          "endMonth",
                        ],
                        onChange: ({ fieldApi }) => {
                          const formValues = fieldApi.form.state.values
                          if (
                            !formValues.startYear ||
                            !formValues.startMonth ||
                            !formValues.endMonth
                          ) {
                            return undefined
                          }
                          const result = experienceSchema.safeParse(formValues)
                          if (!result.success) {
                            const err = result.error.issues.find(
                              (e) => e.path[0] === "toYear"
                            )
                            if (
                              !err?.message.includes(
                                "Start date must be on or before the end date."
                              )
                            ) {
                              return undefined
                            }
                            return { message: err?.message }
                          }
                          return undefined
                        },
                      }}
                    >
                      {(field) => (
                        <field.select
                          label="Year"
                          placeholder="Select a year…"
                          disabled={isSaving}
                        >
                          {YEARS.map((y) => (
                            <SelectItem
                              key={y.value}
                              value={y.value.toString()}
                            >
                              {y.label}
                            </SelectItem>
                          ))}
                        </field.select>
                      )}
                    </form.AppField>

                    <form.AppField name="endMonth">
                      {(field) => (
                        <field.select
                          label="Month"
                          placeholder="Select a month…"
                          disabled={isSaving}
                        >
                          {MONTHS.map((m) => (
                            <SelectItem
                              key={m.value}
                              value={m.value.toString()}
                            >
                              {m.label}
                            </SelectItem>
                          ))}
                        </field.select>
                      )}
                    </form.AppField>
                  </FieldGroup>
                </FieldSet>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isEditing
                ? isSaving
                  ? "Saving..."
                  : "Save Changes"
                : isSaving
                  ? "Adding..."
                  : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
