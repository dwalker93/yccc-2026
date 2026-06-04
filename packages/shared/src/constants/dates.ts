export const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
] as const

export const YEARS = [
  ...Array.from({ length: 12 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return { value: String(year), label: String(year) }
  }),
]

export const FUTURE_YEARS = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() + 10 - i
  return { value: String(year), label: String(year) }
})

export const ALL_YEARS = [...FUTURE_YEARS, ...YEARS]
