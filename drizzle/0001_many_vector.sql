ALTER TABLE "brand_waitlist" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "seller_waitlist" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL PRIVILEGES ON TABLE "brand_waitlist", "seller_waitlist" FROM "anon", "authenticated";
