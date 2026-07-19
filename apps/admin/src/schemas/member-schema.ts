import * as z from "zod"

const optionalTrimmed = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val === "" ? undefined : val))

const requiredReason = (action: string) =>
  z.string().trim().min(1, `Reason is required for ${action}`)

export const approveMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: optionalTrimmed,
  note: optionalTrimmed,
})

export const bulkApproveMemberSchema = z.object({
  memberIds: z.array(z.string()).min(1, "At least one member ID is required"),
  reason: optionalTrimmed,
  note: optionalTrimmed,
})

export const rejectMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: requiredReason("rejection"),
  note: optionalTrimmed,
})

export const suspendMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: requiredReason("suspension"),
  note: optionalTrimmed,
  suspendedUntil: z
    .union([z.date(), z.string()])
    .transform((val) => {
      if (!val) return undefined
      if (val instanceof Date) return val
      return new Date(val)
    })
    .refine((val) => val === undefined || !Number.isNaN(val.getTime()), {
      message: "Invalid date for suspendedUntil",
    })
    .optional(),
})

export const banMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: requiredReason("ban"),
  note: optionalTrimmed,
})

export const reinstateMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: requiredReason("reinstatement"),
  note: optionalTrimmed,
})

export type ApproveMemberData = z.infer<typeof approveMemberSchema>
export type RejectMemberData = z.infer<typeof rejectMemberSchema>
export type SuspendMemberData = z.infer<typeof suspendMemberSchema>
export type BanMemberData = z.infer<typeof banMemberSchema>
export type ReinstateMemberData = z.infer<typeof reinstateMemberSchema>
