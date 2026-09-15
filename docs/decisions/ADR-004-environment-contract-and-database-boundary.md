# ADR-004: Environment contract and a lazy database boundary

**Date:** 2026-09-15. **Status:** Proposed — founder approval required. **Issue:** [FOUNDATION-002 #5](https://github.com/Mohith1612/billboard-me/issues/5).

## Context

Two variables were read directly from `process.env` with no validation.
`DATABASE_URL` used a non-null assertion and built a `postgres()` client at
module scope, so an unset variable did not fail: `postgres.js` fell back to its
own defaults and the mistake surfaced later as a confusing connection error
inside the waitlist route. `NEXT_PUBLIC_SITE_URL` fell back to
`http://localhost:3000`, and because Next.js inlines `NEXT_PUBLIC_*` values at
build time, a deployment built without it would serve localhost canonical URLs,
robots.txt and sitemap with no runtime way to recover. `.env.example` also asked
for three Supabase keys that no source file reads, including a service-role key.

## Decision

**A public and a server environment module, split by what may reach a browser.**
`src/lib/env/public.ts` holds only `NEXT_PUBLIC_*` values and is safe to import
anywhere. `src/lib/env/server.ts` is marked `server-only` and is the single place
that reads a secret. `src/lib/env/database-url.ts` holds the shared
connection-string validator; it reads no environment itself and carries no
`server-only` marker, because `drizzle.config.ts` runs outside Next.js and cannot
resolve that marker. Its errors name the variable and never echo the value,
which is a password.

**A missing canonical origin fails the production build.** `NEXT_PUBLIC_SITE_URL`
is required when `NODE_ENV` is `production`, must be an absolute `http(s)`
origin with no credentials, path, query or fragment, and is normalised through
`URL.origin`. Development and test still fall back to `http://localhost:3000`.
The build is the only enforcement point that works, because the value is frozen
into the bundle at that moment.

**The database client is created on first use, not at import.** `next build`
imports the waitlist route while collecting page data, so validating
`DATABASE_URL` at module scope would make every build — including a
documentation or landing-page-only build — require a database. `getDb()`
replaces the exported `db` constant and validates on the first query instead.

**Migrations may use their own credentials.** `drizzle.config.ts` prefers
`DATABASE_MIGRATION_URL` and falls back to `DATABASE_URL`, so an environment that
separates a schema-owning migration role from a narrowly granted app role can do
so without a code change, and one that does not is unaffected.

## Consequences

- A production build now fails without `NEXT_PUBLIC_SITE_URL`. Anyone whose
  `.env.local` predates this change must add it; it is already in
  `.env.example`. This is the intended trade: a loud build failure instead of a
  quiet localhost canonical in production.
- `import { db }` no longer exists. Call `getDb()` inside the request path.
- `.env.example` lists only the variables the application actually reads. A
  variable for auth, payments, storage or email is added when its integration
  lands, which is the rule already stated in `docs/development/setup.md`.
- `pnpm test:env` covers the missing/invalid origin, the database-free static
  build, and both database-boundary failures. `pnpm test:client-boundary` now
  also proves `src/lib/env/server.ts` cannot enter a client bundle.
- This validates repository behaviour only. Which connection mode, role, TLS
  setting and pooler a deployment actually uses is still operator-verified;
  FOUNDATION-005 owns proving it on a real runtime.

## Alternatives considered

- **Warn instead of failing the build on a missing origin** — rejected. A
  warning in build output is exactly what gets scrolled past, and the resulting
  defect is invisible until a search engine indexes localhost.
- **Validate `DATABASE_URL` at module scope** — rejected; it makes every static
  build require a database, which is the risk FOUNDATION-002 was asked to avoid.
- **A single `src/lib/env.ts`** — rejected. One module would have to be either
  importable from the browser (and therefore unable to hold a connection string)
  or `server-only` (and therefore unusable from `drizzle.config.ts`).
- **A `zod` schema for the environment** — rejected for now. Two variables with
  precise, quotable error messages are clearer as small functions, and the
  validator has to stay importable by the Drizzle CLI.
- **Requiring separate migration credentials** — rejected as premature; managed
  Postgres offerings differ in whether they expose a second role, so the split is
  supported but not mandated.
