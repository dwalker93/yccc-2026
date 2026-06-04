/**
 * Extracts the date of birth and gender from a Sri Lankan NIC number.
 * Returns null for any invalid input — safe to use in Zod refine/transform.
 *
 * NIC day-of-year encoding: actual day + 1 (e.g. Sep 20 = day 263, encoded as 264)
 * For females, an additional +500 offset is applied on top.
 */

function dobToString(dob: Date): string {
  const y = dob.getUTCFullYear()
  const m = String(dob.getUTCMonth() + 1).padStart(2, "0")
  const d = String(dob.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}` // "1993-09-20"
}

export function nicToDob(
  nic: string
): { dob: string; gender: "male" | "female" } | null {
  if (!nic) return null

  const cleaned = nic.trim().toUpperCase()

  let year: number
  let dayOfYear: number

  const oldMatch = cleaned.match(/^(\d{2})(\d{3})\d{4}[VX]$/)
  const newMatch = cleaned.match(/^(\d{4})(\d{3})\d{5}$/)

  if (oldMatch) {
    year = 1900 + parseInt(oldMatch[1] ?? "0", 10)
    dayOfYear = parseInt(oldMatch[2] ?? "0", 10)
  } else if (newMatch) {
    year = parseInt(newMatch[1] ?? "0", 10)
    dayOfYear = parseInt(newMatch[2] ?? "0", 10)
  } else {
    return null
  }

  let gender: "male" | "female"
  if (dayOfYear > 500) {
    gender = "female"
    dayOfYear -= 500
  } else {
    gender = "male"
  }

  if (dayOfYear < 2 || dayOfYear > 367) return null

  const dob = new Date(Date.UTC(year, 0, 1))
  dob.setUTCDate(dob.getUTCDate() + dayOfYear - 2)

  // Sanity check: day didn't spill into the next year
  if (dob.getUTCFullYear() !== year) return null

  const dobStr = dobToString(dob)

  return { dob: dobStr, gender }
}
