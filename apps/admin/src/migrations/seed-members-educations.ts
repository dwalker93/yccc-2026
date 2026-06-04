import * as schema from "@workspace/shared/schemas"
import { generateId } from "@workspace/shared/utils/generate-id"

import { appdb } from "../lib/db"
import educationsData from "./member-education.json"

async function seedMemberEducations() {
  console.log("Seeding members educations...")

  await appdb.insert(schema.memberEducation).values(
    educationsData.map((e) => ({
      ...e,
      id: generateId("EDU"),
      startMonth: e.startMonth ? Number(e.startMonth) : undefined,
      startYear: e.startYear ? Number(e.startYear) : undefined,
      endMonth: e.endMonth ? Number(e.endMonth) : undefined,
      endYear: e.endYear ? Number(e.endYear) : undefined,
    })) as (typeof schema.memberEducation.$inferInsert)[]
  )

  console.log("Members educations seeding complete.")
}

seedMemberEducations()
  .catch((err) => {
    console.error("Members educations seeding failed:", err)
    process.exit(1)
  })
  .then(() => {
    process.exit(0)
  })
