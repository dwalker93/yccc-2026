import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
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
    throw new Error("Failed to update member")
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
