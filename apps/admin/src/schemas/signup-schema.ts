import * as z from "zod"

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(20, "First name must be at most 20 characters"),
    lastName: z
      .string()
      .trim()
      .max(20, "Last name must be at most 20 characters"),
    email: z.email("Please enter a valid email address"),
    password: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#^]{8,32}$/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirmPassword: z.string().trim().min(1, "Please confirm your password"),
    acceptTerms: z
      .boolean()
      .refine((value) => value, "You must accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type SignupData = z.infer<typeof signupSchema>
