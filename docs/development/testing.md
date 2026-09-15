# Testing and verification

## Current reality

`pnpm test` is the one command that runs the behavior suite. It starts a disposable PostgreSQL 16 container, points `TEST_DATABASE_URL` at it, runs both Vitest projects and removes the container; it needs Docker and no credentials of any kind. Export `TEST_DATABASE_URL` yourself to reuse a throwaway cluster you already have, and the container is skipped. `pnpm test:unit` runs the database-free project alone; `pnpm test:integration` runs only the database project.

| Project | Covers | Needs |
| --- | --- | --- |
| `unit` (`tests/unit/`) | Waitlist validation — trimming, optional and blank values, lengths, offered choices, unknown kinds, field errors. Both environment validators. The migration journal against the committed files. The harness's own safety guards | Node only |
| `integration` (`tests/integration/`) | Fresh and incremental migration application; row level security, absent client policies and denied `anon`/`authenticated` access; the waitlist route's 400, 422, 202, 201 and 500 behavior against a real database, including what each one stores | A disposable PostgreSQL cluster |

`tests/support/test-database.ts` is the harness. Each test file gets its own uniquely named database, migrated in journal order from the committed SQL, with a least-privilege application role — `USAGE`, `INSERT`, `BYPASSRLS`, nothing else — created for it; database and roles are dropped afterwards, so a run leaves nothing behind. Migrations are applied by the harness, not by `drizzle-kit migrate`, so the bookkeeping table that command maintains is not covered by any test.

**No test may reach a real database.** `TEST_DATABASE_URL` is required and never falls back to `DATABASE_URL`. The harness refuses a value naming the database this checkout is configured to use, whether that comes from the environment or from `.env.local`, which it reads only in order to refuse it. Every create and drop is checked against the `billboard_test_` prefix, so it can only destroy names it generated. Vitest loads no `.env` file and `tests/support/setup.ts` deletes the application's own variables before any test runs. The cluster-wide `anon` and `authenticated` roles are created because migration `0001` revokes privileges from them, and are deliberately left in place; give the harness a cluster you can afford that on.

`pnpm lint`, `pnpm typecheck` and `pnpm build` cover static and build checks. Three targeted checks from FOUNDATION-001 and FOUNDATION-002 remain, and prove overlapping guarantees by a different method — a real production build, a real HTTP server, `psql`:

`pnpm test:client-boundary` builds disposable Next.js fixtures whose Client Component imports the real database module and then the real server environment module. The command passes only when Next rejects both imports because of the `server-only` marker. Under Vitest that marker is aliased to an empty module, because Next.js supplies the alias only during a build, so this check is the one that proves the boundary.

`pnpm test:env` requires `curl` and `setsid`. It copies the application into a disposable `.tmp-env-check/` directory that contains no `.env*` file, so the repository's own `.env.local` is never read and each case supplies its entire configuration. It asserts that a production build refuses a missing canonical origin and an invalid one, that a build with no `DATABASE_URL` still succeeds and that `next start` then serves the configured origin — not localhost — in robots.txt and the sitemap, and that a missing or malformed `DATABASE_URL` makes the waitlist route fail with the variable named in the server log. The fixture and its servers are removed afterward.

`pnpm test:db:waitlist` requires Docker, `psql`, `curl` and `setsid`. It creates disposable PostgreSQL 16 databases and synthetic roles, applies both a fresh migration sequence and the 0000→0001 upgrade, runs `tests/db/waitlist-access.sql`, confirms upgrade-row preservation, and POSTs synthetic seller and brand submissions through the real route over HTTP using a non-owner `BYPASSRLS` server role. The container and fixtures are removed afterward. It never targets the configured development or production database.

There is still no CI workflow and no browser journey. PR #2 records a historical manual browser/database pass. Never report absent tests as passing.

## Incremental plan

FOUNDATION-001 supplied the reproducible role-level waitlist assertions and FOUNDATION-002 the environment-contract checks, both without a framework. FOUNDATION-003 added Vitest and the reusable disposable Postgres harness described above, recorded in [ADR-006](../decisions/ADR-006-behavior-test-harness.md). FOUNDATION-004 adds CI and a production-build Playwright smoke journey. Later issues extend meaningful behavior tests through the existing harness rather than installing a second framework: a domain module adds its own `tests/unit` file for pure rules and its own `tests/integration` file for whatever the database must enforce.

Read the installed version's guides before configuration: `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` and `playwright.md`. The Vitest guide notes async Server Component limitations; test those through browser journeys instead of asserting unrepresentative component mocks.

| Layer | Important behavior | Test data / method |
| --- | --- | --- |
| Pure domain/validation | Optional/trimmed values, money rounding, date policies, state permissions | Vitest with clock/provider dependencies injected at narrow seams |
| Postgres integration | Role access, migrations, FK/owner consistency, accept/hold concurrency, unique events/campaigns, refund totals | Fresh isolated database plus upgrade from 0000; real DB constraints/locks |
| Provider integration | Onboarding, signed raw events, duplicates/order permutations, late capture, timeout/unknown, refunds/reversals/settlement | Fake adapter for deterministic failures plus actual approved provider sandbox contract tests |
| Private storage (MEDIA-001, P1; required if enabled earlier) | MIME/size, unauthorized signed URLs, object purpose/campaign ownership, deleted/quarantined files | Disposable bucket and representative malicious/invalid fixtures |
| Browser | Invite → asset/page → request/counter → order → sandbox checkout; parallel normal settlement and seller fulfillment/evidence/sponsor response | Playwright against production build; provider checkout where automatable, recorded sandbox operator steps for bank-settlement simulation |
| Operational release | Restore, lost webhook reconciliation, failed mail, payout failure, support escalation | Nonproduction drills with sanitized evidence |

Do not use a shared production or developer personal database as a test default. Configure explicit test URLs, deterministic fixtures and cleanup. No test email to real leads, real payment instruments/charges or production evidence. A test requiring private provider keys belongs in a controlled nonproduction check; default CI still runs deterministic behavior tests.

Run lint, typecheck, relevant tests and build for code changes. Keep migration generation and edits sequential; a build may generate Next route types, so ensure clean CI typecheck runs after installed `next typegen` or another documented type-generation step if needed. Pin tool/runtime versions in CI. Do not use stale `.next` output as proof of a clean-clone build.

Before real money, prove normal settlement without any proof event or founder release, plus nonattendance after settlement and truthful unresolved support. Evidence cannot affect financial settlement; native-upload checks apply when enabled. Test every adversarial scenario in [transaction lifecycle](../architecture/transaction-lifecycle.md#required-adversarial-tests). Mocked unit success is insufficient for database locking or provider commercial eligibility. Record exact command, result, environment and untested limits in the PR. Avoid snapshot tests that simply mirror every component class/string. Do not delete failing tests to make CI green.

## Documentation-only changes

Validate Markdown paths/anchors, proposed-versus-implemented claims, actual issue URLs, priority coverage and an acyclic dependency order. Run existing repo checks as required by AGENTS.md; do not install a test runner just to test prose. Source/migration/lockfile changes must be absent from this master-plan PR.
