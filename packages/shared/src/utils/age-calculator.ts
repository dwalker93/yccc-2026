import dayjs from "dayjs"

export function calculateAge(birthDate: string) {
  const birth = dayjs(birthDate)
  const now = dayjs()

  if (!birth.isValid()) {
    return { years: 0, months: 0, days: 0 }
  }

  const years = now.diff(birth, "year")
  const afterYears = birth.add(years, "year")
  const months = now.diff(afterYears, "month")
  const afterMonths = afterYears.add(months, "month")
  const days = now.diff(afterMonths, "day")

  return { years, months, days }
}

export function ageFromDob(dob: string) {
  const { years, months, days } = calculateAge(dob)
  return `${years}y ${months}m ${days}d`
}
