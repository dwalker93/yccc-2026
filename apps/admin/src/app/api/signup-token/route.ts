import { NextResponse } from "next/server"
import dayjs from "dayjs"

import { auth } from "@/lib/auth/auth"
import { redis } from "@/lib/redis"

const TOKEN_EXPIRY_TIME = 60 * 10

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  const data = await redis.get(`signup-token-${token}`)

  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const session = await auth.api.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const token = crypto.randomUUID()

  await redis.set(
    `signup-token-${token}`,
    JSON.stringify({
      email,
      expiresIn: dayjs().add(TOKEN_EXPIRY_TIME, "second").toISOString(),
    }),
    {
      ex: TOKEN_EXPIRY_TIME,
    }
  )

  return NextResponse.json({ message: "Token created" })
}
