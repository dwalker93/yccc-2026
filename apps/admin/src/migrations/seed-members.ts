import * as schema from "@workspace/shared/schemas"

import { appdb } from "../lib/db"
import membersData from "./members.json"

async function seedMembers() {
  console.log("Seeding members...")

  await appdb.insert(schema.members).values(
    membersData.map((m) => ({
      ...m,
      memberSince: new Date(m.memberSince),
      subscriptionCurrentPeriodEnd: m.subscriptionCurrentPeriodEnd
        ? new Date(m.subscriptionCurrentPeriodEnd)
        : null,
      createdAt: new Date(m.createdAt),
      updatedAt: new Date(m.updatedAt),
    })) as (typeof schema.members.$inferInsert)[]
  )

  console.log("Members seeding complete.")
}

seedMembers()
  .catch((err) => {
    console.error("Members seeding failed:", err)
    process.exit(1)
  })
  .then(() => {
    process.exit(0)
  })
