# Current state and implementation audit

**Rechecked:** 2026-09-15. **Source baseline:** `280e60c`, after [PR #54](https://github.com/Mohith1612/billboard-me/pull/54), [PR #53](https://github.com/Mohith1612/billboard-me/pull/53) and planning [PR #52](https://github.com/Mohith1612/billboard-me/pull/52). **Stage 0:** landing page and persisted lead capture. FOUNDATION-001 [issue #4](https://github.com/Mohith1612/billboard-me/issues/4) protects the repository's waitlist data path, FOUNDATION-002 [issue #5](https://github.com/Mohith1612/billboard-me/issues/5) makes its configuration explicit, and FOUNDATION-003 [issue #6](https://github.com/Mohith1612/billboard-me/issues/6) adds the behavior suite that keeps both honest; deployment remains unverified. This does not advance the product to authentication, listings or payments.

The [PRD](../product/prd.md), [roadmap](roadmap.md) and [GitHub backlog](backlog.md) are intended work. An empty folder, architecture preference, generated SQL file or proposed ADR does not establish working functionality.

## Audit method and limits

Read AGENTS.md, CLAUDE.md, README, every tracked documentation file, all application/library/component source, schema, SQL and Drizzle snapshot/journal, package/lock/config files, environment example and relevant Git history/issue/PR evidence. Inspected empty local directories and tracked zero-byte files. Checked GitHub issues, PRs, workflow/deployment records. Read installed Next.js docs and current official provider/platform documentation for proposed decisions.

The planning audit ran lint, typecheck and production build successfully on Node 22.14.0 and pnpm 10.15.1. FOUNDATION-001 additionally runs negative client-import builds and disposable PostgreSQL fresh/upgrade/route checks. FOUNDATION-002 adds `pnpm test:env`, which builds and serves a disposable copy of the app carrying no `.env*` file of its own. FOUNDATION-003 adds `pnpm test`: 89 Vitest cases across a database-free `unit` project and an `integration` project run against a disposable PostgreSQL 16 container that is created and removed by the command. No production database, shared development database, provider, auth/upload integration or deployed runtime was tested. Successful local checks do not prove live database access or deployment. Existing `.env.local` contents were not printed, and are read by the test harness only so it can refuse to run against the database named there.

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
| Database client/config | Managed Supabase Postgres through Drizzle | `postgres()` + Drizzle behind `getDb()`, created on first use, `prepare:false`, `server-only`, validated DATABASE_URL, with `closeDb()` for test teardown; CLI reads `.env.local` and prefers DATABASE_MIGRATION_URL | Implemented for the repository; deployment unverified | Client imports fail at build time; a build needs no database, a missing/malformed URL fails at the first query naming the variable; runtime/role/pool/TLS still unverified |
| Lead schema | Persist seller and brand leads outside domain | Two tables, UUID, text qualifiers, required contact/name, created_at | Implemented | `src/lib/db/schema.ts`; no FK/index beyond PK, email uniqueness, dedupe, status or notifications |
| Migrations | Reproducible incremental schema | 0000 creates both waitlists; 0001 enables RLS and revokes client roles; matching journal/snapshots | Implemented artifacts; deployed application unverified | Fresh and 0000→0001 paths pass in disposable PostgreSQL; never edit applied migrations |
| Data access isolation | Private PII and least privilege | RLS enabled; no client policies; all table privileges revoked from `anon`/`authenticated`; DB module marked server-only | Implemented in repository; deployed state unverified | Disposable role assertions and real POST-route persistence pass; actual Supabase schema/grants/runtime role still require operator verification |
| Environment | Explicit per-environment required config | `src/lib/env/{public,server,database-url}.ts` validate the two variables the app reads; `.env.example` lists only those plus optional DATABASE_MIGRATION_URL | Implemented | Production build rejects a missing/invalid canonical origin; localhost fallback is development/test only; unused Supabase and R2 entries removed; see [ADR-004](../decisions/ADR-004-environment-contract-and-database-boundary.md) (proposed) |
| Authentication | Better Auth email identity | No package/schema/route/session code | Scaffolded; documented only | Empty `src/lib/auth`, `(auth)`; no auth protection |
| Seller approval/profile | Founder invitation and owner-managed inventory | Manual recruiting described; no invitation/profile/approval product | Missing | Waitlist submission is not a user or seller account |
| Canonical asset visuals | Template-driven sellable regions | Two annotated SVG marketing drawings; local coordinate constants | Partially implemented presentation only | `asset-plates.tsx`; lid/chest each one spot; no registry, template version, selectable regions or asset renderer contract |
| Assets/surfaces/spots | Generic owned inventory | No schema/operations/types | Scaffolded; documented only | Empty `src/lib/assets`; marketing local `Spot` type is presentation, not domain |
| Distribution model | Digital and physical contextual signals | Optional waitlist audience/context strings only | Partially implemented research capture | No claims/provenance/public page schema; never validated reach |
| Listings/availability | Fixed price and bookable dates | No code or tables | Missing | Marketing descriptions are not listing functionality |
| Sponsorship pages | Shareable seller opportunity | No dynamic seller/page route | Missing | Only landing/two waitlists are public pages |
| Offers/orders/reservations | Agreed terms and exclusive allocation | No code or schema | Missing | No concurrency protection needed/implemented for nonexistent orders |
| Payments/KYC/fees | One approved provider marketplace flow | No dependency/config/API/integration | Scaffolded; documented only | Empty `src/lib/payments`; Route candidate not approved; research identifies eligibility risk |
| Campaigns/proof/payouts | Seller fulfillment records, attributed evidence and independent bank settlement | No schema/files/operations | Missing | Marketing copy promises future behavior; no campaign completion evidence in repo |
| Object storage/Sharp | Private proof/creative processing | No R2/Supabase Storage client or upload routes; no Sharp pipeline | Scaffolded; documented only | `src/lib/storage` empty; sharp transitive lock entry/ignored build script is not implementation |
| Email/notifications | Sign-in and transaction communication | Contact mailto link only | Missing | No Resend; leads read manually via database tools |
| Analytics/error tracking | Funnel and operational visibility | Console error on failed waitlist insert; no SDK/event/reporting | Partial error log only | No PostHog/Sentry; raw error logging should be reviewed for sensitivity |
| UI/design system | Cohesive accessible application | Tailwind v4 tokens, CSS controls, two next/font families, marketing/waitlist components | Implemented marketing; app UI scaffolded | No shadcn/Radix dependency; `components/ui` empty |
| Motion/accessibility | Mobile/keyboard/reduced-motion | Skip link, labels, focus styling, SVG aria labels, CSS reduced-motion and noscript reveal fallback | Partially verified | Source inspected, historical browser pass only; no formal accessibility audit in this task |
| SEO/sharing | Canonical and social previews | Metadata, robots, sitemap for three pages | Partially implemented | Large Twitter card declared without image; no share image; sitemap timestamp regenerated. The localhost-canonical risk is closed: a production build now fails without a valid `NEXT_PUBLIC_SITE_URL` |
| Testing | Repeatable behavior/migration/browser checks | `pnpm test` runs Vitest `unit` and `integration` projects on a disposable PostgreSQL container, covering waitlist validation, both environment validators, migration fresh/upgrade paths, role denial and the full waitlist route status contract; the targeted client-boundary, environment-contract and waitlist database/route scripts remain | Implemented for behavior; browser and CI missing | `vitest.config.mts`, `tests/{unit,integration,support}`, [ADR-006](../decisions/ADR-006-behavior-test-harness.md); no Playwright journey or CI workflow — FOUNDATION-004 owns both |
| CI/release/deployment | Automated PR checks and practical host | Empty Next config; no .github workflows, Wrangler/OpenNext config | Documented only; questionable host assumptions | GitHub workflows/deployments count 0; externally configured hosting not inspected |
| Agent docs/workflow | One rule source, issue/PR discipline | AGENTS, CLAUDE pointer, README, workflow, two accepted ADRs | Implemented docs; partial coverage | Workflow protections described, branch-protection settings not verified |
| Product/architecture/status docs | Executable product blueprint | Before planning PR #52, 15 tracked Markdown files were zero-byte; substantial design/setup/ADRs existed | Implemented planning docs | PR #52 supplies the blueprint and consolidates empty duplicates; no product capability implied |

## Important contradictions and unsupported claims

- `hero.tsx`: “No fees while we're invite-only” conflicts with introducing a take rate without a waiver/transition decision. Future agents must not deduct 15% by default.
- `how-it-works.tsx`: platform handles decal/printing/delivery and proof releases payout. These source promises conflict with the reconciled marketplace model. PAGE-002 must correct them under approved policy; this documentation task does not edit the marketing UI.
- `hero.tsx`, `where-we-are.tsx`, ticker aria label and plate annotations describe surfaces as live/supported/open for rent despite no inventory. `premise.tsx` claims the laptop is the most-looked-at café surface without evidence. These are copy issues, not measured traction.
- `asset-plates.tsx`: viewBox rectangle width/height printed as MM, with no physical sizing relationship. Do not derive manufacture from those labels.
- README/architecture formerly listed R2/shadcn as though present. They are plans; this documentation PR clarifies the distinction.
- Existing status called migration “applied” without naming environment. This audit attributes the report to PR #2's development database only.
- `.env.example` formerly requested `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. No source file read any of them; FOUNDATION-002 removed them rather than leaving a service-role key in the onboarding instructions.
- AGENTS' current public scope is landing/waitlist. Future approved sponsorship pages require a deliberate stage transition; a roadmap does not mean those routes already exist or authorize public seller publishing.

See [known issues](known-issues.md) for ownership and [PRD concerns](../product/prd.md#concerns-and-decisions) for product experiments rather than turning every assumption into code.

## Structure and history

Local empty directories: `src/types`, `src/utils`, `src/lib/{auth,storage,assets,payments}`, `src/components/ui`, `src/app/(auth)`, `src/app/(dashboard)`. Empty directories are not tracked by Git and may not exist in a fresh clone. No hidden implementation was found in them.

Before planning PR #52, empty docs were all five product files; architecture application/assets/authentication/database/deployment/payments; development branching/testing; status roadmap/known-issues. Their paths were scaffold, not specifications. Empty `docs/decisions/.gitkeep` is harmless scaffolding.

Git history shows foundation scaffolding (`c74f4c3`), canonical AGENTS/workflow/docs (`48057c6`, `75ab3e9`, `ab2abad`), connection configuration (`e473cfb`), migration-command/meta tracking correction (`489e6a8`), waitlist schema (`622b040`), design (`71cdc27`), landing (`a164ee7`), forms (`6ed190d`), documentation (`83c9fa7`), then human merge PR #2 (`41949fe`). Do not recreate the already-fixed `db:migrate` typo or ignored Drizzle metadata as new work.

## Next action

FOUNDATION-001 (#4) and FOUNDATION-002 (#5) are closed and merged in PR #53 and PR #54. FOUNDATION-003 (#6) is implemented on branch `test/foundation-003-behavior-test-harness` and awaits founder review and merge. **[FOUNDATION-004 — Run required CI checks and one production-browser smoke journey (#7)](https://github.com/Mohith1612/billboard-me/issues/7)** is next once it merges: the commands it has to run on a pull request now exist, and the runtime pin and browser journey do not. Founder demand, physical-rights and payment-eligibility investigations can proceed independently.

No evidence in this audit establishes any completed real campaign. Planning outputs and open issues are not shipped features; the waitlist migration still requires separately controlled deployment, and no deployed Supabase project, role or connection mode has been inspected. PLAN-002 changes only planning/issue requirements; the environment implementation comes from merged PR #54.
