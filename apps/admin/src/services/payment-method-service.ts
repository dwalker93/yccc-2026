import { ServiceError } from "@/services/errors"

import { paymentMethods } from "@workspace/shared/schemas"

import { appdb } from "@/lib/db"

export async function getPaymentMethodsService() {
  try {
    const activePaymentMethods = await appdb
      .select({
        id: paymentMethods.id,
        name: paymentMethods.name,
      })
      .from(paymentMethods)

    return activePaymentMethods
  } catch (error) {
    console.error("getActivePlansService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get active plans")
  }
}

export type PaymentMethodOption = Awaited<
  ReturnType<typeof getPaymentMethodsService>
>[number]
