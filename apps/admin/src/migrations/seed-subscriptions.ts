import * as schema from "@workspace/shared/schemas"

import { appdb } from "../lib/db"
import subscriptionsData from "./subscriptions.json"

async function seedSubscriptions() {
  console.log("Seeding subscriptions...")

  await appdb.insert(schema.subscriptions).values(
    subscriptionsData.map((s) => ({
      ...s,
      currentPeriodStart: new Date(s.currentPeriodStart),
      currentPeriodEnd: new Date(s.currentPeriodEnd),
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    })) as (typeof schema.subscriptions.$inferInsert)[]
  )

  console.log("Subscriptions seeding complete.")
}

seedSubscriptions()
  .catch((err) => {
    console.error("Subscriptions seeding failed:", err)
    process.exit(1)
  })
  .then(() => {
    process.exit(0)
  })
