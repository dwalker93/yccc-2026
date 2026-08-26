import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

async function deleteMember({ memberId }: { memberId: string }) {
  const response = await fetch(`/api/members/${memberId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    let errorMessage = "Failed to delete member"
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

export function useDeleteMemberMutation() {
  return useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      toast.success("Member deleted successfully")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
