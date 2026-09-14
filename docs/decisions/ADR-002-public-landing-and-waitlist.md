# ADR-002: Public Landing Page and Waitlist Capture

**Date**: 2026-09-14
**Status**: Accepted
**Issue**: [#1](https://github.com/Mohith1612/billboard-me/issues/1)

## Context

Billboard.me needs a public surface. Per ADR-001 and AGENTS.md §1 that surface is
*only* a landing page plus two waitlist forms — one for people who want to sell
space, one for brands. Everything else (auth, listings, browse, payments) is out
of scope.

Before this change the repository had no `(marketing)` route group at all, despite
`docs/architecture/overview.md` describing one, and `/` still served the
`create-next-app` starter page.

Three questions needed deciding.

## Decision

### 1. Dedicated routes, not modals

`/waitlist/seller` and `/waitlist/brand` are real pages inside the `(marketing)`
route group, rather than dialogs on `/`.

They are linkable and shareable, which matters when the founder is recruiting by
hand and wants to send one person straight to the right form. They are also far
easier to make accessible than a modal, and they keep `/` uncluttered — a
requirement in the issue.

### 2. Waitlist submissions are stored, in two tables outside the domain model

The issue marked storage optional. We store anyway: a waitlist that discards
leads is worthless to a high-touch, founder-led recruiting process, and the
company's success metric is closed paid campaigns, which starts with knowing who
asked.

- `seller_waitlist` and `brand_waitlist`, one per audience. The two field sets
  barely overlap and the follow-up workflows differ, so a single table with a
  discriminator column would have been mostly nulls.
- These tables sit **outside** the canonical `User → Asset → Surface → Spot →
  Listing` model in AGENTS.md §4. Nothing here is a real asset or listing. When
  the real domain schema arrives it should not inherit anything from these.
- `asset_type` and `inventory_type` are plain `text`, **not** Postgres enums, so
  the schema never hard-codes the asset categories the UI happens to show today
  (AGENTS.md §2).
- Validation is one set of Zod schemas in `src/lib/waitlist/schema.ts`, imported
  by both the browser forms and `POST /api/waitlist`, so a submission is judged
  by identical rules on both sides.
- Spam protection is a single off-screen honeypot field. A filled honeypot is
  answered with `202` and discarded, so bots get no signal that they were caught.
  No rate limiting yet; revisit if the forms actually get abused.

### 3. No new runtime dependencies

The UI is built with Tailwind v4 design tokens, plain CSS animation, and two
`next/font` families. Specifically we did **not** add:

- **shadcn/ui** — it remains the plan for real application UI (ADR-001), but a
  landing page and four control types do not justify pulling in Radix and its
  helpers yet.
- **Framer Motion / GSAP / Lenis** — all motion here is CSS keyframes plus one
  ~30-line `IntersectionObserver` component. An animation runtime for a
  six-section marketing page fails the AGENTS.md §2 dependency test.

## Consequences

- `pnpm db:migrate` must be run before submissions persist. The first migration
  is `drizzle/0000_clammy_ma_gnuci.sql`.
- `drizzle/meta` is now committed. It was previously git-ignored, which would
  have made every later `db:generate` re-emit the whole schema as a new migration
  instead of a diff.
- The landing page ships **no invented social proof** — no placeholder logos, no
  fake testimonials, no made-up metrics. Instead a "Where we actually are"
  section states the invite-only stage plainly. This is a product position, not
  only a design choice: overstating traction to sellers we then recruit by hand
  would poison the first real conversations.
- The art direction is documented in `docs/design/design-system.md` so later work
  extends it rather than drifting from it.
- There is still no automated test suite in the repo, so this change was verified
  with lint, typecheck, build, and a manual browser pass (see the PR test plan).
  Adding a test runner is deliberately left as separate work.

## Alternatives considered

- **Modal forms on `/`** — rejected; not linkable, worse on mobile, harder to
  make accessible.
- **One `waitlist_submissions` table with a `jsonb` payload** — rejected; the
  founder reads these rows by hand, and explicit columns beat JSON blobs for that.
- **No persistence at all (log the submission)** — rejected; see decision 2.
- **Server Actions instead of a route handler** — a route handler was chosen
  because the same endpoint is trivially exercisable with `curl` and keeps the
  client/server validation boundary explicit.
