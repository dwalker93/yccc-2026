import dayjs from "dayjs"

export const searchableColumns = [
  { value: "id", label: "ID" }, // default
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
] as const satisfies readonly {
  value: string
  label: string
  default?: boolean
}[]

export type SearchableColumn = (typeof searchableColumns)[number]["value"]

export const getExpiryClass = (expiry: string) => {
  const expiryDate = dayjs(expiry)
  if (!expiryDate.isValid()) {
    return "text-muted-foreground"
  }
  const today = dayjs()
  const daysUntilExpiry = expiryDate.diff(today, "day")

  if (daysUntilExpiry <= 7) {
    return "text-red-700 dark:text-red-400"
  } else if (daysUntilExpiry > 7 && daysUntilExpiry < 45) {
    return "text-amber-700 dark:text-amber-400"
  } else {
    return "text-emerald-700 dark:text-green-400"
  }
}

export const getInvoiceStatusClass = (invoiceStatus: string) => {
  switch (invoiceStatus) {
    case "open":
      return "bg-amber-200 text-amber-700 border border-amber-400 dark:bg-amber-700/20 dark:text-amber-400 dark:border-amber-900"
    case "paid":
      return "bg-emerald-200 text-emerald-700 border border-emerald-400 dark:bg-green-700/20 dark:text-green-400 dark:border-green-700"
    case "void":
      return "bg-red-200 text-red-700 border border-red-400 dark:bg-red-700/20 dark:text-red-400 dark:border-red-700"
    case "uncollectable":
      return "bg-slate-200 text-slate-700 border border-slate-400 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-700"
  }
}
