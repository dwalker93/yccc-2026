import { headers } from "next/headers"
import { getActivePlansService } from "@/services/plan-service"

import { auth } from "@/lib/auth/auth"

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const plans = await getActivePlansService()
    return Response.json(plans)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Failed to fetch plans" }, { status: 500 })
  }
}
