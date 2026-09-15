# Testing and verification

## Current reality

`pnpm lint`, `pnpm typecheck` and `pnpm build` cover static/build checks. Merged FOUNDATION-001 adds targeted shell/SQL commands, but there is no general `test` script, Vitest, Playwright or CI workflow. PR #2 records a historical manual browser/database pass. Never report absent tests as passing.

`pnpm test:client-boundary` builds a disposable Next.js fixture whose Client Component imports the real database module. The command passes only when Next rejects that import because of the `server-only` marker.

`pnpm test:db:waitlist` requires Docker, `psql`, and `curl`. It creates disposable PostgreSQL 16 databases and synthetic roles, applies both a fresh migration sequence and the 0000→0001 upgrade, runs `tests/db/waitlist-access.sql`, confirms upgrade-row preservation, and POSTs synthetic seller and brand submissions through the real route using a non-owner `BYPASSRLS` server role. The container and fixtures are removed afterward. It never targets the configured development or production database.

## Incremental plan

FOUNDATION-001 supplies the reproducible role-level waitlist assertions described above, without a framework. FOUNDATION-003 adds Vitest and a reusable disposable Postgres integration harness; FOUNDATION-004 adds CI and a production-build Playwright smoke journey. Later issues extend meaningful behavior tests rather than installing a second framework.

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
