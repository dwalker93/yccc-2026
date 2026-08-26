import { NextResponse } from "next/server"
import { getActivePlansService } from "@/services/plan-service"

import { withAuth } from "@/lib/auth/with-auth"

export const GET = withAuth(async () => {
  const plans = await getActivePlansService()
  return NextResponse.json(plans)
})


