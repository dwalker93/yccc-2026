import * as z from "zod"

import { CURRENT_YEAR, FROM_YEAR } from "@workspace/shared/constants/dates"
import {
  EMPLOYMENT_TYPES,
  FIELDS_OF_STUDY,
  QUALIFICATION_LEVELS,
} from "@workspace/shared/constants/educations"

const QUALIFICATION_ENUM = QUALIFICATION_LEVELS.map((l) => l.value)
const HIGHER_QUALIFICATION_ENUM = QUALIFICATION_ENUM.filter(
  (v) => v !== "secondary"
)
const FIELD_OF_STUDY_ENUM = FIELDS_OF_STUDY.map((f) => f.value)
const EMPLOYMENT_TYPE_ENUM = EMPLOYMENT_TYPES.map((e) => e.value)

// ── Normalized education payload schema (covers both branches) ───────────────

const secondaryEducationActionSchema = z.object({
  qualification: z.literal("secondary"),
  institution: z.string().min(1, "School name is required."),
  fieldOfStudy: z.null(),
  startYear: z.null(),
  startMonth: z.null(),
  endYear: z
    .int({ message: "School year is required." })
    .gte(FROM_YEAR)
    .lte(CURRENT_YEAR),
  endMonth: z.null(),
})

const higherEducationActionSchema = z
  .object({
    qualification: z.enum(HIGHER_QUALIFICATION_ENUM, {
      message: "Education level is required.",
    }),
    institution: z.string().min(1, "Institution name is required."),
    fieldOfStudy: z.enum(FIELD_OF_STUDY_ENUM, {
      message: "Field of study is required.",
    }),
    startYear: z
      .int({ message: "Start year is required." })
      .gte(FROM_YEAR)
      .lte(CURRENT_YEAR)
      .nullable(),
    startMonth: z.int().gte(1).lte(12).nullable(),
    endYear: z
      .int({ message: "End year is required." })
      .gte(FROM_YEAR)
      .lte(CURRENT_YEAR + 10),
    endMonth: z.int().gte(1).lte(12).nullable(),
  })
  .refine(
    (data) => {
      if (!data.startYear || !data.endYear) return true
      return (
        data.startYear * 100 + (data.startMonth ?? 0) <=
        data.endYear * 100 + (data.endMonth ?? 0)
      )
    },
    {
      message: "Start date must be on or before the end date.",
      path: ["endYear"],
    }
  )

export const addMemberEducationActionSchema = z.discriminatedUnion(
  "qualification",
  [secondaryEducationActionSchema, higherEducationActionSchema],
  { message: "Education level/Programme is required." }
)

// ── Profession (experience) payload schema ───────────────────────────────────

export const addMemberProfessionActionSchema = z
  .object({
    jobTitle: z.string().min(1, "Title is required."),
    employer: z.string().min(1, "Organization name is required."),
    location: z.string(),
    employmentType: z.enum(EMPLOYMENT_TYPE_ENUM, {
      message: "Employment type is required.",
    }),
    isCurrent: z.boolean(),
    startYear: z
      .int({ message: "Start year is required" })
      .gte(FROM_YEAR)
      .lte(CURRENT_YEAR),
    startMonth: z.int({ message: "Start month is required" }).gte(1).lte(12),
    endYear: z.int().gte(FROM_YEAR).lte(CURRENT_YEAR).nullable(),
    endMonth: z.int().gte(1).lte(12).nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.isCurrent) {
      if (!data.endYear) {
        ctx.addIssue({
          code: "custom",
          message: "End year is required.",
          path: ["endYear"],
        })
      }
      if (!data.endMonth) {
        ctx.addIssue({
          code: "custom",
          message: "End month is required.",
          path: ["endMonth"],
        })
      }
    }
  })
  .refine(
    (data) => {
      if (!data.isCurrent && data.startYear && data.endYear) {
        const from = data.startYear * 100 + (data.startMonth ?? 0)
        const to = data.endYear * 100 + (data.endMonth ?? 0)
        return from <= to
      } else return true
    },
    {
      message: "Start date must be on or before the end date.",
      path: ["endYear"],
    }
  )

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
