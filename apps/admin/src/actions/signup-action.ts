"use server"

import { auth } from "@/lib/auth/auth"

export async function signupAction(
  password: string,
  name: string,
  email: string
) {
  return auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      callbackURL: "/verify-email",
    },
  })
}
