import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { MemberPersonalInformationUpdateData } from "@workspace/shared/zod-schemas/member-input-schema"

import { memberKeys } from "./keys"

type UpdateMemberPersonalInformationPayload = {
  memberId: string
  memberData: MemberPersonalInformationUpdateData
}

export async function updateMemberPersonalInformation(
  payload: UpdateMemberPersonalInformationPayload
) {
  const { memberId, memberData } = payload
  const response = await fetch(`/api/members/${memberId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(memberData),
  })

  if (!response.ok) {
    let errorMessage = "Failed to update member"
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

export function useUpdateMemberPersonalInformationMutation({
  memberId,
}: { memberId?: string } = {}) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: updateMemberPersonalInformation,
    onSuccess: (_, variables) => {
      const targetId = memberId || variables.memberId
      if (targetId) {
        queryClient.invalidateQueries({
          queryKey: memberKeys.metadata(targetId),
        })
      }
      router.refresh()
      toast.success("Member updated successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update member")
    },
  })
}
