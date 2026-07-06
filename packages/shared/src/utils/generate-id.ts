import { customAlphabet } from "nanoid"

const randomPart = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5)

export const IdPrefix = {
  MEMBER: "MEM",
  EDUCATION: "EDU",
  PROFESSION: "PRO",
  //MEMBER_STATUS_HISTORY: "MSH",
  //PLAN:                 "PLN", IDS are sequential
  //PAYMENT_METHOD:       "PMT",IDS are sequential
  SUBSCRIPTION: "SUB",
  INVOICE: "INV",
  PAYMENT: "PAY",
  REFUND: "RFN",
} as const

type IdPrefix = (typeof IdPrefix)[keyof typeof IdPrefix]

export function generateId(prefix: IdPrefix): string {
  const now = new Date()
  const year = now.getFullYear().toString(36).toUpperCase()
  const month = (now.getMonth() + 1).toString(36).toUpperCase()
  const day = now.getDate().toString(36).toUpperCase()

  return `${prefix}${year}${month}${day}${randomPart()}`
}

export function generateMshId(): string {
  const now = new Date()

  const year = now.getFullYear().toString(36).toUpperCase() // 3 chars e.g. "1K2"
  const month = (now.getMonth() + 1).toString(36).toUpperCase() // 1 char  e.g. "A"
  const day = now.getDate().toString(36).toUpperCase() // 1-2 chars e.g. "1"-"V"

  const msFromMidnight =
    now.getHours() * 3600000 +
    now.getMinutes() * 60000 +
    now.getSeconds() * 1000 +
    now.getMilliseconds()

  const timePart = msFromMidnight.toString(36).toUpperCase().padStart(6, "0")

  return `MSH${year}${month}${day}${timePart}`
}
