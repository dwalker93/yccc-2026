"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signupSchema } from "@/schemas/signup-schema"
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react"
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

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    validators: {
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          name: `${value.firstName} ${value.lastName}`,
          email: value.email,
          password: value.password,
          callbackURL: "/verify-email",
        },
        {
          onSuccess: async () => {
            toast.success("Account created successfully")
            router.push("/verify-email")
          },
          onError: (ctx) => {
            // display the error message
            toast.error(ctx.error.message)
          },
        }
      )
    },
  })
  return (
    <Card className="mx-4 my-4 w-[95%] max-w-sm shadow-xs sm:w-full">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your information to get started</CardDescription>
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
            <form.AppField name="firstName">
              {(field) => (
                <field.inputGroup
                  label="First name"
                  required
                  leftAddon={<User aria-hidden="true" className="size-4" />}
                  autoComplete="given-name"
                  placeholder="Kasun"
                />
              )}
            </form.AppField>

            <form.AppField name="lastName">
              {(field) => (
                <field.inputGroup
                  label="Last name"
                  optionalField
                  leftAddon={<User aria-hidden="true" className="size-4" />}
                  autoComplete="family-name"
                  placeholder="Perera"
                />
              )}
            </form.AppField>

            <form.AppField name="email">
              {(field) => (
                <field.inputGroup
                  label="Email"
                  required
                  leftAddon={<Mail aria-hidden="true" className="size-4" />}
                  autoComplete="email"
                  placeholder="kasunperea@gmail.com"
                  type="email"
                  inputMode="email"
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
                  autoComplete="new-password"
                  placeholder="Create a password"
                  type={showPassword ? "text" : "password"}
                  description="Must be at least 8 characters with an uppercase letter, a lowercase letter and a number"
                />
              )}
            </form.AppField>

            <form.AppField name="confirmPassword">
              {(field) => (
                <field.inputGroup
                  label="Confirm Password"
                  required
                  leftAddon={<Lock aria-hidden="true" className="size-4" />}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  rightAddon={
                    <InputGroupButton
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      size="icon-sm"
                      onClick={() => {
                        setShowConfirmPassword(!showConfirmPassword)
                      }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff aria-hidden="true" className="size-4" />
                      ) : (
                        <Eye aria-hidden="true" className="size-4" />
                      )}
                    </InputGroupButton>
                  }
                />
              )}
            </form.AppField>

            <form.AppField name="acceptTerms">
              {(field) => (
                <field.checkbox
                  label={
                    <span className="w-[90%] font-normal">
                      I agree to the{" "}
                      <a
                        className="rounded-sm text-primary underline
                          underline-offset-4 hover:text-primary/80 focus:ring-2
                          focus:ring-ring focus:ring-offset-2
                          focus:outline-none"
                        href={"#"}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        className="rounded-sm text-primary underline
                          underline-offset-4 hover:text-primary/80 focus:ring-2
                          focus:ring-ring focus:ring-offset-2
                          focus:outline-none"
                        href={"#"}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Privacy Policy
                      </a>
                      <span aria-label="required" className="text-destructive">
                        *
                      </span>
                    </span>
                  }
                />
              )}
            </form.AppField>

            <Button
              aria-busy={form.state.isSubmitting}
              className="min-h-[44px] w-full touch-manipulation"
              data-loading={form.state.isSubmitting}
              disabled={form.state.isSubmitting}
              type="submit"
            >
              {form.state.isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
