import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { memberKeys } from "./keys"

export type UpdateMemberEducationPayload = {
  educationId: string
  educationData: {
    institution?: string
    qualification?: string
    fieldOfStudy?: string | null
    startYear?: number | null
    startMonth?: number | null
    endYear?: number | null
    endMonth?: number | null
  }
}

async function updateMemberEducation(payload: UpdateMemberEducationPayload) {
  const { educationId, educationData } = payload
  const response = await fetch(`/api/educations/${educationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(educationData),
  })

  if (!response.ok) {
    const body: { error: string } | null = await response
      .json()
      .catch(() => null)
    throw new Error(body?.error ?? "Failed to update member education")
  }

  return response.json()
}

export function useUpdateMemberEducationMutation({
  memberId,
}: {
  memberId: string
}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMemberEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.education({ id: memberId }),
      })
      toast.success("Member education updated successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update member education")
    },
  })
}
