import { redirect } from "next/navigation"
import { getPendingVerificationIdentity } from "@/utils/email-verification-identity-generator"

import { VerifyEmail } from "@/components/verify-email"

export default async function EmailVerifyPage() {
  const email = await getPendingVerificationIdentity()

  if (!email) {
    redirect("/signin")
  }

  return (
    <>
      <VerifyEmail email={email} />
    </>
  )
}
