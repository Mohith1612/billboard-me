# Local development setup

Read [AGENTS.md](../../AGENTS.md) and the [agent workflow](agent-workflow.md) first. Audit checks passed using Node **22.14.0** and the repository's **pnpm 10.15.1**. Use the packageManager version from package.json; a consistent runtime pin is planned in FOUNDATION-004. Git and GitHub CLI are useful for the required issue/PR workflow.

```bash
git clone git@github.com:Mohith1612/billboard-me.git
cd billboard-me
pnpm install --frozen-lockfile
cp .env.example .env.local
```

## Environment contract

`.env.example` lists every variable the application reads, and nothing else. A variable for auth, payments, storage or email belongs there when its integration actually lands. No Cloudflare, Supabase API key or storage account is needed to run the landing/waitlist app. Do not print or commit secrets, and never point a local setup at production data.

| Variable | Required | Read by | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Always for `pnpm build`; optional for `pnpm dev` | `src/lib/env/public.ts` → `src/lib/site.ts` | Absolute `http(s)` origin, no credentials, path, query or fragment; normalised through `URL.origin`. Development and test fall back to `http://localhost:3000`. |
| `DATABASE_URL` | Whenever a request touches the database | `src/lib/env/server.ts` (`server-only`) | `postgres://` or `postgresql://` with a host. Never imported by a browser module. |
| `DATABASE_MIGRATION_URL` | Optional | `drizzle.config.ts` | Credentials for `pnpm db:migrate`, `db:generate` and `db:studio`. Falls back to `DATABASE_URL`. |

**The canonical origin is a build-time input.** Next.js inlines `NEXT_PUBLIC_*` values into the bundle during `next build`, so a build is the last moment a missing or malformed origin can be caught — after that the value is frozen and no runtime check can recover it. A production build therefore **fails** without `NEXT_PUBLIC_SITE_URL` rather than quietly shipping localhost canonical URLs, robots.txt and sitemap. If your `.env.local` predates this rule, add the line from `.env.example`. See installed `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md` before changing configuration behaviour.

**A missing database configuration fails at the database, not at build.** The client is created on first use, so `pnpm build` succeeds with no `DATABASE_URL` configured and a static-only check stays possible; the first query then fails with an error naming the variable. Errors never echo a connection string, because it contains a password.

## Database connections and roles

| Connection | Used by | Privileges it needs |
| --- | --- | --- |
| Application (`DATABASE_URL`) | `src/lib/db/index.ts` through the waitlist route | `USAGE` on `public`, `INSERT` on `seller_waitlist` and `brand_waitlist`, and the ability to bypass their RLS (table owner, superuser, or a narrowly granted `BYPASSRLS` role). Nothing more. |
| Migration (`DATABASE_MIGRATION_URL`, else `DATABASE_URL`) | `pnpm db:migrate`, `db:generate`, `db:studio` | Schema ownership: create and alter tables, enable RLS, grant and revoke. |
| Test (`TEST_DATABASE_URL`) | `pnpm test`, and the `tests/support` harness it drives | A role on a throwaway cluster that may create and drop databases and roles — `postgres` in the container `pnpm test` starts. Required, with no fallback: the harness refuses a value naming the database configured in your environment or `.env.local`, and only ever creates or drops names prefixed `billboard_test_`. |
| Test (scripts) | `pnpm test:db:waitlist`, `pnpm test:env` | Created and destroyed by the scripts themselves. They never read `.env.local` and never target your development database. |

The RLS bypass on the application role is infrastructure authority, not end-user authorisation: migration `0001` revokes every table privilege from `anon` and `authenticated` and adds no client policy, so the browser has no database path to lead data at all. Keep that role's credentials out of any browser module — `src/lib/env/server.ts` is marked `server-only` and `pnpm test:client-boundary` proves it.

The client sets `prepare: false`, which is what a transaction pooler requires: pooled connections cannot carry named prepared statements across requests. Confirm whether your instance wants the direct, session-pooler or transaction-pooler port, and whether TLS is enforced, using [Supabase connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres). Pool size and connection lifetime under a serverless runtime are still unproven; FOUNDATION-005 owns that. A validated connection string does not prove the deployed role, grants or connection mode — verify those separately, as below.

## Database and run

For your isolated development database, apply existing migrations before testing persistence:

```bash
pnpm db:migrate   # uses DATABASE_MIGRATION_URL when set, otherwise DATABASE_URL
pnpm dev
```

Migration `drizzle/0000_clammy_ma_gnuci.sql` creates the seller and brand waitlists. Migration `0001_many_vector.sql` enables RLS on both and revokes all table privileges from the Supabase `anon` and `authenticated` roles; it creates no client policy. PR #2 reports applying 0000 to its development DB, not yours, and this repository does not prove that 0001 is deployed. Commit newly generated SQL and Drizzle metadata together; never edit applied migrations. `pnpm db:generate` generates migrations from schema, and `pnpm db:studio` inspects the database. There is no lead-review dashboard or notification service today.

Open localhost:3000. Current routes are `/`, `/waitlist/seller`, `/waitlist/brand` and `POST /api/waitlist`, plus generated metadata routes. Valid waitlist submissions write real rows to the configured development DB; use synthetic addresses and clean up only your test fixtures.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test                    # unit and integration behavior tests
pnpm test:client-boundary
pnpm test:env
pnpm test:db:waitlist
pnpm build
```

`pnpm test` is the behavior suite. It starts a disposable PostgreSQL 16 container, sets `TEST_DATABASE_URL` to it, runs the Vitest `unit` and `integration` projects and removes the container, so it needs Docker and no credentials. `pnpm test:unit` skips the database entirely; export your own throwaway `TEST_DATABASE_URL` to skip the container. It never reads `.env.local` except to refuse to run against the database named there. [Testing](testing.md) describes what each project covers and [ADR-006](../decisions/ADR-006-behavior-test-harness.md) why the harness is shaped this way.

The waitlist database check requires Docker, `psql`, `curl` and `setsid`. It starts disposable PostgreSQL 16, creates synthetic roles/data, tests fresh and upgrade migration paths, and exercises both waitlist route variants; it never reads `.env.local` for its database target. The client-boundary check builds disposable fixtures and expects Next.js to reject a client import of `src/lib/db` and of `src/lib/env/server`. The environment check requires `curl` and `setsid`; it copies the app into a disposable `.tmp-env-check/` directory that has no `.env*` file of its own, then asserts that a production build refuses a missing or invalid canonical origin, that a build with no `DATABASE_URL` still succeeds and serves the configured origin in robots.txt and the sitemap, and that a missing or malformed `DATABASE_URL` fails at the waitlist route naming the variable. There is still no CI workflow and no browser journey; [Testing](testing.md) specifies FOUNDATION-004 and later expectations. A fresh typecheck may need Next-generated route types. Build fetches next/font resources when they are not cached. None of these local checks proves remote DB connectivity, deployed grants or production configuration.

## Verify a deployed database without exposing secrets

Deployment verification is a separate operator action after the migration is applied. Use the Supabase dashboard's API settings to confirm whether `public` is an exposed schema; do not paste connection strings, API keys, role passwords, rows or query output containing lead values into an issue or PR. In the SQL editor, inspect metadata only:

```sql
select n.nspname as schema_name,
       c.relname as table_name,
       c.relrowsecurity as rls_enabled
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('seller_waitlist', 'brand_waitlist');

select role_name,
       table_name,
       has_table_privilege(role_name, format('public.%I', table_name), 'SELECT') as can_select,
       has_table_privilege(role_name, format('public.%I', table_name), 'INSERT') as can_insert,
       has_table_privilege(role_name, format('public.%I', table_name), 'UPDATE') as can_update,
       has_table_privilege(role_name, format('public.%I', table_name), 'DELETE') as can_delete
from (values ('anon'), ('authenticated')) as roles(role_name)
cross join (values ('seller_waitlist'), ('brand_waitlist')) as tables(table_name)
order by role_name, table_name;
```

Both RLS values must be true and every effective privilege value must be false. This metadata check does not prove the runtime connection role or an end-to-end Data API denial. Perform mutation/API verification only in an explicitly nonproduction project with synthetic fixtures, never against production leads. See [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api) for the exposed-schema and default-grant model.

Future auth/provider/storage/email environment variables belong in the example only when their corresponding integration lands. Keep test/preview/prod connections, buckets and provider modes separate; no real recipients or financial credentials in automated fixtures. The environment contract itself is recorded in [ADR-004](../decisions/ADR-004-environment-contract-and-database-boundary.md), proposed for founder review.
