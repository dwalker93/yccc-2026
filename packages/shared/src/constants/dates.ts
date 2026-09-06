export const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
] as const

export const FROM_YEAR = 1970
export const CURRENT_YEAR = new Date().getFullYear()

export const YEARS = Array.from(
  { length: CURRENT_YEAR - FROM_YEAR + 1 },
  (_, i) => {
    const year = CURRENT_YEAR - i
    return { value: year, label: String(year) }
  }
)

export const FUTURE_YEARS = Array.from({ length: 10 }, (_, i) => {
  const year = CURRENT_YEAR + 10 - i
  return { value: year, label: String(year) }
})

export const ALL_YEARS = [...FUTURE_YEARS, ...YEARS]
