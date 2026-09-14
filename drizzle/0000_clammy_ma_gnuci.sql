CREATE TABLE "brand_waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"website" text,
	"industry" text,
	"inventory_type" text,
	"budget_range" text,
	"campaign_timing" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seller_waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"x_handle" text,
	"location" text,
	"asset_type" text,
	"price_expectation" text,
	"audience_reach" text,
	"event_context" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
