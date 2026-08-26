"use client"

import { useState, useTransition } from "react"
import {
  addMemberEducationAction,
  addMemberProfessionAction,
} from "@/actions/members-actions"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

import { CreateEducationDialog } from "@/components/create-education-dialog"
import { CreateExperienceDialog } from "@/components/create-experience-dialog"
import { SimpleTable } from "@/components/simple-table/simple-table"

import { getEducationColumns } from "./member-education-table-columns"
import { workHistoryColumns } from "./member-work-history-table-columns"

export function MemberCareerTables({ memberId }: { memberId: string }) {
  const queryClient = useQueryClient()
  const [educationPage, setEducationPage] = useState(1)
  const [professionPage, setProfessionPage] = useState(1)
  const pageSize = 5

  const [isPending, startTransition] = useTransition()

  const { data: educationData } = useQuery({
    queryKey: ["member-education", memberId, { page: educationPage, pageSize }],
    queryFn: () =>
      fetch(
        `/api/members/${memberId}/education?page=${educationPage}&pageSize=${pageSize}`
      ).then((r) => r.json()),
    // page 1 is already hydrated from server — no loading state on initial render
  })

  const { data: professionData } = useQuery({
    queryKey: [
      "member-profession",
      memberId,
      { page: professionPage, pageSize },
    ],
    queryFn: () =>
      fetch(
        `/api/members/${memberId}/profession?page=${professionPage}&pageSize=${pageSize}`
      ).then((r) => r.json()),
  })

  return (
    <div className="flex flex-col gap-4">
      <SimpleTable
        title="Education"
        action={
          <CreateEducationDialog
            dialogTriggerButton={
              <Button variant="outline" size="sm">
                + Add
              </Button>
            }
            isSaving={isPending}
            onSubmit={async (data) => {
              const payload =
                data.qualification === "secondary"
                  ? {
                      qualification: data.qualification,
                      institution: data.schoolName,
                      fieldOfStudy: null,
                      startYear: null,
                      startMonth: null,
                      endYear: data.schoolYear,
                      endMonth: null,
                    }
                  : {
                      qualification: data.qualification,
                      institution: data.institution,
                      fieldOfStudy: data.fieldOfStudy ?? null,
                      startYear: data.startYear ?? null,
                      startMonth: data.startMonth ?? null,
                      endYear: data.endYear,
                      endMonth: data.endMonth ?? null,
                    }
              startTransition(async () => {
                const res = await addMemberEducationAction(memberId, payload)
                if (res?.success) {
                  queryClient.invalidateQueries({
                    queryKey: ["member-education", memberId],
                  })
                  toast.success("Education added successfully")
                } else {
                  toast.error(res?.error ?? "Failed to add education")
                }
              })
            }}
          />
        }
        data={educationData?.records ?? []}
        emptyMessage="No education records found."
        columns={getEducationColumns(memberId)}
      />
      <SimpleTable
        title="Work History"
        action={
          <CreateExperienceDialog
            dialogTriggerButton={
              <Button variant="outline" size="sm">
                + Add
              </Button>
            }
            onSave={async (data) => {
              startTransition(async () => {
                const res = await addMemberProfessionAction(memberId, data)
                if (res?.success) {
                  queryClient.invalidateQueries({
                    queryKey: ["member-profession", memberId],
                  })
                  toast.success("Profession added successfully")
                } else {
                  toast.error(res?.error ?? "Failed to add profession")
                }
              })
            }}
            isSaving={isPending}
          />
        }
        data={professionData?.records ?? []}
        emptyMessage="No work history records found."
        columns={workHistoryColumns}
      />
    </div>
  )
}
