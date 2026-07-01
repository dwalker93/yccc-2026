import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/auth"

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (session) {
    redirect("/")
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {children}
      <p
        className="relative text-center text-sm text-muted-foreground
          sm:absolute sm:bottom-4"
      >
        Copyright &copy; {new Date().getFullYear()} YCCC. All rights reserved.
      </p>
    </div>
  )
}
