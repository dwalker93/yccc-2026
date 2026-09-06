import { eq } from "drizzle-orm"

import { plans } from "@workspace/shared/schemas/subscription-plans-schema"

import { appdb } from "@/lib/db"
import { ServiceError } from "@/services/errors"

export async function getActivePlansService() {
  try {
    const activePlans = await appdb
      .select({
        id: plans.id,
        name: plans.name,
      })
      .from(plans)
      .where(eq(plans.isActive, true))
      .orderBy(plans.sortOrder)

    // Deduplicate by name (e.g. "Pro" monthly + "Pro" annual → one "Pro" filter option)
    const seen = new Set<string>()
    return activePlans.filter((p) => {
      const key = p.name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  } catch (error) {
    console.error("getActivePlansService failed", error)
    if (error instanceof ServiceError) throw error
    throw new ServiceError("Failed to get active plans")
  }
}


export type PlanOption = Awaited<
  ReturnType<typeof getActivePlansService>
>[number]
