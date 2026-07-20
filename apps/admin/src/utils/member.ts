/**
 * Safely formats a member ID for display.
 * Extracts the numeric/identifying part after the "MEM" prefix.
 * If the prefix is missing or the ID is in an unexpected format,
 * returns the original ID or a fallback to avoid returning undefined.
 *
 * @param id The member ID to format.
 * @returns The formatted ID or a fallback/original value.
 */
export function formatMemberId(id: string | null | undefined): string {
  if (!id) {
    return ""
  }

  const parts = id.split("MEM")
  if (parts.length > 1 && parts[1] !== undefined) {
    return parts[1]
  }

  return id
}

/**
 * Generates a fallback avatar text for a member.
 *
 * @param name The name of the member.
 * @returns The fallback avatar text (first letter of first and last name).
 */
export function avatarFallback(name: string): string {
  if (!name) {
    return "??"
  }

  const parts = name.trim().split(" ")
  const first = parts[0]
  if (!first) {
    return "??"
  }

  if (parts.length === 1) {
    return first.charAt(0).toUpperCase()
  }

  const last = parts[parts.length - 1]
  const firstNameInitial = first.charAt(0).toUpperCase()
  const lastNameInitial = last ? last.charAt(0).toUpperCase() : ""

  return `${firstNameInitial}${lastNameInitial}`
}
