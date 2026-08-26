import * as z from "zod"

import { calculateAge } from "@workspace/shared/utils/age-calculator"
import { nicToDob } from "@workspace/shared/utils/nic-to-dob"

import { CURRENT_YEAR, FROM_YEAR } from "../constants/dates"
import {
  EMPLOYMENT_TYPES,
  FIELDS_OF_STUDY,
  QUALIFICATION_LEVELS,
} from "../constants/educations"

export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters.")
    .max(30, "First name must be less than 30 characters."),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters.")
    .max(30, "Last name must be less than 30 characters."),
  nic: z
    .string()
    .min(10, "NIC must be at least 10 characters.")
    .max(12, "NIC must be at most 12 characters.")
    .regex(
      /^([0-9]{9}[vVxX]|[0-9]{12})$/,
      "Enter a valid NIC (e.g. 199521503456 or 952150345V)."
    ),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required.")
    .refine(
      (val) => {
        const { years } = calculateAge(val)
        return years >= 16 && years < 25
      },
      { message: "Age must be between 16 and 25 years old." }
    ),
  gender: z
    .enum(["male", "female"], {
      message: "Gender must be male or female.",
    })
    .optional(),
  //photo: z.string().min(1, "Please upload a photo with required guidelines"),
})

// ── Step 2: Contact Information ──────────────────────────────────────────────

export const contactInfoSchema = z.object({
  addressLine1: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters."),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required."),
  district: z.string().trim().min(1, "District is required."),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits.")
    .regex(/^\+?[0-9\s\-()]{10,15}$/, "Enter a valid phone number."),
  whatsapp: z
    .string()
    .min(10, "WhatsApp number must be at least 10 digits.")
    .regex(/^\+?[0-9\s\-()]{10,15}$/, "Enter a valid WhatsApp number."),
  email: z.email("Enter a valid email address"),
})

// ── Step 3: Education ──────────────────────────────────────────────────────────

const EDUCATION_LEVEL_ENUM = QUALIFICATION_LEVELS.map((l) => l.value)
export const HIGHER_EDUCATION_LEVEL_ENUM = EDUCATION_LEVEL_ENUM.filter(
  (level) => level !== "secondary"
)
export const FIELD_OF_STUDY_ENUM = FIELDS_OF_STUDY.map((f) => f.value)

export const secondaryEducationSchema = z.object({
  qualification: z.enum(["secondary"], {
    message: "Education level is required.",
  }),
  schoolName: z.string().min(1, "School name is required."),
  schoolYear: z
    .int({
      message: "School year is required.",
    })
    .gte(FROM_YEAR)
    .lte(CURRENT_YEAR),
})

export const higherEducationSchema = z
  .object({
    qualification: z.enum(HIGHER_EDUCATION_LEVEL_ENUM, {
      message: "Education level is required.",
    }),
    fieldOfStudy: z.enum(FIELD_OF_STUDY_ENUM, {
      message: "Field of study is required.",
    }),
    institution: z.string().min(1, "Institution name is required."),
    startYear: z
      .int({
        message: "Start year is required.",
      })
      .gte(FROM_YEAR)
      .lte(CURRENT_YEAR),
    startMonth: z
      .int({
        message: "Start month is required.",
      })
      .gte(1)
      .lte(12),
    endYear: z
      .int({
        message: "End year is required.",
      })
      .gte(FROM_YEAR)
      .lte(CURRENT_YEAR + 10),
    endMonth: z
      .int({
        message: "End month is required.",
      })
      .gte(1)
      .lte(12),
  })
  .refine(
    (data) => {
      const { startYear, startMonth, endYear, endMonth } = data
      if (!startYear || !endYear) return true
      return startYear * 100 + startMonth <= endYear * 100 + endMonth
    },
    {
      message: "Start date must be on or before the end date.",
      path: ["endYear"],
    }
  )

export const educationSchema = z.discriminatedUnion(
  "qualification",
  [secondaryEducationSchema, higherEducationSchema],
  { message: "Education level/Programme is required." }
)

export const educationFormSchema = z.object({
  qualification: z.enum(EDUCATION_LEVEL_ENUM).or(z.literal("")),
  fieldOfStudy: z.enum(FIELD_OF_STUDY_ENUM).or(z.literal("")),
  schoolName: z.string(),
  schoolYear: z.number().nullable(),
  institution: z.string(),
  startYear: z.number().nullable(),
  startMonth: z.number().nullable(),
  endYear: z.number().nullable(),
  endMonth: z.number().nullable(),
})

export const educationUpdateSchema = z.object({
  qualification: z.enum(EDUCATION_LEVEL_ENUM).or(z.literal("")).optional(),
  fieldOfStudy: z.enum(FIELD_OF_STUDY_ENUM).or(z.literal("")).optional(),
  institution: z.string().optional(),
  startYear: z.number().optional(),
  startMonth: z.number().optional(),
  endYear: z.number().optional(),
  endMonth: z.number().optional(),
})

const EMPLOYMENT_TYPE = EMPLOYMENT_TYPES.map((e) => e.value)

export const experienceSchema = z
  .object({
    jobTitle: z.string().min(1, "Title is required."),
    employer: z.string().min(1, "Organization name is required."),
    location: z.string(),
    employmentType: z.enum(EMPLOYMENT_TYPE, {
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

export const experienceFormSchema = z.object({
  jobTitle: z.string(),
  employer: z.string(),
  location: z.string(),
  employmentType: z.enum(EMPLOYMENT_TYPE).or(z.literal("")),
  isCurrent: z.boolean(),
  startYear: z.number().nullable(),
  startMonth: z.number().nullable(),
  endYear: z.number().nullable(),
  endMonth: z.number().nullable(),
})

export const professionalQualificationSchema = z.object({
  educations: z.array(educationSchema),
  experience: z.array(experienceSchema),
  // legalDocuments: z
  //   .array(z.string())
  //   .min(1, "At least 1 legal document is required.")
  //   .max(3, "At most 3 legal documents are allowed."),
})

/**
 * Utility function to apply NIC verification and gender transformation
 * to schemas containing `nic` and `dateOfBirth`.
 */
export function withNicValidation<
  T extends z.ZodType<{
    nic: string
    dateOfBirth?: string
    [key: string]: any
  }>,
>(schema: T) {
  return schema
    .superRefine((data, ctx) => {
      if (data.dateOfBirth) {
        const result = nicToDob(data.nic)
        if (!result) {
          ctx.addIssue({
            code: "custom",
            message: "Please enter valid NIC.",
            path: ["nic"],
          })
          return
        }
        if (result.dob !== data.dateOfBirth) {
          ctx.addIssue({
            code: "custom",
            message:
              "Date of birth does not match with NIC. Please recheck NIC and Date of Birth.",
            path: ["dateOfBirth"],
          })
        }
      }
    })
    .transform((val, ctx) => {
      const result = nicToDob(val.nic)
      if (!result) {
        ctx.addIssue({
          code: "custom",
          message: "Please enter valid NIC.",
          path: ["nic"],
        })
        return z.NEVER
      }
      return { ...val, gender: result.gender }
    })
}

// ── Combined Schema ──────────────────────────────────────────────────────────

export const memberInputSchema = withNicValidation(
  personalInfoSchema
    .extend(contactInfoSchema.shape)
    .extend(professionalQualificationSchema.shape)
)

export const memberPersonalInformationUpdateSchema = withNicValidation(
  personalInfoSchema.extend(contactInfoSchema.omit({ email: true }).shape)
)

export type MemberPersonalInformationUpdateData = z.input<
  typeof memberPersonalInformationUpdateSchema
>

export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type ContactInfo = z.infer<typeof contactInfoSchema>
export type EducationInfo = z.infer<typeof educationSchema>
export type ExperienceInfo = z.infer<typeof experienceSchema>
export type ProfessionalQualificationInfo = z.infer<
  typeof professionalQualificationSchema
>
export type MemberInputData = z.input<typeof memberInputSchema>

export type EducationFormData = z.input<typeof educationFormSchema>
export type ExperienceFormData = z.input<typeof experienceFormSchema>

export type HigherEducationLevel = (typeof HIGHER_EDUCATION_LEVEL_ENUM)[number]
export type FieldOfStudy = (typeof FIELD_OF_STUDY_ENUM)[number]

export const memberPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string().min(8, "Please confirm the new password."),
    skipPasswordChecks: z.boolean(),
    signOutOfAllSessions: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.skipPasswordChecks) {
        return true
      }
      return Boolean(
        data.newPassword.match(/[a-z]/) &&
        data.newPassword.match(/[A-Z]/) &&
        data.newPassword.match(/[0-9]/) &&
        data.newPassword.match(/[^a-zA-Z0-9]/)
      )
    },
    {
      message:
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.",
      path: ["newPassword"],
    }
  )
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export type MemberPasswordData = z.infer<typeof memberPasswordSchema>

export const memberDeleteConfirmSchema = z.object({
  confirmText: z.literal("DELETE", {
    message: "Please type DELETE to confirm.",
  }),
})

export type MemberDeleteConfirmData = z.infer<typeof memberDeleteConfirmSchema>
