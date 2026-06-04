import * as schema from "@workspace/shared/schemas"

import { appdb } from "../lib/db"
import paymentsData from "./payments.json"

async function seedPayments() {
  console.log("Seeding payments...")

  await appdb.insert(schema.payments).values(
    paymentsData.map((p) => ({
      ...p,
      paidAt: p.paidAt ? new Date(p.paidAt) : null,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    })) as (typeof schema.payments.$inferInsert)[]
  )

  console.log("Payments seeding complete.")
}

seedPayments()
  .catch((err) => {
    console.error("Payments seeding failed:", err)
    process.exit(1)
  })
  .then(() => {
    process.exit(0)
  })
