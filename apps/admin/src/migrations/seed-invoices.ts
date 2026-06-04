import { sql } from "drizzle-orm"

import * as schema from "@workspace/shared/schemas"

import { appdb } from "../lib/db"
import invoicesData from "./invoices.json"

async function seedInvoices() {
  console.log("Seeding invoices...")

  await appdb.insert(schema.invoices).values(
    invoicesData.map((i) => ({
      ...i,
      periodStart: new Date(i.periodStart),
      periodEnd: new Date(i.periodEnd),
      issuedAt: new Date(i.issuedAt),
      dueAt: i.dueAt ? new Date(i.dueAt) : null,
      paidAt: i.paidAt ? new Date(i.paidAt) : null,
      createdAt: new Date(i.createdAt),
      updatedAt: new Date(i.updatedAt),
    })) as (typeof schema.invoices.$inferInsert)[]
  )

  await appdb.execute(
    sql`CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1`
  )

  await appdb.execute(sql`SELECT setval('invoice_number_seq', 138, false)`)

  console.log("Invoices seeding complete.")
}

seedInvoices()
  .catch((err) => {
    console.error("Invoices seeding failed:", err)
    process.exit(1)
  })
  .then(() => {
    process.exit(0)
  })
