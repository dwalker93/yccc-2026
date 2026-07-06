import { setPendingVerificationIdentity } from "@/utils/email-verification-identity-generator"
import { withRetry } from "@/utils/with-retry"
import { dash } from "@better-auth/infra"
import { waitUntil } from "@vercel/functions"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { betterAuth } from "better-auth/minimal"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins"

import { sendVerificationOTPEmail } from "../brevo"
import { authdb } from "../db"
import * as schema from "../db/schemas/auth-schema"
import { redisSecondaryStorage } from "./adapters/redis-storage"

export const auth = betterAuth({
  appName: "Chefly Admin",
  database: drizzleAdapter(authdb, { provider: "pg", schema }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },
  experimental: {
    joins: true, // Enable database joins for better performance
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendOnPasswordReset: true,
    revokeSessionsOnPasswordReset: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user: _ }) => {
      // Send verification email to user
    },
    autoSignInAfterVerification: true,
  },

  secondaryStorage: redisSecondaryStorage,
  session: { storeSessionInDatabase: true },
  plugins: [
    dash(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        const emailType =
          type === "sign-in" || type === "email-verification"
            ? type
            : "password-reset"
        return sendVerificationOTPEmail({ email, otp, type: emailType }).catch(
          (error) => {
            console.error(
              "[auth] Failed to send verification OTP email:",
              error
            )
          }
        )
      },
    }),
    nextCookies(),
  ],

  rateLimit: {
    storage: "secondary-storage",
  },

  advanced: {
    backgroundTasks: { handler: waitUntil },
    ipAddress: {
      // For Vercel
      ipAddressHeaders: ["x-vercel-forwarded-for", "x-forwarded-for"],
    },
    cookiePrefix: "chefly",
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-in/email")) {
        if (
          ctx.context.returned instanceof APIError &&
          ctx.context.returned.body?.code === "EMAIL_NOT_VERIFIED"
        ) {
          try {
            await withRetry(() =>
              setPendingVerificationIdentity(ctx.body.email)
            )
          } catch (error) {
            console.error(
              "[auth] Failed to set pending verification identity after retries:",
              error
            )
            throw new APIError("INTERNAL_SERVER_ERROR", {
              body: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to set pending verification identity",
              },
            })
          }
        }
      }
    }),
  },
})
