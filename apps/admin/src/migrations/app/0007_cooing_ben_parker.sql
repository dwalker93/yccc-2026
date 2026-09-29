ALTER TABLE "members" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "created_by_type" "actor_type" DEFAULT 'member' NOT NULL;