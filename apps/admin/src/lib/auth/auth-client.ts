import { emailOTPClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { toast } from "sonner"

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
  fetchOptions: {
    onError: async (context) => {
      const { response } = context
      if (response.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After")
        toast.error(`Too many requests. Retry after ${retryAfter} seconds`)
      }
    },
  },
})
