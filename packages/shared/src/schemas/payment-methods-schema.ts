import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

import { payments } from "./payments-schema"

/**
 * High-level grouping of payment methods for UI rendering.
 * Stays as enum because categories are stable concepts.
 *
 * CARD    → VISA, MASTER, AMEX, DISCOVER, DINERS_CLUB (via payment gateway)
 * MOBILE  → EZCASH, MCASH, FRIMI, GENIE (via payment gateway)
 * WALLET  → HELAPAY, IPAY, QPLUS, VISHWA (via payment gateway)
 * BANKING → HNB (via payment gateway), BANK_TRANSFER (manual, admin confirmed)
 * CASH    → CASH (manual, admin confirmed)
 * FREE    → free plan, no payment collected
 */
export const paymentCategory = pgEnum("payment_category", [
  "CARD",
  "MOBILE",
  "WALLET",
  "BANKING",
  "CASH",
  "FREE",
])
// =============================================================================
// TABLE 6 — paymentMethods
// NOT an enum. Adding a new gateway = one INSERT, zero migrations.
// processingFeePercent in basis points (150 = 1.5%).
//
// Two payment flows exist:
//   Automatic: CARD, MOBILE, WALLET, BANKING (gateway) — webhook confirms payment
//   Manual:    BANK_TRANSFER, CASH — admin manually confirms payment
//
// Seed data:
// { id:"VISA",          name:"Visa",          category:"CARD",    isActive:true,  sortOrder:1  }
// { id:"MASTER",        name:"Mastercard",    category:"CARD",    isActive:true,  sortOrder:2  }
// { id:"AMEX",          name:"Amex",          category:"CARD",    isActive:true,  sortOrder:3  }
// { id:"DISCOVER",      name:"Discover",      category:"CARD",    isActive:false, sortOrder:4  }
// { id:"DINERS_CLUB",   name:"Diners Club",   category:"CARD",    isActive:false, sortOrder:5  }
// { id:"EZCASH",        name:"EZ Cash",       category:"MOBILE",  isActive:true,  sortOrder:6  }
// { id:"MCASH",         name:"mCash",         category:"MOBILE",  isActive:true,  sortOrder:7  }
// { id:"FRIMI",         name:"FriMi",         category:"MOBILE",  isActive:true,  sortOrder:8  }
// { id:"GENIE",         name:"Genie",         category:"MOBILE",  isActive:true,  sortOrder:9  }
// { id:"HELAPAY",       name:"HelaPay",       category:"WALLET",  isActive:true,  sortOrder:10 }
// { id:"IPAY",          name:"iPay",          category:"WALLET",  isActive:true,  sortOrder:11 }
// { id:"QPLUS",         name:"Q+",            category:"WALLET",  isActive:true,  sortOrder:12 }
// { id:"VISHWA",        name:"Vishwa",        category:"WALLET",  isActive:true,  sortOrder:13 }
// { id:"HNB",           name:"HNB Online",    category:"BANKING", isActive:true,  sortOrder:14 }
// { id:"BANK_TRANSFER", name:"Bank Transfer", category:"BANKING", isActive:true,  sortOrder:15 }
// { id:"CASH",          name:"Cash",          category:"CASH",    isActive:true,  sortOrder:16 }
// { id:"FREE",          name:"Free",          category:"FREE",    isActive:true,  sortOrder:17 }
// =============================================================================

export const paymentMethods = pgTable("payment_methods", {
  id: text("id").primaryKey(), // "VISA" | "EZCASH" | "BANK_TRANSFER"
  name: text("name").notNull(), // "Visa" | "EZ Cash" | "Bank Transfer"
  category: paymentCategory("category").notNull(),
  processingFeePercent: integer("processing_fee_percent").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const paymentMethodsRelations = relations(
  paymentMethods,
  ({ many }) => ({
    payments: many(payments),
  })
)
