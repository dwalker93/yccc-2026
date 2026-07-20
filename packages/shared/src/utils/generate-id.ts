import { customAlphabet } from "nanoid"

const randomPart = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5)

export const IdPrefix = {
  MEMBER: "MEM",
  EDUCATION: "EDU",
  PROFESSION: "PRO",
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

const mshRandom = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 4)

export function generateMshId(): string {
  const now = new Date()
  const year = now.getFullYear().toString(36).toUpperCase()
  const month = (now.getMonth() + 1).toString(36).toUpperCase()
  const day = now.getDate().toString(36).toUpperCase()
  const msFromMidnight =
    now.getHours() * 3600000 +
    now.getMinutes() * 60000 +
    now.getSeconds() * 1000 +
    now.getMilliseconds()
  const timePart = msFromMidnight.toString(36).toUpperCase().padStart(6, "0")
  return `MSH${year}${month}${day}${timePart}${mshRandom()}`
}
