ALTER TABLE "member_education" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "member_education" ADD COLUMN "verified_by" text;--> statement-breakpoint
ALTER TABLE "member_profession" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "member_profession" ADD COLUMN "verified_by" text;