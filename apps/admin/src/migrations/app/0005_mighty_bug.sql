CREATE TYPE "public"."actor_type" AS ENUM('member', 'admin', 'system');--> statement-breakpoint
CREATE TYPE "public"."field_of_study" AS ENUM('operational_management', 'food_beverage_service', 'business_marketing', 'culinary_arts', 'pastry_bakery', 'international_cookery', 'hospitality_management', 'tourism_event_management', 'other');--> statement-breakpoint
CREATE TYPE "public"."qualification" AS ENUM('secondary', 'vocational', 'diploma', 'bachelors', 'postgrad_diploma', 'masters', 'doctorate');--> statement-breakpoint
ALTER TABLE "member_education" ALTER COLUMN "qualification" SET DATA TYPE "public"."qualification" USING "qualification"::"public"."qualification";--> statement-breakpoint
ALTER TABLE "member_education" ALTER COLUMN "field_of_study" SET DATA TYPE "public"."field_of_study" USING "field_of_study"::"public"."field_of_study";--> statement-breakpoint
ALTER TABLE "member_education" ALTER COLUMN "field_of_study" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "member_education" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "member_education" ADD COLUMN "created_by_type" "actor_type" DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "member_profession" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "member_profession" ADD COLUMN "created_by_type" "actor_type" DEFAULT 'member' NOT NULL;