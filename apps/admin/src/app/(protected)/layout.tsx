import { NuqsAdapter } from "nuqs/adapters/next/app"

import { AppShell } from "@/components/app-shell"

import { SigninToast } from "./(dashboard)/_components/signin-toast"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NuqsAdapter>
      <AppShell>{children}</AppShell>
      <SigninToast />
    </NuqsAdapter>
  )
}
