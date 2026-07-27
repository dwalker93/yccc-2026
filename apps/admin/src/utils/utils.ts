import { MONTHS } from "@workspace/shared/constants/dates"

export function formatDate(dateString: string | Date | null | undefined) {
  if (!dateString) return "—"
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString
  const formattedDate = Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
  return formattedDate
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "LKR",
  }).format(amount / 100)
}

export const formatMonth = (
  month: number | null,
  format: "short" | "long" = "short"
) => {
  if (!month || month < 1 || month > 12) return "N/A"
  const monthStr = MONTHS.find((m) => Number(m.value) === month)?.label

  if (!monthStr) return "N/A"

  return format === "long" ? monthStr : monthStr.slice(0, 3)
}

export const formatPeriod = (
  startMonth: number | null,
  startYear: number | null,
  endMonth: number | null,
  endYear: number | null,
  format: "short" | "long" = "short"
) => {
  const startMonthStr = formatMonth(startMonth, format)

  if (endMonth && endYear) {
    const endMonthStr = formatMonth(endMonth, format)
    return `${startMonthStr} ${startYear} - ${endMonthStr} ${endYear}`
  }

  return `${startMonthStr} ${startYear ?? ""} - Present`
}
