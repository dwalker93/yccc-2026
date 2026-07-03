import { Briefcase, Pencil, Trash2 } from "lucide-react"

import { MONTHS } from "@workspace/shared/constants/dates"
import { EMPLOYMENT_TYPES } from "@workspace/shared/constants/educations"
import { type ExperienceInfo } from "@workspace/shared/zod-schemas/member-input-schema"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

import { CreateExperienceDialog } from "./create-experience-dialog"

type ExperienceCardProps = {
  experience: ExperienceInfo
  onEdit: (data: ExperienceInfo) => void
  onRemove: () => void
}

export function ExperienceCard({
  experience,
  onEdit,
  onRemove,
}: ExperienceCardProps) {
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
                <Briefcase size={22} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[15px] leading-snug font-semibold text-zinc-900
                  dark:text-zinc-100"
              >
                {experience.title}
              </p>

              <p
                className="mt-0.5 text-[13.5px] text-zinc-700
                  dark:text-zinc-300"
              >
                {experience.organizationName}
                <span
                  className="px-1.5 font-bold text-zinc-500 dark:text-zinc-400"
                >
                  ·
                </span>
                {
                  EMPLOYMENT_TYPES.find(
                    (e) => e.value === experience.employmentType
                  )?.label
                }
              </p>

              <p
                className="mt-0.5 text-[12.5px] text-zinc-500
                  dark:text-zinc-400"
              >
                {MONTHS.find((m) => m.value === experience.fromMonth)?.label}{" "}
                {experience.fromYear} -{" "}
                {experience.currentlyWorking
                  ? "Present"
                  : `${MONTHS.find((m) => m.value === experience.toMonth)?.label} ${experience.toYear}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row">
            <CreateExperienceDialog
              initialValues={experience}
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
