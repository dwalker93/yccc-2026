import { eq } from "drizzle-orm"

import { plans } from "@workspace/shared/schemas/subscription-plans-schema"

import { appdb } from "@/lib/db"

export async function getActivePlansService() {
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
}

export type PlanOption = Awaited<
  ReturnType<typeof getActivePlansService>
>[number]
