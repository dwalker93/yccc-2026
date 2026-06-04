"use client"

import { useState, useTransition } from "react"

import { OTPVerify } from "@workspace/ui/components/auth-otp"

import { authClient } from "@/lib/auth/auth-client"

export const VerifyEmail = ({ email }: { email: string }) => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>("")
  const onSubmit = async (code: string) => {
    startTransition(async () => {
      const { error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: code,
      })
      if (error) {
        setError(error.message ?? "Something went wrong!")
      }
    })
  }
  const onResend = async () => {
    setError("")
    startTransition(async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      })
      if (error) {
        setError(error.message ?? "Something went wrong!")
      }
    })
  }

  return (
    <OTPVerify
      email={email}
      onVerified={onSubmit}
      error={error}
      isPending={isPending}
      onResend={onResend}
    />
  )
}
