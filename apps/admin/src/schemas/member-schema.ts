import * as z from "zod"

export const approveMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  note: z.string().trim().optional(),
})

export const bulkApproveMemberSchema = z.object({
  memberIds: z.array(z.string()).min(1, "At least one member ID is required"),
  reason: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  note: z.string().trim().optional(),
})

export const rejectMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: z.string().min(1, "Reason is required for rejection"),
  note: z.string().trim().optional(),
})

export const suspendMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: z.string().min(1, "Reason is required for suspension"),
  note: z.string().trim().optional(),
  suspendedUntil: z
    .union([z.date(), z.string()])
    .transform((val) => {
      if (!val) return undefined
      if (val instanceof Date) return val
      return new Date(val)
    })
    .optional(),
})

export const banMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: z.string().min(1, "Reason is required for ban"),
  note: z.string().trim().optional(),
})

export const reinstateMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: z.string().min(1, "Reason is required for reinstatement"),
  note: z.string().trim().optional(),
})

export type ApproveMemberData = z.infer<typeof approveMemberSchema>
export type RejectMemberData = z.infer<typeof rejectMemberSchema>
export type SuspendMemberData = z.infer<typeof suspendMemberSchema>
export type BanMemberData = z.infer<typeof banMemberSchema>
export type ReinstateMemberData = z.infer<typeof reinstateMemberSchema>
