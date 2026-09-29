import { integer, pgTable } from "drizzle-orm/pg-core"

export const invoiceNumberCounters = pgTable("invoice_number_counters", {
  year: integer("year").primaryKey(),
  lastValue: integer("last_value").notNull().default(0),
})
