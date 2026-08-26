ALTER TABLE "member_education" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "member_education" ADD COLUMN "verified_by" text;--> statement-breakpoint
ALTER TABLE "member_profession" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "member_profession" ADD COLUMN "verified_by" text;--> statement-breakpoint
CREATE INDEX "member_education_member_id_idx" ON "member_education" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "member_profession_member_id_idx" ON "member_profession" USING btree ("member_id");