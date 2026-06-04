import { relations } from "drizzle-orm"
import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

import { invoices } from "./invoices-schema"
import { payments } from "./payments-schema"
import { plans } from "./subscription-plans-schema"
import { subscriptions, subscriptionStatus } from "./subscriptions-schema"

/**
 * Member lifecycle status.
 *
 * pending   → applied, awaiting admin review
 * approved  → admin approved, active member
 * rejected  → failed onboarding review (never became a member)
 * suspended → post-approval, temporary restriction (fixable, reversible)
 * banned    → post-approval, permanent removal
 *
 * Transitions:
 *   pending → approved | rejected
 *   approved → suspended | banned
 *   suspended → approved (reinstated)
 */
export const memberStatus = pgEnum("member_status", [
  "pending",
  "approved",
  "rejected",
  "suspended",
  "banned",
])

export const gender = pgEnum("gender", ["male", "female"])

export const employmentType = pgEnum("employment_type", [
  "full_time",
  "part_time",
  "contract",
  "temporary",
  "internship",
  "self_employed",
])

// =============================================================================
// TABLE 1 — members
// Owns identity + a denormalized subscription snapshot for fast reads.
// Source of truth for subscription state is the subscriptions table.
// Source of truth for status history is the memberStatusHistory table.
// Always update snapshot fields when subscription or status changes.
// =============================================================================

export const members = pgTable("members", {
  id: text("id").primaryKey(),

  // --- identity ---
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  dateOfBirth: date("date_of_birth").notNull(),
  nic: text("nic").notNull().unique(),
  gender: gender("gender").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: text("city").notNull(),
  district: text("district").notNull(),
  photo: text("photo"),
  remarks: text("remarks"),
  membershipStatus: memberStatus("membership_status")
    .default("pending")
    .notNull(),
  memberSince: timestamp("member_since").defaultNow().notNull(),

  // --- suspension ---
  // nullable — only set when membershipStatus = "suspended"
  // cron checks daily: if suspendedUntil <= now() → auto reinstate → write history row
  suspendedUntil: timestamp("suspended_until"),

  // --- subscription snapshot (denormalized for fast reads) ---
  // NOT the source of truth — subscriptions table is.
  // Update these whenever subscription state changes.
  currentPlanId: text("current_plan_id").references(() => plans.id),
  subscriptionStatus: subscriptionStatus("subscription_status"),
  subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export type Member = typeof members.$inferSelect
export type MemberCreate = typeof members.$inferInsert

// =============================================================================
// TABLE 2 — memberStatusHistory
// Immutable audit trail of every membershipStatus change.
// Never update rows — only insert.
//
// actionedBy is either:
//   - an admin user id (string) for human-initiated changes
//   - the literal string "system" for cron/automated changes
//
// Every membershipStatus transition on the members table MUST write a row here.
// Transitions to record:
//   pending   → approved       (admin approves application)
//   pending   → rejected       (admin rejects application)
//   approved  → suspended      (admin suspends member)
//   suspended → approved       (admin reinstates OR cron auto-reinstates)
//   approved  → banned         (admin bans member)
//   suspended → banned         (admin escalates suspension to ban)
// =============================================================================

export const memberStatusHistory = pgTable("member_status_history", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id),

  // what changed
  fromStatus: memberStatus("from_status").notNull(),
  toStatus: memberStatus("to_status").notNull(),

  // why and who
  reason: text("reason").notNull(), // required — must always document why
  note: text("note"), // optional extended note
  actionedBy: text("actioned_by").notNull(), // admin user id OR "system"

  // no updatedAt — history rows are immutable once written
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// =============================================================================
// TABLE 3 — memberEducation
// One row per education entry per member.
// Structured for filtering/search — e.g. find all Hotel Management graduates.
// isVerified allows admin to mark credentials as confirmed.
// =============================================================================

export const memberEducation = pgTable("member_education", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id),
  institution: text("institution").notNull(), // "School name", "SLITHM", "CINEC", "UOC"
  qualification: text("qualification").notNull(), // "Secondary", "Diploma", "Certificate", "Bachelor's Degree"
  fieldOfStudy: text("field_of_study"), // "Hotel Management", "Culinary Arts"
  startYear: integer("start_year"),
  startMonth: integer("start_month"),
  endYear: integer("end_year"),
  endMonth: integer("end_month"), // nullable = currently studying
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// =============================================================================
// TABLE 4 — memberProfession
// One row per job/role per member.
// Structured for filtering/search — e.g. find all Executive Chefs,
// members currently at Galle Face Hotel, members in F&B department.
// isCurrent flags the active role (endDate should be null when isCurrent = true).
// =============================================================================

export const memberProfession = pgTable("member_profession", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id),
  jobTitle: text("job_title").notNull(), // "Executive Chef", "Front Desk Manager"
  employer: text("employer").notNull(), // "Galle Face Hotel", "Cinnamon Grand"
  location: text("location"),
  employmentType: employmentType("employment_type").notNull(),
  startYear: integer("start_year").notNull(),
  startMonth: integer("start_month").notNull(),
  endYear: integer("end_year"), // nullable = current job
  endMonth: integer("end_month"), // nullable = current job
  isCurrent: boolean("is_current").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// =============================================================================
// RELATIONS
// =============================================================================

export const membersRelations = relations(members, ({ one, many }) => ({
  currentPlan: one(plans, {
    fields: [members.currentPlanId],
    references: [plans.id],
  }),
  statusHistory: many(memberStatusHistory),
  education: many(memberEducation),
  profession: many(memberProfession),
  subscriptions: many(subscriptions),
  invoices: many(invoices),
  payments: many(payments),
}))

export const memberStatusHistoryRelations = relations(
  memberStatusHistory,
  ({ one }) => ({
    member: one(members, {
      fields: [memberStatusHistory.memberId],
      references: [members.id],
    }),
  })
)

export const memberEducationRelations = relations(
  memberEducation,
  ({ one }) => ({
    member: one(members, {
      fields: [memberEducation.memberId],
      references: [members.id],
    }),
  })
)

export const memberProfessionRelations = relations(
  memberProfession,
  ({ one }) => ({
    member: one(members, {
      fields: [memberProfession.memberId],
      references: [members.id],
    }),
  })
)
