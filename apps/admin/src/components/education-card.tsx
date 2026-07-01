import { GraduationCap, Pencil, Trash2 } from "lucide-react"

import { MONTHS } from "@workspace/shared/constants/dates"
import {
  FIELDS_OF_STUDY,
  QUALIFICATION_LEVELS,
} from "@workspace/shared/constants/educations"
import {
  EducationFormData,
  type EducationInfo,
} from "@workspace/shared/zod-schemas/member-input-schema"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

import {
  CreateEducationDialog,
  defaultFormValues,
} from "./create-education-dialog"

type EducationCardProps = {
  education: EducationInfo
  onEdit: (data: EducationInfo) => void
  onRemove: () => void
}

const initialEducationParser = (
  education: EducationInfo
): EducationFormData => {
  return {
    ...defaultFormValues,
    ...education,
  }
}

export function EducationCard({
  education,
  onEdit,
  onRemove,
}: EducationCardProps) {
  const fieldOfStudyLabel =
    education.educationLevel !== "secondary" &&
    FIELDS_OF_STUDY.find((f) => f.value === education.fieldOfStudy)?.label

  return (
    <Card
      className="rounded-xl border border-zinc-200 py-4 shadow-sm
        dark:border-zinc-700"
    >
      <CardContent className="px-5 py-0">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="shrink-0">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-md
                  border border-zinc-200 bg-zinc-100 text-zinc-400
                  dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
              >
                <GraduationCap size={22} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[15px] leading-snug font-semibold text-zinc-900
                  dark:text-zinc-100"
              >
                {education.educationLevel === "secondary"
                  ? education.schoolName
                  : education.institutionName}
              </p>

              <p
                className="mt-0.5 text-[13.5px] text-zinc-700
                  dark:text-zinc-300"
              >
                {
                  QUALIFICATION_LEVELS.find(
                    (q) => q.value === education.educationLevel
                  )?.label
                }
                {fieldOfStudyLabel && ` · ${fieldOfStudyLabel}`}
              </p>
              {education.educationLevel === "secondary" ? (
                <p
                  className="mt-0.5 text-[12.5px] text-zinc-500
                    dark:text-zinc-400"
                >
                  {education.schoolYear}
                </p>
              ) : (
                <p
                  className="mt-0.5 text-[12.5px] text-zinc-500
                    dark:text-zinc-400"
                >
                  {MONTHS.find((m) => m.value === education.fromMonth)?.label}{" "}
                  {education.fromYear} -{" "}
                  {`${MONTHS.find((m) => m.value === education.toMonth)?.label} ${education.toYear}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row">
            <CreateEducationDialog
              initialValues={initialEducationParser(education)}
              onSave={onEdit}
              dialogTriggerButton={
                <Button
                  aria-label="Edit"
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  <Pencil className="size-4" />
                </Button>
              }
            />

            <Button
              aria-label="Remove"
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              onClick={onRemove}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
