"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckIcon, ShieldCheckIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp"

type Status = "idle" | "loading" | "success" | "error"

// ── Success state ─────────────────────────────────────────────────────────────

function SuccessCard() {
  return (
    <div className="flex min-h-[420px] items-center justify-center p-8">
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-card p-10
          text-center shadow-sm"
      >
        <div
          className="mx-auto mb-6 flex size-14 items-center justify-center
            rounded-full bg-green-100 dark:bg-green-900/30"
        >
          <CheckIcon className="text-green-600 dark:text-green-400" />
        </div>
        <h2 className="mb-1 text-lg font-medium text-foreground">
          Email verified
        </h2>
        <p className="text-sm text-muted-foreground">
          Your account is ready. Redirecting you now…
        </p>
      </div>
    </div>
  )
}

function OtpInputGroup({
  index,
  invalid,
}: {
  index: number
  invalid: boolean
}) {
  return (
    <InputOTPGroup
      className="*:data-[slot=input-otp-slot]:h-12
        *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl"
    >
      <InputOTPSlot index={index} aria-invalid={invalid} />
    </InputOTPGroup>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface OTPVerifyProps {
  otpLength?: number
  email: string
  resendCooldown?: number
  onVerified?: (code: string) => void | Promise<void>
  error?: string
  isPending?: boolean
  onResend?: () => void | Promise<void>
}

function OTPVerify({
  otpLength = 6,
  email,
  resendCooldown = 60,
  onVerified,
  error,
  isPending,
  onResend,
}: OTPVerifyProps) {
  const [otp, setOtp] = useState<string>("")
  const [status, setStatus] = useState<Status>(isPending ? "loading" : "idle")
  const [errorMsg, setErrorMsg] = useState<string>(error ?? "")
  const [cooldown, setCooldown] = useState<number>(resendCooldown)

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleSubmit = useCallback(async () => {
    if (otp.length !== otpLength) {
      setStatus("error")
      setErrorMsg("Please enter a valid OTP")
      return
    }
    setStatus("loading")
    try {
      await onVerified?.(otp)
      setOtp("")
      setStatus("success")
    } catch {
      setStatus("error")
      setErrorMsg("Incorrect code. Please try again.")
    }
  }, [otp, otpLength, onVerified])

  useEffect(() => {
    async function handleAutoSubmit() {
      if (otp.length === otpLength && status !== "loading") {
        await handleSubmit()
      }
    }
    handleAutoSubmit()
  }, [otp, otpLength, status, handleSubmit])

  const handleChange = (value: string) => {
    setOtp(value)
    setStatus("idle")
    setErrorMsg("")
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setOtp("")
    setErrorMsg("")
    setCooldown(resendCooldown)
    await onResend?.()
  }

  const isLoading = status === "loading"
  const isError = status === "error"
  const canResend = cooldown === 0
  const isDisabled = isLoading

  if (status === "success") return <SuccessCard />

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="justify-center text-center">
        <div
          className="mx-auto mb-2 flex size-9 shrink-0 items-center
            justify-center rounded-lg border border-border bg-muted
            text-foreground"
        >
          <ShieldCheckIcon />
        </div>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to your email
          <span className="block w-full truncate">{email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-4 flex justify-center">
          <InputOTP
            maxLength={otpLength}
            id="verify-otp"
            containerClassName="gap-2"
            value={otp}
            onChange={handleChange}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <OtpInputGroup key={i} index={i} invalid={isError} />
            ))}
          </InputOTP>
        </div>

        {errorMsg ? (
          <p className="mb-2 text-center text-[13px] text-destructive">
            {errorMsg}
          </p>
        ) : null}

        {/* Status row — timer or error */}
        <div className="mb-5 flex justify-center">
          {canResend ? (
            <Button
              variant="link"
              onClick={handleResend}
              disabled={cooldown > 0}
              className="h-auto text-[13px] text-muted-foreground
                transition-colors hover:text-foreground"
            >
              Didn&apos;t receive a code? Resend
            </Button>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              Didn&apos;t receive a code? Resend in ({cooldown}s)
            </p>
          )}
        </div>

        {/* Verify button */}
        <Button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="mb-4 h-10 w-full rounded-lg text-[14px] font-medium
            transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
        >
          {isLoading ? "Verifying…" : "Verify email"}
        </Button>
      </CardContent>
    </Card>
  )
}

export { OTPVerify }
