import { headers } from "next/headers"
import { NextRequest } from "next/server"
import { getMemberProfessionService } from "@/services/member-service"

import { auth } from "@/lib/auth/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id } = await params
  const searchParams = request.nextUrl.searchParams

  const pageIndex = parseInt(searchParams.get("page") ?? "1")
  const pageSize = parseInt(searchParams.get("perPage") ?? "5")

  try {
    const data = await getMemberProfessionService({
      memberId: id,
      pageIndex,
      pageSize,
    })

    return Response.json(data)
  } catch (error) {
    console.error("getMemberProfessionService failed", error)
    return Response.json(
      { error: "Failed to get member profession" },
      { status: 500 }
    )
  }
}
