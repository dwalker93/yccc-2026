import * as schema from "@workspace/shared/schemas"

import { appdb } from "../lib/db"

const ProFeatures = [
  "Everything in Free Plus",
  "Career Guidance",
  "Interview Prep",
  "Chances to participate in International Competitions",
]
const FreeFeatures = ["Workshops", "Interviews"]

async function seedPlans() {
  console.log("Seeding subscription plans...")

  // Parse date strings into Date objects
  const data: (typeof schema.plans.$inferInsert)[] = [
    {
      id: "PLN0001",
      name: "Free",
      price: 0,
      interval: "lifetime",
      description:
        "Perfect for beginners who are willing to explore future opportunities",
      isActive: true,
      sortOrder: 0,
      features: FreeFeatures,
    },
    {
      id: "PLN0002",
      name: "Pro",
      price: 2500000,
      interval: "annual",
      description: "For Intermediates to gain more experience in the industry",
      isActive: true,
      sortOrder: 1,
      features: ProFeatures,
    },
    {
      id: "PLN0003",
      name: "Pro",
      price: 30000,
      interval: "monthly",
      description: "Valid for 1 month from the date of purchase",
      isActive: true,
      sortOrder: 1,
      features: ProFeatures,
    },
  ]

  await appdb.insert(schema.plans).values(data)

  console.log("Subscription plans seeding complete.")
}

seedPlans()
  .catch((err) => {
    console.error("Subscription plans seeding failed:", err)
    process.exit(1)
  })
  .then(() => {
    process.exit(0)
  })
