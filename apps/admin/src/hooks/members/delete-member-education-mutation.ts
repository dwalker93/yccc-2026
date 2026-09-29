import { useMutation, useQueryClient } from "@tanstack/react-query"

import { memberKeys } from "./keys"

async function deleteMemberEducation({ educationId }: { educationId: string }) {
  const response = await fetch(`/api/educations/${educationId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    let errorMessage = "Failed to delete member education"
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
    } catch {
      // Response may not be JSON (e.g. plain text "Unauthorized")
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export function useDeleteMemberEducationMutation({
  memberId,
}: {
  memberId: string
}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMemberEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.education({ id: memberId }),
      })
      return { success: true }
    },
    onError: (error) => {
      return { error: error.message }
    },
  })
}
