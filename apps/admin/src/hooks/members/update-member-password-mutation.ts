import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { type MemberPasswordData } from "@workspace/shared/zod-schemas/member-input-schema"

import { memberKeys } from "./keys"

type UpdateMemberPasswordPayload = MemberPasswordData & {
  memberId: string
}

async function updateMemberPassword(payload: UpdateMemberPasswordPayload) {
  const { memberId, ...data } = payload

  const response = await fetch(`/api/members/${memberId}/password-reset`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    let errorMessage = "Failed to update member password"
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

export function useUpdateMemberPasswordMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMemberPassword,
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.member(memberId),
      })
      toast.success("Member password updated successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update member password")
    },
  })
}
