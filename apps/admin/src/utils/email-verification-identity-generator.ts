import crypto from "crypto"
import { cookies } from "next/headers"

import { redis } from "@/lib/redis"

const COOKIE_NAME = "chefly.verification_id"
const TTL = 60 * 15 // 15 minutes

export async function setPendingVerificationIdentity(email: string) {
  const token = crypto.randomBytes(32).toString("hex")

  await redis.set(`pending-verification:${token}`, email, { ex: TTL })
  ;(await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: TTL,
    sameSite: "lax",
    path: "/",
  })
}

export async function getPendingVerificationIdentity(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null

  return redis.get<string>(`pending-verification:${token}`)
}

export async function clearPendingVerificationIdentity() {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return

  await redis.del(`pending-verification:${token}`)
  ;(await cookies()).delete(COOKIE_NAME)
}
