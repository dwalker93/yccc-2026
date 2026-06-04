CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'contract', 'temporary', 'internship', 'self_employed');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('pending', 'approved', 'rejected', 'suspended', 'banned');--> statement-breakpoint
CREATE TYPE "public"."billing_interval" AS ENUM('monthly', 'annual', 'lifetime');--> statement-breakpoint
CREATE TYPE "public"."payment_category" AS ENUM('CARD', 'MOBILE', 'WALLET', 'BANKING', 'CASH', 'FREE');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'scheduled', 'cancelled', 'expired', 'past_due', 'paused');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('open', 'paid', 'void', 'uncollectible');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'success', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "member_education" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"institution" text NOT NULL,
	"qualification" text NOT NULL,
	"field_of_study" text,
	"start_year" integer,
	"start_month" integer,
	"end_year" integer,
	"end_month" integer,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_profession" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"job_title" text NOT NULL,
	"employer" text NOT NULL,
	"location" text,
	"employment_type" "employment_type" NOT NULL,
	"start_year" integer NOT NULL,
	"start_month" integer NOT NULL,
	"end_year" integer,
	"end_month" integer,
	"is_current" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"from_status" "member_status" NOT NULL,
	"to_status" "member_status" NOT NULL,
	"reason" text NOT NULL,
	"note" text,
	"actioned_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'LKR' NOT NULL,
	"interval" "billing_interval" NOT NULL,
	"interval_count" integer DEFAULT 1 NOT NULL,
	"trial_days" integer DEFAULT 0 NOT NULL,
	"features" json,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" "payment_category" NOT NULL,
	"processing_fee_percent" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"previous_subscription_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"subscription_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"invoice_status" "invoice_status" DEFAULT 'open' NOT NULL,
	"subtotal" integer NOT NULL,
	"discount_amount" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"amount_paid" integer DEFAULT 0 NOT NULL,
	"amount_due" integer NOT NULL,
	"currency" text DEFAULT 'LKR' NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"due_at" timestamp,
	"paid_at" timestamp,
	"voided_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"member_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'LKR' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_method_id" text NOT NULL,
	"gateway_id" text,
	"gateway_response" json,
	"paid_at" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" text PRIMARY KEY NOT NULL,
	"payment_id" text NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"gateway_refund_id" text,
	"refunded_at" timestamp NOT NULL,
	"actioned_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "metadata" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "metadata" CASCADE;--> statement-breakpoint
ALTER TABLE "member" RENAME TO "members";--> statement-breakpoint
ALTER TABLE "members" DROP CONSTRAINT "member_email_unique";--> statement-breakpoint
ALTER TABLE "members" DROP CONSTRAINT "member_nic_unique";--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "member_since" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "suspended_until" timestamp;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "current_plan_id" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "subscription_status" "subscription_status";--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "subscription_current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "member_education" ADD CONSTRAINT "member_education_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_profession" ADD CONSTRAINT "member_profession_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_status_history" ADD CONSTRAINT "member_status_history_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_current_plan_id_plans_id_fk" FOREIGN KEY ("current_plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "education";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "profession";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "membership_start_date";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "current_subscription_plan";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "subscribed_at";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "subscription_expiry_date";--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_nic_unique" UNIQUE("nic");