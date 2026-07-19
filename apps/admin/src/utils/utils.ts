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
