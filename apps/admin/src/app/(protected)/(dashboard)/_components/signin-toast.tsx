"use client"

import { useEffect, useEffectEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function SigninToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const onSigninSuccess = useEffectEvent(() => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.delete("signin")
    const newUrl = newSearchParams.toString()
      ? `${pathname}?${newSearchParams.toString()}`
      : pathname

    router.replace(newUrl, { scroll: false })
  })

  useEffect(() => {
    if (searchParams.get("signin") === "success") {
      toast.success("Signed in successfully!")
      onSigninSuccess()
    }
  }, [searchParams])

  return null
}
