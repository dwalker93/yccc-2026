"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@workspace/ui/components/button"

import { SimpleTable } from "@/components/simple-table/simple-table"

import { getEducationColumns } from "./member-education-table-columns"
import { workHistoryColumns } from "./member-work-history-table-columns"

export function MemberCareerTables({ memberId }: { memberId: string }) {
  const [educationPage, setEducationPage] = useState(1)
  const [professionPage, setProfessionPage] = useState(1)
  const pageSize = 5

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
          <Button variant="outline" size="sm">
            + Add
          </Button>
        }
        data={educationData?.records ?? []}
        emptyMessage="No education records found."
        columns={getEducationColumns(memberId)}
      />
      <SimpleTable
        title="Work History"
        action={
          <Button variant="outline" size="sm">
            + Add
          </Button>
        }
        data={professionData?.records ?? []}
        emptyMessage="No work history records found."
        columns={workHistoryColumns}
      />
    </div>
  )
}
