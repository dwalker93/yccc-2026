import * as z from "zod"

import { calculateAge } from "@workspace/shared/utils/age-calculator"
import { nicToDob } from "@workspace/shared/utils/nic-to-dob"

import { MONTHS } from "../constants/dates"
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

const MONTH_ENUM = MONTHS.map((m) => m.value)
const EDUCATION_LEVEL_ENUM = QUALIFICATION_LEVELS.map((l) => l.value)
const HIGHER_EDUCATION_LEVEL_ENUM = EDUCATION_LEVEL_ENUM.filter(
  (level) => level !== "secondary"
)
const FIELD_OF_STUDY_ENUM = FIELDS_OF_STUDY.map((f) => f.value)

export const secondaryEducationSchema = z.object({
  educationLevel: z.enum(["secondary"], {
    message: "Education level is required.",
  }),
  schoolName: z.string().min(1, "School name is required."),
  schoolYear: z.string().regex(/^\d{4}$/, "School year is required."),
})

const higherEducationSchema = z
  .object({
    educationLevel: z.enum(HIGHER_EDUCATION_LEVEL_ENUM, {
      message: "Education level is required.",
    }),
    fieldOfStudy: z.enum(FIELD_OF_STUDY_ENUM, {
      message: "Field of study is required.",
    }),
    institutionName: z.string().min(1, "Institution name is required."),
    fromYear: z.string().regex(/^\d{4}$/, "From year is required."),
    fromMonth: z.enum(MONTH_ENUM, { message: "From month is required." }),
    toYear: z.string().regex(/^\d{4}$/, "To year is required."),
    toMonth: z.enum(MONTH_ENUM, { message: "To month is required." }),
  })
  .refine(
    (data) => {
      const { fromYear, fromMonth, toYear, toMonth } = data
      if (!fromYear || !toYear) return true
      const from = parseInt(fromYear) * 100 + parseInt(fromMonth ?? "0")
      const to = parseInt(toYear) * 100 + parseInt(toMonth ?? "12")
      return from <= to
    },
    {
      message: "Start date must be on or before the end date.",
      path: ["toYear"],
    }
  )

export const educationSchema = z.discriminatedUnion(
  "educationLevel",
  [secondaryEducationSchema, higherEducationSchema],
  { message: "Education level/Programme is required." }
)

export const educationFormSchema = z.object({
  educationLevel: z.enum(EDUCATION_LEVEL_ENUM).or(z.literal("")),
  fieldOfStudy: z.enum(FIELD_OF_STUDY_ENUM).or(z.literal("")),
  schoolName: z.string(),
  schoolYear: z.string(),
  institutionName: z.string(),
  fromYear: z.string(),
  fromMonth: z.string(),
  toYear: z.string(),
  toMonth: z.string(),
})

const EMPLOYMENT_TYPE = EMPLOYMENT_TYPES.map((e) => e.value)

export const experienceSchema = z
  .object({
    title: z.string().min(1, "Title is required."),
    organizationName: z.string().min(1, "Organization name is required."),
    location: z.string(),
    employmentType: z.enum(EMPLOYMENT_TYPE, {
      message: "Employment type is required.",
    }),
    currentlyWorking: z.boolean(),
    fromYear: z.string().regex(/^\d{4}$/, "From year is required."),
    fromMonth: z.enum(MONTH_ENUM, { message: "From month is required." }),
    toYear: z.string(),
    toMonth: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.currentlyWorking) {
      if (!data.toYear || !/^\d{4}$/.test(data.toYear)) {
        ctx.addIssue({
          code: "custom",
          message: "To year is required.",
          path: ["toYear"],
        })
      }
      if (!data.toMonth || !/^\d{2}$/.test(data.toMonth)) {
        ctx.addIssue({
          code: "custom",
          message: "To month is required.",
          path: ["toMonth"],
        })
      }
    }
  })
  .refine(
    (data) => {
      if (!data.currentlyWorking && data.fromYear && data.toYear) {
        const from =
          parseInt(data.fromYear) * 100 + parseInt(data.fromMonth ?? "0")
        const to = parseInt(data.toYear) * 100 + parseInt(data.toMonth ?? "12")
        return from <= to
      } else return true
    },
    {
      message: "Start date must be on or before the end date.",
      path: ["toYear"],
    }
  )

export const professionalQualificationSchema = z.object({
  educations: z
    .array(educationSchema)
    .min(1, "At least 1 education details required."),
  experience: z.array(experienceSchema),
  // legalDocuments: z
  //   .array(z.string())
  //   .min(1, "At least 1 legal document is required.")
  //   .max(3, "At most 3 legal documents are allowed."),
})

// ── Combined Schema ──────────────────────────────────────────────────────────

export const memberInputSchema = personalInfoSchema
  .merge(contactInfoSchema)
  .merge(professionalQualificationSchema)
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

export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type ContactInfo = z.infer<typeof contactInfoSchema>
export type EducationInfo = z.infer<typeof educationSchema>
export type ExperienceInfo = z.infer<typeof experienceSchema>
export type ProfessionalQualificationInfo = z.infer<
  typeof professionalQualificationSchema
>
export type MemberInputData = z.input<typeof memberInputSchema>

export type EducationFormData = z.input<typeof educationFormSchema>
