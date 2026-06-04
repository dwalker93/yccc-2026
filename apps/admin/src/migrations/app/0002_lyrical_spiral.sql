ALTER TYPE "public"."subscription_status" ADD VALUE 'inactive' BEFORE 'scheduled';--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "date_of_birth" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "subscription_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "period_start" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "period_end" DROP NOT NULL;