"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signinSchema } from "@/schemas/signin-schema"
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { FieldGroup } from "@workspace/ui/components/field"
import { InputGroupButton } from "@workspace/ui/components/input-group"
import { useAppForm } from "@workspace/ui/hooks/form"

import { authClient } from "@/lib/auth/auth-client"

export function SigninForm() {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")

  let callbackURL = "/?signin=success"
  if (redirect) {
    try {
      if (redirect.startsWith("/") && !redirect.startsWith("//")) {
        const url = new URL(redirect, "http://localhost")
        url.searchParams.set("signin", "success")
        const relativePath = url.pathname + url.search + url.hash
        if (!relativePath.startsWith("//")) {
          callbackURL = relativePath
        }
      } else if (typeof window !== "undefined") {
        const url = new URL(redirect, window.location.origin)
        if (url.origin === window.location.origin) {
          url.searchParams.set("signin", "success")
          callbackURL = url.toString()
        }
      }
    } catch {
      // Ignore invalid redirect
    }
  }

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signinSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        await authClient.signIn.email(
          {
            email: value.email,
            password: value.password,
            rememberMe: false,
            callbackURL,
          },
          {
            onSuccess: () => {
              router.replace(callbackURL)
            },
            onError: (ctx) => {
              if (ctx.error.code === "EMAIL_NOT_VERIFIED") {
                return router.push("/verify-email")
              }
              toast.error(
                ctx.error.message ?? "Something went wrong. Try again later!"
              )
            },
          }
        )
      })
    },
  })
  return (
    <Card className="mx-4 my-4 w-[95%] max-w-sm shadow-xs sm:w-full">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <FieldGroup className="gap-4">
            <form.AppField name="email">
              {(field) => (
                <field.inputGroup
                  label="Email"
                  required
                  leftAddon={<Mail aria-hidden="true" className="size-4" />}
                  autoComplete="email"
                  placeholder="example@mail.com"
                  type="email"
                  inputMode="email"
                  disabled={isPending}
                />
              )}
            </form.AppField>

            <form.AppField name="password">
              {(field) => (
                <field.inputGroup
                  label="Password"
                  required
                  leftAddon={<Lock aria-hidden="true" className="size-4" />}
                  rightAddon={
                    <InputGroupButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      size="icon-sm"
                      disabled={isPending}
                      onClick={() => {
                        setShowPassword(!showPassword)
                      }}
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" className="size-4" />
                      ) : (
                        <Eye aria-hidden="true" className="size-4" />
                      )}
                    </InputGroupButton>
                  }
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  disabled={isPending}
                />
              )}
            </form.AppField>

            <Button
              aria-busy={isPending}
              className="min-h-[44px] w-full touch-manipulation"
              data-loading={isPending}
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  Sign in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
