# Deployment decision and release plan

**Current:** `next.config.ts` has no deployment options. No Wrangler/OpenNext config, hosting integration or CI workflow is tracked. GitHub returned zero workflow/deployment records; hosting outside GitHub remains unverified. Local Node build passes. No Cloudflare deployment was tested.

Cloudflare is a preference, not a proven release path. [Runtime research](payments.md#deployment-verification) records current official compatibility evidence. OpenNext claims Next.js 16 support; that is not an exact-repo test. Cloudflare's current guide recommends beta vinext; this plan does not authorize replacing Next.js with a reimplementation.

## FOUNDATION-005: feasibility

Timebox the initial spike to one focused engineering day, record pass/fail and ask founder to choose if it exceeds that budget. Try supported OpenNext on Workers with this lockfile; keep managed Node deployment as fallback. No framework rewrite or extra backend to preserve hosting preference.

Early spike: build, server route, disposable/nonproduction DB under repeated/concurrent requests and raw-body handling. Record the intended auth cookies, private uploads, images and reconciliation schedule. Later implementation issues must exercise those actual flows on the selected host before LAUNCH-001; a checklist is not a completed compatibility test.

Check module-level postgres.js lifetime under Workers request-scoped I/O. Hyperdrive may help if demonstrated, but adds configuration; managed Node can keep postgres.js/Supabase. R2 is usable from either host; local disk is not durable proof storage.

SVG needs no image processing. Do not assume native Sharp works on Workers. Prove safe proof-photo validation/metadata removal or use a supported image service with explicit cost/format limits. Supabase Storage is an alternative after checking server-issued access with Better Auth.

## Before live release

- Isolate test/preview/prod databases, buckets, provider modes and mail. Name migration owner and app role.
- Set canonical URL/auth origins per environment; no production localhost metadata. Public variables are build-time inputs.
- Apply reviewed new migrations once through release process; rehearse backup/restore on disposable data. Code rollback does not reverse migrations; prefer forward fixes.
- Protect drafts/private previews; noindex is not authorization. No production data in previews.
- Verify deployed auth, webhook signature/retry, private media, hold expiry and reconciliation with actual implementations.
- Record redacted error reporting, failed jobs, support owner, provider incident steps, recovery and maximum first-transaction exposure.
- Founder controls final go/no-go and live credentials/merge. This task does not deploy or move money.

Record the chosen host in an ADR when evidence and founder decision exist; do not describe a conditional preference as an accepted deployment.
