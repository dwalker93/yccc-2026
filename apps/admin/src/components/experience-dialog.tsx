import { useState } from "react"
import { useStore } from "@tanstack/react-form"

import { MONTHS, YEARS } from "@workspace/shared/constants/dates"
import { EMPLOYMENT_TYPES } from "@workspace/shared/constants/educations"
import {
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

type ExperienceDialogProps = {
  initialValues?: ExperienceInfo | null
  onSave: (data: ExperienceInfo) => void
  dialogTriggerButton: React.ReactNode
}

export const defaultFormValues: Omit<
  ExperienceInfo,
  "fromMonth" | "employmentType"
> & {
  fromMonth: string
  employmentType: string
} = {
  title: "",
  organizationName: "",
  location: "",
  employmentType: "",
  currentlyWorking: true,
  fromYear: "",
  fromMonth: "",
  toYear: "",
  toMonth: "",
}

export function ExperienceDialog({
  initialValues,
  onSave,
  dialogTriggerButton,
}: ExperienceDialogProps) {
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

  const isEditing = initialValues !== null
  const isCurrentlyWorking = useStore(
    form.store,
    (state) => state.values.currentlyWorking
  )

  console.log(useStore(form.store, (state) => state.errors))

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
              <form.AppField name="title">
                {(field) => (
                  <field.input
                    label="Title"
                    required
                    placeholder="Ex. Pastry Chef"
                  />
                )}
              </form.AppField>

              <form.AppField name="organizationName">
                {(field) => (
                  <field.input
                    label="Organization"
                    required
                    placeholder="Ex. Hilton Hotel, Colombo"
                  />
                )}
              </form.AppField>

              <form.AppField name="location">
                {(field) => (
                  <field.input
                    label="Location"
                    required
                    placeholder="Ex. Colombo, Sri Lanka"
                  />
                )}
              </form.AppField>

              <form.AppField name="employmentType">
                {(field) => (
                  <field.select
                    label="Employment Type"
                    placeholder="Select your employment type…"
                    required
                  >
                    {EMPLOYMENT_TYPES.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </field.select>
                )}
              </form.AppField>

              <form.AppField name="currentlyWorking">
                {(field) => <field.checkbox label="Currently working" />}
              </form.AppField>

              <FieldSet>
                <FieldLegend className="mb-1" variant="label">
                  Start Date
                </FieldLegend>
                <FieldGroup className="grid grid-cols-2 gap-4">
                  <form.AppField name="fromYear">
                    {(field) => (
                      <field.select
                        label="Year"
                        placeholder="Select a year…"
                        required
                      >
                        {YEARS.map((y) => (
                          <SelectItem key={y.value} value={y.value}>
                            {y.label}
                          </SelectItem>
                        ))}
                      </field.select>
                    )}
                  </form.AppField>

                  <form.AppField name="fromMonth">
                    {(field) => (
                      <field.select
                        label="Month"
                        placeholder="Select a month…"
                        required
                      >
                        {MONTHS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
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
                      name="toYear"
                      validators={{
                        onChangeListenTo: ["fromYear", "fromMonth", "toMonth"],
                        onChange: ({ fieldApi }) => {
                          const formValues = fieldApi.form.state.values
                          if (
                            !formValues.fromYear ||
                            !formValues.fromMonth ||
                            !formValues.toMonth
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
                          required
                        >
                          {YEARS.map((y) => (
                            <SelectItem key={y.value} value={y.value}>
                              {y.label}
                            </SelectItem>
                          ))}
                        </field.select>
                      )}
                    </form.AppField>

                    <form.AppField name="toMonth">
                      {(field) => (
                        <field.select
                          label="Month"
                          placeholder="Select a month…"
                          required
                        >
                          {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
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
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{isEditing ? "Save Changes" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
