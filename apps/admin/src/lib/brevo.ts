import { BrevoClient } from "@getbrevo/brevo"

if (!process.env.BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY is not defined")
}

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
})

type SendVerificationOTPEmailParams = {
  email: string
  otp: string
  type: "sign-in" | "email-verification" | "password-reset"
}

const emailTemplateIds = {
  "sign-in": 3,
  "email-verification": 3,
  "password-reset": 4,
}

export async function sendVerificationOTPEmail({
  email,
  otp,
  type,
}: SendVerificationOTPEmailParams): Promise<void> {
  const templateId = emailTemplateIds[type]

  await brevo.transactionalEmails.sendTransacEmail({
    templateId,
    to: [{ email }],
    params: {
      otp,
    },
  })
}
