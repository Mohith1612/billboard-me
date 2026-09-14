# Current state and implementation audit

**Audited:** 2026-09-14. **Source baseline:** `41949fe`, merge of [PR #2](https://github.com/Mohith1612/billboard-me/pull/2), completing [issue #1](https://github.com/Mohith1612/billboard-me/issues/1). **Stage 0:** landing page and persisted lead capture. The master-plan PR changes documentation only; it does not advance the product to authentication, listings or payments.

The [PRD](../product/prd.md), [roadmap](roadmap.md) and [GitHub backlog](backlog.md) are intended work. An empty folder, architecture preference, generated SQL file or proposed ADR does not establish working functionality.

## Audit method and limits

Read AGENTS.md, CLAUDE.md, README, every tracked documentation file, all application/library/component source, schema, SQL and Drizzle snapshot/journal, package/lock/config files, environment example and relevant Git history/issue/PR evidence. Inspected empty local directories and tracked zero-byte files. Checked GitHub issues, PRs, workflow/deployment records. Read installed Next.js docs and current official provider/platform documentation for proposed decisions.

Ran existing lint, typecheck and production build: **all passed** on Node 22.14.0 and pnpm 10.15.1. No automated unit/integration/browser test runner or test script exists. No new browser session, live DB query, migration application, provider transaction, auth/upload integration or deployed-runtime test was performed in this documentation task. A successful build does not prove live database access or deployment. Existing `.env.local` was loaded by Next's build; its contents were not printed or used to run migrations/queries.

PR #2 records a prior manual desktop/mobile browser pass and inserts into the development Supabase database with test rows removed. That is historical evidence, not a newly rerun integration test. Its migration-application report does not establish production state.

## Implementation audit

Completeness labels: **implemented** = concrete working source within stated scope; **partially implemented** = some required behavior exists; **scaffolded** = structure only; **documented only** = described but no code; **missing** = absent; **contradictory** = source/docs/product disagree; **questionable** = unsupported assumption or needs runtime evidence. Multiple labels can apply; no invented percentage scores.

| Area | Intended | Actually implemented | Completeness | Notes / evidence |
| --- | --- | --- | --- | --- |
| Landing page | Truthful invite-only recruitment | `/` composes hero, ticker, premise, steps, stage and seller/brand CTAs | Implemented; contradictory copy | `src/app/(marketing)/page.tsx`; no real listings; see claims below |
| Seller waitlist | Capture relevant potential sellers | Required name/email plus optional handle/location/type/price/audience/context | Implemented for lead capture | `seller-form.tsx`, shared Zod schema; Jersey/T-shirt separate form answers; Other research answer |
| Brand waitlist | Capture budget/context interest | Company/contact required; website/industry/inventory/budget/timing optional | Implemented for lead capture | `brand-form.tsx`; website is length-checked text, not validated URL; not rendered as a link today |
| Waitlist API | Validate and store leads | One POST route: JSON 400, validation 422, honeypot discard 202, stored 201, caught DB error 500 | Implemented; partial hardening | `src/app/api/waitlist/route.ts`; no GET/read endpoint, auth, body limit or rate limit |
| Form UX | Clear validation and retry | Shared hook, field labels/errors, required invalid focus, pending/disabled, network/server messages and success focus | Implemented; partial progressive enhancement | JS fetch required; no server form fallback; server field-error path does not refocus first invalid field |
| Database client/config | Managed Supabase Postgres through Drizzle | `postgres()` + Drizzle, module-level client, `prepare:false`, DATABASE_URL non-null assertion; CLI reads `.env.local` | Partially implemented | `src/lib/db/index.ts`, `drizzle.config.ts`; runtime/role/pool/TLS unverified |
| Lead schema | Persist seller and brand leads outside domain | Two tables, UUID, text qualifiers, required contact/name, created_at | Implemented | `src/lib/db/schema.ts`; no FK/index beyond PK, email uniqueness, dedupe, status or notifications |
| Migrations | Reproducible incremental schema | One SQL migration with matching journal/snapshot | Implemented artifact; application unverified here | `0000_clammy_ma_gnuci.sql`; PR #2 reports dev application; never edit it |
| Data access isolation | Private PII and least privilege | No RLS/grants in migration; snapshot marks RLS false; no browser DB client | Missing control; questionable live exposure | Actual exposure depends on Supabase schema/grants; FOUNDATION-001 tests and closes gap |
| Environment | Explicit per-environment required config | `.env.example` has site URL/DB and unused Supabase public/service keys; R2 commented | Partial; contradictory requirements | Only DATABASE_URL and NEXT_PUBLIC_SITE_URL used by app; localhost fallback; no validated config module |
| Authentication | Better Auth email identity | No package/schema/route/session code | Scaffolded; documented only | Empty `src/lib/auth`, `(auth)`; no auth protection |
| Seller approval/profile | Founder invitation and owner-managed inventory | Manual recruiting described; no invitation/profile/approval product | Missing | Waitlist submission is not a user or seller account |
| Canonical asset visuals | Template-driven sellable regions | Two annotated SVG marketing drawings; local coordinate constants | Partially implemented presentation only | `asset-plates.tsx`; lid/chest each one spot; no registry, template version, selectable regions or asset renderer contract |
| Assets/surfaces/spots | Generic owned inventory | No schema/operations/types | Scaffolded; documented only | Empty `src/lib/assets`; marketing local `Spot` type is presentation, not domain |
| Distribution model | Digital and physical contextual signals | Optional waitlist audience/context strings only | Partially implemented research capture | No claims/provenance/public page schema; never validated reach |
| Listings/availability | Fixed price and bookable dates | No code or tables | Missing | Marketing descriptions are not listing functionality |
| Sponsorship pages | Shareable seller opportunity | No dynamic seller/page route | Missing | Only landing/two waitlists are public pages |
| Offers/orders/reservations | Agreed terms and exclusive allocation | No code or schema | Missing | No concurrency protection needed/implemented for nonexistent orders |
| Payments/KYC/fees | One approved provider marketplace flow | No dependency/config/API/integration | Scaffolded; documented only | Empty `src/lib/payments`; Route candidate not approved; research identifies eligibility risk |
| Campaigns/proof/payouts | Executed campaigns with approved evidence and bank receipt | No schema/files/operations | Missing | Marketing copy promises future behavior; no campaign completion evidence in repo |
| Object storage/Sharp | Private proof/creative processing | No R2/Supabase Storage client or upload routes; no Sharp pipeline | Scaffolded; documented only | `src/lib/storage` empty; sharp transitive lock entry/ignored build script is not implementation |
| Email/notifications | Sign-in and transaction communication | Contact mailto link only | Missing | No Resend; leads read manually via database tools |
| Analytics/error tracking | Funnel and operational visibility | Console error on failed waitlist insert; no SDK/event/reporting | Partial error log only | No PostHog/Sentry; raw error logging should be reviewed for sensitivity |
| UI/design system | Cohesive accessible application | Tailwind v4 tokens, CSS controls, two next/font families, marketing/waitlist components | Implemented marketing; app UI scaffolded | No shadcn/Radix dependency; `components/ui` empty |
| Motion/accessibility | Mobile/keyboard/reduced-motion | Skip link, labels, focus styling, SVG aria labels, CSS reduced-motion and noscript reveal fallback | Partially verified | Source inspected, historical browser pass only; no formal accessibility audit in this task |
| SEO/sharing | Canonical and social previews | Metadata, robots, sitemap for three pages | Partially implemented | Large Twitter card declared without image; no share image; localhost fallback risk; sitemap timestamp regenerated |
| Testing | Repeatable behavior/migration/browser checks | Lint/typecheck/build scripts only | Missing automated tests | No Vitest/Playwright/test files; no test command; test docs initially empty |
| CI/release/deployment | Automated PR checks and practical host | Empty Next config; no .github workflows, Wrangler/OpenNext config | Documented only; questionable host assumptions | GitHub workflows/deployments count 0; externally configured hosting not inspected |
| Agent docs/workflow | One rule source, issue/PR discipline | AGENTS, CLAUDE pointer, README, workflow, two accepted ADRs | Implemented docs; partial coverage | Workflow protections described, branch-protection settings not verified |
| Product/architecture/status docs | Executable product blueprint | Before this PR, 15 tracked Markdown files were zero-byte; substantial design/setup/ADRs existed | Scaffolded before this PR | This PR supplies blueprint and consolidates empty duplicates; no product capability implied |

## Important contradictions and unsupported claims

- `hero.tsx`: “No fees while we're invite-only” conflicts with introducing a take rate without a waiver/transition decision. Future agents must not deduct 15% by default.
- `how-it-works.tsx`: platform handles decal/printing/delivery and proof releases payout. Fulfillment costs, provider capability and settlement schedule are unverified.
- `hero.tsx`, `where-we-are.tsx`, ticker aria label and plate annotations describe surfaces as live/supported/open for rent despite no inventory. `premise.tsx` claims the laptop is the most-looked-at café surface without evidence. These are copy issues, not measured traction.
- `asset-plates.tsx`: viewBox rectangle width/height printed as MM, with no physical sizing relationship. Do not derive manufacture from those labels.
- README/architecture formerly listed R2/shadcn as though present. They are plans; this documentation PR clarifies the distinction.
- Existing status called migration “applied” without naming environment. This audit attributes the report to PR #2's development database only.
- AGENTS' current public scope is landing/waitlist. Future approved sponsorship pages require a deliberate stage transition; a roadmap does not mean those routes already exist or authorize public seller publishing.

See [known issues](known-issues.md) for ownership and [PRD concerns](../product/prd.md#concerns-and-decisions) for product experiments rather than turning every assumption into code.

## Structure and history

Local empty directories: `src/types`, `src/utils`, `src/lib/{auth,storage,assets,payments}`, `src/components/ui`, `src/app/(auth)`, `src/app/(dashboard)`. Empty directories are not tracked by Git and may not exist in a fresh clone. No hidden implementation was found in them.

Before this PR, empty docs were all five product files; architecture application/assets/authentication/database/deployment/payments; development branching/testing; status roadmap/known-issues. Their paths were scaffold, not specifications. Empty `docs/decisions/.gitkeep` is harmless scaffolding.

Git history shows foundation scaffolding (`c74f4c3`), canonical AGENTS/workflow/docs (`48057c6`, `75ab3e9`, `ab2abad`), connection configuration (`e473cfb`), migration-command/meta tracking correction (`489e6a8`), waitlist schema (`622b040`), design (`71cdc27`), landing (`a164ee7`), forms (`6ed190d`), documentation (`83c9fa7`), then human merge PR #2 (`41949fe`). Do not recreate the already-fixed `db:migrate` typo or ignored Drizzle metadata as new work.

## Next action

Exactly one first implementation issue: **FOUNDATION-001 — Enforce server-only waitlist data access**, linked in [backlog](backlog.md). It protects existing lead data before expanding identity/domain tables. Then FOUNDATION-002 makes configuration explicit and FOUNDATION-003/004 make tests/CI repeatable. Founder demand, production and payment-eligibility investigations can proceed independently.

No evidence in this audit establishes any completed real campaign. Planning outputs and open issues are not shipped features; founder review and merge of this documentation PR remain required.
