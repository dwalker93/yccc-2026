import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { getMemberMetadata } from "@/services/member-service"

import { auth } from "@/lib/auth/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }
  const { id } = await params
  try {
    const metadata = await getMemberMetadata({ id })
    return NextResponse.json(metadata)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch member metadata" },
      { status: 500 }
    )
  }
}
