import { customAlphabet } from "nanoid"

const randomPart = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5)

export const IdPrefix = {
  MEMBER: "MEM",
  EDUCATION: "EDU",
  PROFESSION: "PRO",
  MEMBER_STATUS_HISTORY: "MSH",
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
