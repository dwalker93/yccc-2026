import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { type EmploymentType } from "@workspace/shared/zod-schemas/member-input-schema"

import { memberKeys } from "./keys"

export type UpdateMemberProfessionPayload = {
  professionId: string
  professionData: {
    jobTitle?: string
    employer?: string
    location?: string
    employmentType?: EmploymentType
    isCurrent?: boolean
    startYear?: number
    startMonth?: number
    endYear?: number | null
    endMonth?: number | null
  }
}

async function updateMemberProfession(payload: UpdateMemberProfessionPayload) {
  const { professionId, professionData } = payload
  const response = await fetch(`/api/professions/${professionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(professionData),
  })

  if (!response.ok) {
    const body: { error: string } | null = await response
      .json()
      .catch(() => null)
    throw new Error(body?.error ?? "Failed to update member profession")
  }

  return response.json()
}

export function useUpdateMemberProfessionMutation({
  memberId,
}: {
  memberId: string
}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMemberProfession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.professional({ id: memberId }),
      })
      toast.success("Member profession updated successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update member profession")
    },
  })
}
