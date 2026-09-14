# Current State

**Last updated**: 2026-09-14

## Stage

Foundation + public surface

## What exists

- Next.js 16 + TypeScript + Tailwind v4 + App Router project
- Folder structure for app, lib, components, docs
- `AGENTS.md` as single source of truth
- ADR-001 (foundation stack and scope) and ADR-002 (landing page + waitlist)
- Drizzle config wired to Supabase Postgres
- **Public landing page at `/`** — value proposition, how it works, an honest
  statement of the current stage, and both audience CTAs
- **Seller waitlist at `/waitlist/seller`** and **brand waitlist at
  `/waitlist/brand`**, both persisting to the database
- `POST /api/waitlist` — validates with Zod and stores submissions
- First migration applied: `seller_waitlist` and `brand_waitlist` tables
- Design system documented in `docs/design/design-system.md`
- `robots.txt` and `sitemap.xml`
- No authentication yet
- No domain schema yet (the waitlist tables are deliberately outside the domain
  model)
- No automated test suite yet

## What is intentionally not built

- Auth
- Asset templates
- Listings
- Payments
- Shareable pages
- Any marketplace functionality
- Any dashboard

## Current constraints

- Invite-only
- Only MacBook + Jersey/T-shirt will be exposed when we start the domain
- Flat templates only (no 3D)
- Managed Supabase Postgres
- Cloudflare R2 for storage
- The public site carries no invented social proof — no placeholder logos,
  testimonials or metrics until there are real ones

## Known gaps

- No test runner is installed, so changes are verified by lint, typecheck, build
  and a manual browser pass
- Waitlist submissions are not emailed or notified anywhere; they have to be read
  out of the database (`pnpm db:studio`)
- No rate limiting on `POST /api/waitlist` beyond a honeypot field

## Next priorities

1. Better Auth skeleton
2. Domain schema for the narrow invite-only flow
3. Notification (Resend) when a waitlist submission arrives
4. A test runner and first tests around the waitlist validation
