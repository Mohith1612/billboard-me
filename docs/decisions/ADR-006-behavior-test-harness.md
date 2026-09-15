# ADR-006: Behavior tests on a disposable Postgres harness

**Date:** 2026-09-15. **Status:** Proposed — founder approval required. **Issue:** [FOUNDATION-003 #6](https://github.com/Mohith1612/billboard-me/issues/6).

## Context

FOUNDATION-001 and FOUNDATION-002 left three bespoke checks: a negative
client-import build, an environment-contract script and a disposable-Postgres
waitlist script. Each proves something real, and each costs a full `next build`
or a `next dev` server to run. Nothing could be added cheaply: there was no place
at all for a test of a pure function, and the waitlist route's status contract
was only partly exercised — 201 and 500 over HTTP, never 202, 422 or the
difference between "the database refused the insert" and "there was no database".

The repository is about to grow domain modules, and every one of them will need
tests against real database constraints. It needs a harness before it needs the
modules.

## Decision

**Vitest, with two projects and nothing else installed.** `unit` runs pure
validation and guard functions; `integration` runs against a real database. The
component-testing stack from the Next.js guide — `jsdom`, Testing Library,
`@vitejs/plugin-react` — is deliberately not installed: nothing in scope renders
a component in Node today, and the guide itself recommends browser journeys for
async Server Components. `vitest.config.mts` declares the `@/` alias directly
rather than adding `vite-tsconfig-paths`. `vitest` is the one new dependency.

**Integration tests use a real, disposable database, never a fake one.** What
these tests assert — row level security, role grants, `NOT NULL`, the order
migrations apply in — is exactly what an in-memory or mocked Postgres cannot
answer. `tests/support/test-database.ts` creates a uniquely named database per
test file, applies the committed migrations in journal order, creates the
least-privilege application role, and drops all of it afterwards.

**The harness refuses to run against a real database.** `TEST_DATABASE_URL` is
required and has no fallback. It is rejected when it names the database this
checkout is configured to use — read from the environment and from `.env.local`
or `.env`, which the harness reads *only* in order to refuse them. Every create
and drop is checked against the `billboard_test_` prefix, so the harness can only
destroy names it generated. Vitest loads no `.env` file, and
`tests/support/setup.ts` deletes the application's variables before any test
runs, so nothing can reach a developer's database by default.

**One command runs everything.** `pnpm test` starts a disposable PostgreSQL 16
container, sets `TEST_DATABASE_URL`, runs both projects and removes the
container. Setting `TEST_DATABASE_URL` yourself skips the container.

**The existing shell checks stay.** They prove overlapping guarantees by a
different method — a real production build, a real HTTP server, `psql` — and
that redundancy is the point: the Vitest suite exercises the route in process,
through the same client the server uses.

**`closeDb()` is added to `src/lib/db/index.ts`.** The module caches its client
for the life of the process, which is right for a server and wrong for a suite
that points the same route at a healthy database, then at one that denies
inserts, then at one that is not listening.

## Consequences

- `pnpm test` needs Docker, or a throwaway cluster in `TEST_DATABASE_URL`. There
  is still no CI; pinning the runtime and running these checks on a pull request
  is FOUNDATION-004.
- The harness creates the cluster-wide `anon` and `authenticated` roles, because
  migration `0001` revokes privileges from them. They are left in place: they
  cannot log in, hold nothing, and the disposable cluster is discarded with them.
- `server-only` resolves to an empty module under Vitest, since Next.js supplies
  that alias only during a build. The boundary itself stays proven by
  `pnpm test:client-boundary`, which asserts that a real client import fails.
- `@types/node` moves to `^22` to match the documented Node 22 runtime and
  Vitest's peer range.
- Migrations are applied from the journal by the harness, not by
  `drizzle-kit migrate`. The bookkeeping table that command maintains is
  therefore not covered by any test; `pnpm db:migrate` remains operator-run.
- No coverage threshold is configured. Counting covered lines would say nothing
  about a repository whose risk is concentrated in database privileges.

## Alternatives considered

- **Jest** — rejected. Heavier to configure for ESM and TypeScript here, and the
  installed Next.js guide documents Vitest for this shape of project. Nothing in
  scope needs Jest's ecosystem.
- **`node:test`** — rejected, though it would add no dependency. The suite relies
  on resetting the module registry between cases and on running two projects with
  different requirements; both are Vitest features.
- **A mocked or in-memory database** — rejected. A fake Postgres cannot deny a
  role, enforce RLS or reject a migration applied out of order, which is most of
  what there is to test.
- **Testcontainers** — rejected as a dependency. A forty-line script starts and
  removes the same container, and the existing checks already do it.
- **A long-lived shared test database** — rejected. It cannot prove the
  fresh-migration path, and parallel runs would interfere.
- **Replacing the FOUNDATION-001/002 shell checks** — rejected. They verify the
  same guarantees through a real build and a real HTTP server, and AGENTS.md
  forbids deleting tests to simplify.
- **Applying migrations with `drizzle-orm`'s migrator** — rejected for now: the
  upgrade test has to stop at an arbitrary migration, which the migrator does not
  support. It reads the same journal and the same SQL files that `pnpm db:migrate`
  applies.
