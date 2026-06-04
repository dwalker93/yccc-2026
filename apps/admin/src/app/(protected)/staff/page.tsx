import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/auth"

export default async function StaffPage() {
  const session = await auth.api.getSession()

  if (session?.user.role !== "super_admin") {
    return redirect("/")
  }

  return (
    <div>
      <h1>Staff</h1>
    </div>
  )
}
