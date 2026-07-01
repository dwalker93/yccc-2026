import * as z from "zod"

export const approveMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: z.string().optional(),
  note: z.string().optional(),
})

export const bulkApproveMemberSchema = z.object({
  memberIds: z.array(z.string()).min(1, "At least one member ID is required"),
  reason: z.string().optional(),
  note: z.string().optional(),
})

export const rejectMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: z.string().min(1, "Reason is required for rejection"),
  note: z.string().optional(),
})

export const suspendMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: z.string().min(1, "Reason is required for suspension"),
  note: z.string().optional(),
  suspendedUntil: z.date().optional(),
})

export const banMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: z.string().min(1, "Reason is required for ban"),
  note: z.string().optional(),
})

export const reinstateMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  reason: z.string().min(1, "Reason is required for reinstatement"),
  note: z.string().optional(),
})

export type ApproveMemberData = z.infer<typeof approveMemberSchema>
export type RejectMemberData = z.infer<typeof rejectMemberSchema>
export type SuspendMemberData = z.infer<typeof suspendMemberSchema>
export type BanMemberData = z.infer<typeof banMemberSchema>
export type ReinstateMemberData = z.infer<typeof reinstateMemberSchema>
