"use client"

import { useRouter } from "next/navigation"
import { useAppGlobal } from "@/providers/app-global-provider"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { authClient } from "@/lib/auth/auth-client"
import { getQueryClient } from "@/lib/query-client"

export async function signOut() {
  const { data, error } = await authClient.signOut()
  if (error) throw new Error(error.message)

  return data
}
export type SignOutData = Awaited<ReturnType<typeof signOut>>

export const useSignOutMutation = () => {
  const [, setAppGlobal] = useAppGlobal()
  const queryClient = getQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: signOut,
    onSettled: () => {
      queryClient.clear()
    },
    onSuccess: () => {
      setAppGlobal({ isLoading: false })
      toast.success("Signed out successfully!")
      router.replace("/signin")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sign out")
    },
  })
}
