import { useMemo, useState } from "react"
import { MemberEducation } from "@/services/member-education-service"
import { useSelector } from "@tanstack/react-form"

import { ALL_YEARS, MONTHS, YEARS } from "@workspace/shared/constants/dates"
import {
  FIELDS_OF_STUDY,
  QUALIFICATION_LEVELS,
} from "@workspace/shared/constants/educations"
import {
  educationSchema,
  type EducationFormData,
  type EducationInfo,
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

type CreateEducationDialogProps = {
  initialValues?: EducationInfo | MemberEducation | null
  onSubmit: (data: EducationInfo) => Promise<void>
  dialogTriggerButton: React.ReactNode
  isSaving?: boolean
}

export const defaultFormValues: EducationFormData = {
  qualification: "",
  schoolName: "",
  schoolYear: null,
  fieldOfStudy: "",
  institution: "",
  startYear: null,
  startMonth: null,
  endYear: null,
  endMonth: null,
}

function parseInitialValues(
  initialValues: EducationInfo | MemberEducation | null | undefined
): EducationFormData {
  if (initialValues && !("id" in initialValues)) {
    return {
      ...defaultFormValues,
      ...initialValues,
    }
  } else if (initialValues && "id" in initialValues) {
    if (initialValues.qualification === "secondary") {
      return {
        ...defaultFormValues,
        qualification: initialValues.qualification,
        schoolName: initialValues.institution,
        schoolYear: initialValues.endYear ?? null,
      }
    }
    return {
      ...defaultFormValues,
      qualification: initialValues.qualification,
      fieldOfStudy: initialValues.fieldOfStudy ?? "",
      institution: initialValues.institution,
      startYear: initialValues.startYear ?? null,
      startMonth: initialValues.startMonth ?? null,
      endYear: initialValues.endYear ?? null,
      endMonth: initialValues.endMonth ?? null,
    }
  }
  return defaultFormValues
}

export function CreateEducationDialog({
  initialValues,
  onSubmit,
  dialogTriggerButton,
  isSaving = false,
}: CreateEducationDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useAppForm({
    defaultValues: parseInitialValues(initialValues),
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
    onSubmit: async ({ value }) => {
      const data = educationSchema.parse(value)
      try {
        await onSubmit(data)
        form.reset()
        setOpen(false)
      } catch {}
    },
  })

  const isEditing = initialValues != null
  const qualification = useSelector(
    form.store,
    (state) => state.values.qualification
  )
  const isSchool = qualification === "secondary"
  const startYear = useSelector(form.store, (state) => state.values.startYear)

  const toYearOptions = useMemo(() => {
    if (!startYear) {
      return ALL_YEARS
    }
    return ALL_YEARS.filter((y) => y.value >= startYear)
  }, [startYear])

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
              <form.AppField name="qualification">
                {(field) => (
                  <field.select
                    label="Education/Programme"
                    placeholder="Select your qualification…"
                    disabled={isSaving}
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
                        placeholder="e.g. Royal College"
                        disabled={isSaving}
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="schoolYear">
                    {(field) => (
                      <field.select
                        label="School Year"
                        placeholder="Select a school year…"
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
                </>
              )}

              {qualification !== "" && !isSchool && (
                <>
                  <form.AppField name="fieldOfStudy">
                    {(field) => (
                      <field.select
                        label="Field of Study"
                        placeholder="Select a field…"
                        disabled={isSaving}
                      >
                        {FIELDS_OF_STUDY.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </field.select>
                    )}
                  </form.AppField>

                  <form.AppField name="institution">
                    {(field) => (
                      <field.input
                        label="Institution Name"
                        placeholder="e.g. Open University of Sri Lanka"
                        disabled={isSaving}
                      />
                    )}
                  </form.AppField>

                  <FieldSet>
                    <FieldLegend className="mb-1" variant="label">
                      Start Date
                    </FieldLegend>
                    <FieldGroup className="grid grid-cols-2 gap-4">
                      <form.AppField
                        name="startYear"
                        validators={{
                          onChange: ({ fieldApi }) => {
                            const formValues = fieldApi.form.state.values
                            const endYear = formValues.endYear
                            if (
                              endYear &&
                              fieldApi.state.value &&
                              fieldApi.state.value > endYear
                            ) {
                              form.resetField("endYear")
                            }
                            return null
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

                      <form.AppField name="startMonth">
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

                  <FieldSet>
                    <FieldLegend className="mb-1" variant="label">
                      End / Expected End Date
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
                            const result = educationSchema.safeParse(formValues)
                            if (!result.success) {
                              const err = result.error.issues.find(
                                (e) => e.path[0] === "endYear"
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
                            {toYearOptions.map((y) => (
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
                disabled={isSaving}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isEditing
                ? isSaving
                  ? "Saving changes..."
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
