import * as schema from "@workspace/shared/schemas"

import { appdb } from "../lib/db"
import memberStatusHistoryData from "./member-status-history.json"

async function seedMemberStatusHistory() {
  console.log("Seeding members status history...")

  await appdb.insert(schema.memberStatusHistory).values(
    memberStatusHistoryData.map((msh) => ({
      ...msh,
      createdAt: new Date(msh.createdAt),
    })) as (typeof schema.memberStatusHistory.$inferInsert)[]
  )

  console.log("Members status history seeding complete.")
}

seedMemberStatusHistory()
  .catch((err) => {
    console.error("Members status history seeding failed:", err)
    process.exit(1)
  })
  .then(() => {
    process.exit(0)
  })
