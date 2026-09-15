# Architecture overview

Read [current state](../status/current-state.md) for implementation evidence. This file describes the intended incremental architecture; most domain capabilities are not built. [ADR-001](../decisions/ADR-001-foundation-stack-and-scope.md) remains the accepted foundation. [ADR-003](../decisions/ADR-003-inventory-and-transaction-boundaries.md) proposes the domain refinement for founder review.

## Keep the monolith

One Next.js App Router application handles server-rendered public pages, small interactive forms, authenticated workflows and provider webhooks. Plain TypeScript domain modules under `src/lib/` own validation, permissions and transactions. Drizzle accesses Supabase-managed Postgres. Use React Server Components for reads and narrow Client Components for interactions; no separate backend, RPC framework or repository-wrapper hierarchy is necessary.

| Module | Interface / responsibility | When needed |
| --- | --- | --- |
| `lib/auth` | Verify session; require role/ownership; redeem seller invitation | P0 identity |
| `lib/assets` | Resolve immutable templates; create seller assets and eligible spots | P0 inventory |
| `lib/listings` | Save draft, submit review, publish, return safe public projection | P0 seller/page |
| `lib/offers` | Submit, counter, reject, withdraw and accept current proposal | P0 buyer |
| `lib/orders` | Freeze terms, reserve inventory, apply authorized transitions | P0 order |
| `lib/payments` | One provider adapter and financial reconciliation | P0 after provider approval |
| `lib/campaigns` | Seller fulfillment record, participant messages, evidence and attributed sponsor response | P0 campaign |
| `lib/storage` | Authorize signed upload/read; validate owner and purpose | P1 native uploads; advance only if agreed evidence retention requires it |
| `lib/notifications` | Transactional email, dedupe and visible delivery failure | P0 auth/operations |

Create these only when their issue uses them. Existing `site` and `waitlist` modules remain. Route handlers or Server Actions validate input and call a domain operation; they do not reproduce pricing, authorization or state logic. Authorize every operation, including private reads and upload URLs. Public projections list allowed fields explicitly. Layout/proxy checks alone cannot authorize all entry points; consult the installed Next.js security guide.

## PaymentService and asynchronous work

One active provider behind a small internal interface isolates HTTP behavior and sandbox tests from product rules. Cover seller onboarding/capabilities, create/retrieve checkout, verify/normalize event, retrieve financial outcome, request refund/reversal, allocate seller share where the provider requires it and retrieve/reconcile settlement. Capabilities and error semantics are fixed by the approved provider. Ordinary provider settlement is independent of proof; no mandatory `releasePayoutAfterProof` interface. Optional hold/release is outside v1 unless explicitly approved. Do not assume every endpoint is safely repeatable.

Provider calls run outside DB transactions. Store an operation intent, submit and reconcile outcome; signed webhook events enter a deduplicated inbox. A small scheduled or operator-triggered sweep in the same app repairs delayed/missed events and expires offers/holds. Notifications use a small durable outbox when transitions need reliable email. No Redis, message broker, microservice or universal job framework.

The [lifecycle](transaction-lifecycle.md) is shared by UI, route handlers, reconciliation and operator tools. Preserve failed/unknown/refunded/reversed states. Founder interventions use authorized operations and retain reasons/references. Evidence/social URLs use safe allowed protocols; do not fetch arbitrary seller-supplied URLs from the server. Manual link review is enough initially and avoids introducing an SSRF-prone preview scraper.

[ADR-005](../decisions/ADR-005-marketplace-responsibility-and-settlement-model.md) defines marketplace responsibility. Normal settlement may precede seller fulfillment; neither campaign code nor operator proof review controls it. Preserve provider restrictions and refund/dispute exposure independently.

## Stack decisions

| Technology | Audit / recommendation |
| --- | --- |
| Next.js 16.3.5 / React 19.2.8 / TypeScript | Installed; retain. Read installed docs before code. No framework rewrite to satisfy deployment preference |
| Tailwind v4 | Installed; preserve tokens and media-kit design |
| shadcn/ui | Not installed; add selected primitives when application UI needs them, with dependency justification |
| Zod / Drizzle / postgres.js | Installed; retain validated environment/lazy DB boundary and private access from PR #53/54; add transaction constraints as domain issues require |
| Better Auth | Accepted plan, absent; one email login method plus seller invitations. Supabase Auth is an alternative only if an evidenced integration problem justifies an ADR; do not run both |
| Supabase Postgres | Retain managed database; public Data API access unnecessary for the server-owned model |
| R2 vs Supabase Storage | R2 accepted preference, absent. Keep if private signed access works on chosen host. Supabase Storage may reduce vendor operations, but Better Auth does not automatically supply its JWT/RLS identity; compare actual integration in MEDIA-001 before an ADR deviation |
| Sharp | Not direct dependency or implemented pipeline. Transitively referenced and ignored for build scripts. Canonical SVG needs none; photo sanitization/thumbnails must be proven on selected runtime; no video transcoding in P0 |
| Resend | Absent. Sign-in mail and required campaign notifications justify it; lead-notification automation alone is not a first-campaign blocker |
| PostHog / Sentry | Absent. Sanitized errors, operator visibility and durable funnel milestones are P0; SDKs/dashboards P1 unless evidence demands earlier |
| Vitest / Playwright / GitHub Actions | Absent. Add behavior tests, disposable Postgres integration and a critical browser journey; CI runs required checks |
| Cloudflare | Preference, no deployment. Exact-repo OpenNext spike; managed Node fallback with founder approval if friction persists. [Deployment](deployment.md) |

## Operational minimum

Before live money: isolated preview/test/prod data and secrets, reviewed migrations, tested backup/restore, protected operator access, signed webhooks, reconciliation queue, private evidence records and participant messages, versioned commercial policies, support contact and refund/dispute/payout runbook. A small operator screen shows approvals, unknown orders, seller-reported preparation exceptions, overdue agreed evidence, disputes and failed settlements.

No browser direct DB writes, public service-role keys, untrusted SVG, auth token logging, raw evidence in analytics or unverified financial toggles. [Database](database.md), [authentication](authentication.md), [templates](assets-and-surfaces.md) and [payments research](payments.md) specify the contracts.
