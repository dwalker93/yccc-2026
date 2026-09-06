import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type UpdateMemberEducationPayload = {
  educationId: string
  educationData: {
    institution?: string
    qualification?: string
    fieldOfStudy?: string
    startYear?: number
    startMonth?: number
    endYear?: number
    endMonth?: number
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
    throw new Error("Failed to update member education")
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
        queryKey: ["member-education", memberId],
      })
      toast.success("Member education updated successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update member education")
    },
  })
}
