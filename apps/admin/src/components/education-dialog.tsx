import { useMemo, useState } from "react"
import { useStore } from "@tanstack/react-form"

import { ALL_YEARS, MONTHS, YEARS } from "@workspace/shared/constants/dates"
import {
  FIELDS_OF_STUDY,
  QUALIFICATION_LEVELS,
} from "@workspace/shared/constants/educations"
import {
  EducationInfo,
  educationSchema,
  type EducationFormData,
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

type EducationDialogProps = {
  initialValues?: EducationFormData | null
  onSave: (data: EducationInfo) => void
  dialogTriggerButton: React.ReactNode
}

export const defaultFormValues: EducationFormData = {
  educationLevel: "",
  schoolName: "",
  schoolYear: "",
  fieldOfStudy: "",
  institutionName: "",
  fromYear: "",
  fromMonth: "",
  toYear: "",
  toMonth: "",
}

export function EducationDialog({
  initialValues,
  onSave,
  dialogTriggerButton,
}: EducationDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useAppForm({
    defaultValues: initialValues ?? defaultFormValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = educationSchema.safeParse(value)
        if (!result.success) {
          const fields: Record<string, { message: string }> = {}
          for (const issue of result.error.issues) {
            const key = issue.path[0] as string
            if (key && !fields[key]) {
              fields[key] = { message: issue.message }
            }
          }
          return { fields }
        }
        return undefined
      },
    },
    onSubmit: ({ value }) => {
      const parsedData = educationSchema.safeParse(value)
      if (parsedData.success) {
        onSave(parsedData.data)
        form.reset()
        setOpen(false)
      }
      return null
    },
  })

  const isEditing = initialValues !== null
  const educationLevel = useStore(
    form.store,
    (state) => state.values.educationLevel
  )
  const isSchool = educationLevel === "secondary"
  const fromYear = useStore(form.store, (state) => state.values.fromYear)

  const toYearOptions = useMemo(() => {
    if (!fromYear) {
      return ALL_YEARS
    }
    return ALL_YEARS.filter((y) => parseInt(y.value) >= parseInt(fromYear))
  }, [fromYear])

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
              {isEditing ? "Edit Education" : "Add Education"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {isEditing ? "Edit education form" : "Add new education form"}
            </DialogDescription>
          </DialogHeader>

          <div
            className="-mx-4 max-h-[50vh] overflow-y-auto px-4 md:max-h-[70vh]"
          >
            <div className="grid gap-4 py-4">
              <form.AppField name="educationLevel">
                {(field) => (
                  <field.select
                    label="Education/Programme"
                    placeholder="Select your qualification…"
                    required
                  >
                    {QUALIFICATION_LEVELS.map((q) => (
                      <SelectItem key={q.value} value={q.value}>
                        {q.label}
                      </SelectItem>
                    ))}
                  </field.select>
                )}
              </form.AppField>

              {isSchool && (
                <>
                  <form.AppField name="schoolName">
                    {(field) => (
                      <field.input
                        label="School Name"
                        required
                        placeholder="e.g. Royal College"
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="schoolYear">
                    {(field) => (
                      <field.select
                        label="School Year"
                        placeholder="Select a school year…"
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
                </>
              )}

              {educationLevel !== "" && !isSchool && (
                <>
                  <form.AppField name="fieldOfStudy">
                    {(field) => (
                      <field.select
                        label="Field of Study"
                        placeholder="Select a field…"
                        required
                      >
                        {FIELDS_OF_STUDY.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </field.select>
                    )}
                  </form.AppField>

                  <form.AppField name="institutionName">
                    {(field) => (
                      <field.input
                        label="Institution Name"
                        required
                        placeholder="e.g. Open University of Sri Lanka"
                      />
                    )}
                  </form.AppField>

                  <FieldSet>
                    <FieldLegend className="mb-1" variant="label">
                      Start Date
                    </FieldLegend>
                    <FieldGroup className="grid grid-cols-2 gap-4">
                      <form.AppField
                        name="fromYear"
                        validators={{
                          onChange: ({ fieldApi }) => {
                            const formValues = fieldApi.form.state.values
                            const toYear = formValues.toYear
                            if (
                              toYear &&
                              parseInt(fieldApi.state.value) > parseInt(toYear)
                            ) {
                              form.resetField("toYear")
                            }
                            return null
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

                  <FieldSet>
                    <FieldLegend className="mb-1" variant="label">
                      End / Expected End Date
                    </FieldLegend>
                    <FieldGroup className="grid grid-cols-2 gap-4">
                      <form.AppField
                        name="toYear"
                        validators={{
                          onChangeListenTo: [
                            "fromYear",
                            "fromMonth",
                            "toMonth",
                          ],
                          onChange: ({ fieldApi }) => {
                            const formValues = fieldApi.form.state.values
                            const result = educationSchema.safeParse(formValues)
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
                            {toYearOptions.map((y) => (
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
                </>
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
