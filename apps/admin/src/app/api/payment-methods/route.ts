import { NextResponse } from "next/server"
import { getPaymentMethodsService } from "@/services/payment-method-service"

import { withAuth } from "@/lib/auth/with-auth"

export const GET = withAuth(async () => {
  const paymentMethods = await getPaymentMethodsService()
  return NextResponse.json(paymentMethods)
})
