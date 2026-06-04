"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { member } from "@/lib/db/schemas/app-schema"

export async function createMemberAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const dateOfBirth = new Date(formData.get("dateOfBirth") as string)
  const nic = formData.get("nic") as string
  const city = formData.get("city") as string

  await db.insert(member).values({
    id: crypto.randomUUID(),
    name,
    email,
    phone,
    dateOfBirth,
    nic,
    city,
    education: formData.get("education") as string,
    profession: formData.get("profession") as string,
    address: formData.get("address") as string,
    photo: formData.get("photo") as string,
    district: formData.get("district") as string,
  })

  revalidatePath("/members")
}
