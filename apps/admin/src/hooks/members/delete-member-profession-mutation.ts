import { useMutation, useQueryClient } from "@tanstack/react-query"

import { memberKeys } from "./keys"

async function deleteMemberProfession({
  professionId,
}: {
  professionId: string
}) {
  const response = await fetch(`/api/professions/${professionId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    let errorMessage = "Failed to delete member profession"
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

export function useDeleteMemberProfessionMutation({
  memberId,
}: {
  memberId: string
}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMemberProfession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.professional({ id: memberId }),
      })
      return { success: true }
    },
    onError: (error) => {
      return { error: error.message }
    },
  })
}
