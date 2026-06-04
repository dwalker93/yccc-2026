import * as z from "zod"

export const signinSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type SigninData = z.infer<typeof signinSchema>
