import * as schema from "@workspace/shared/schemas"

import { appdb } from "../lib/db"

async function seedPaymentMethods() {
  console.log("Seeding payment methods...")

  // Parse date strings into Date objects
  const data: (typeof schema.paymentMethods.$inferInsert)[] = [
    {
      id: "PMT0001",
      name: "Visa",
      category: "CARD",
      isActive: true,
      sortOrder: 1,
    },
    {
      id: "PMT0002",
      name: "Mastercard",
      category: "CARD",
      isActive: true,
      sortOrder: 2,
    },
    {
      id: "PMT0003",
      name: "Amex",
      category: "CARD",
      isActive: true,
      sortOrder: 3,
    },
    {
      id: "PMT0004",
      name: "Discover",
      category: "CARD",
      isActive: false,
      sortOrder: 4,
    },
    {
      id: "PMT0005",
      name: "Diners Club",
      category: "CARD",
      isActive: false,
      sortOrder: 5,
    },
    {
      id: "PMT0006",
      name: "EZ Cash",
      category: "MOBILE",
      isActive: true,
      sortOrder: 6,
    },
    {
      id: "PMT0007",
      name: "mCash",
      category: "MOBILE",
      isActive: true,
      sortOrder: 7,
    },
    {
      id: "PMT0008",
      name: "FriMi",
      category: "WALLET",
      isActive: true,
      sortOrder: 8,
    },
    {
      id: "PMT0009",
      name: "Genie",
      category: "WALLET",
      isActive: true,
      sortOrder: 9,
    },
    {
      id: "PMT0010",
      name: "HelaPay",
      category: "MOBILE",
      isActive: true,
      sortOrder: 10,
    },
    {
      id: "PMT0011",
      name: "iPay",
      category: "WALLET",
      isActive: true,
      sortOrder: 11,
    },
    {
      id: "PMT0012",
      name: "Q+",
      category: "WALLET",
      isActive: true,
      sortOrder: 12,
    },
    {
      id: "PMT0013",
      name: "Sampath Vishwa",
      category: "BANKING",
      isActive: true,
      sortOrder: 13,
    },
    {
      id: "PMT0014",
      name: "HNB Online",
      category: "BANKING",
      isActive: true,
      sortOrder: 14,
    },
    {
      id: "PMT0015",
      name: "Bank Transfer",
      category: "BANKING",
      isActive: true,
      sortOrder: 15,
    },
    {
      id: "PMT0016",
      name: "Cash",
      category: "CASH",
      isActive: true,
      sortOrder: 16,
    },
    {
      id: "PMT0017",
      name: "Free",
      category: "FREE",
      isActive: true,
      sortOrder: 17,
    },
  ]

  await appdb.insert(schema.paymentMethods).values(data)

  console.log("Payment methods seeding complete.")
}

seedPaymentMethods()
  .catch((err) => {
    console.error("Payment methods seeding failed:", err)
    process.exit(1)
  })
  .then(() => {
    process.exit(0)
  })
