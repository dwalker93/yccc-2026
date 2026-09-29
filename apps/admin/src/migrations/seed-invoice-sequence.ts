import { readFileSync } from "fs"
import { sql } from "drizzle-orm"

import { appdb } from "../lib/db"

async function migrate() {
  const script = readFileSync(
    new URL("./invoice-sequence.sql", import.meta.url),
    "utf-8"
  )
  await appdb.execute(sql.raw(script))
  console.log("Invoice numbering migration complete.")
}

migrate()
  .catch((err) => {
    console.error("Migration failed:", err)
    process.exit(1)
  })
  .then(() => process.exit(0))
