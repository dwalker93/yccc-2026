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
    return "";
  }
  
  const parts = id.split("MEM");
  if (parts.length > 1 && parts[1] !== undefined) {
    return parts[1];
  }
  
  return id;
}
