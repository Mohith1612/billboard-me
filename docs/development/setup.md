# Local development setup

Read [AGENTS.md](../../AGENTS.md) and the [agent workflow](agent-workflow.md) first. Audit checks passed using Node **22.14.0** and the repository's **pnpm 10.15.1**. Use the packageManager version from package.json; a consistent runtime pin is planned in FOUNDATION-004. Git and GitHub CLI are useful for the required issue/PR workflow.

```bash
git clone git@github.com:Mohith1612/billboard-me.git
cd billboard-me
pnpm install --frozen-lockfile
cp .env.example .env.local
```

## Current environment contract

Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` and a **nonproduction** `DATABASE_URL` for your own disposable/development Postgres instance. Do not print or commit secrets. The example currently includes unused Supabase public/anon/service-role entries and commented R2 entries; **none of those is consumed by the current app**. No Cloudflare or storage account is required to run the landing/waitlist app. FOUNDATION-002 will clean up the example and add validated configuration.

The site URL feeds canonical metadata, sitemap and robots and currently falls back to localhost. Next's public environment variables are build-time inputs; deployment must provide a real canonical origin. See installed `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md` before changing configuration behavior.

Drizzle CLI currently reads `.env.local` with dotenv and uses DATABASE_URL; the app reads the same variable through Next. There is no enforced separation of migration/test/runtime URLs yet. Verify the selected target is nonproduction before running migrations or Studio. The client disables prepared statements; confirm direct versus session/transaction-pooler connection requirements using [Supabase connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres). The runtime role must be server-only and able to insert while bypassing waitlist RLS. Connection string, role and deployment assumptions are not proven merely by the client constructor; FOUNDATION-002 owns that validation.

## Database and run

For your isolated development database, apply existing migrations before testing persistence:

```bash
pnpm db:migrate
pnpm dev
```

Migration `drizzle/0000_clammy_ma_gnuci.sql` creates the seller and brand waitlists. Migration `0001_many_vector.sql` enables RLS on both and revokes all table privileges from the Supabase `anon` and `authenticated` roles; it creates no client policy. PR #2 reports applying 0000 to its development DB, not yours, and this repository does not prove that 0001 is deployed. Commit newly generated SQL and Drizzle metadata together; never edit applied migrations. `pnpm db:generate` generates migrations from schema, and `pnpm db:studio` inspects the database. There is no lead-review dashboard or notification service today.

Open localhost:3000. Current routes are `/`, `/waitlist/seller`, `/waitlist/brand` and `POST /api/waitlist`, plus generated metadata routes. Valid waitlist submissions write real rows to the configured development DB; use synthetic addresses and clean up only your test fixtures.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test:client-boundary
pnpm test:db:waitlist
pnpm build
```

The waitlist database check requires Docker, `psql`, and `curl`. It starts disposable PostgreSQL 16, creates synthetic roles/data, tests fresh and upgrade migration paths, and exercises both waitlist route variants; it never reads `.env.local` for its database target. The client-boundary check builds a disposable fixture and expects Next.js to reject a client import of `src/lib/db`. There is still no general test runner or CI workflow; [Testing](testing.md) specifies FOUNDATION-003/004 and later expectations. A fresh typecheck may need Next-generated route types. Build fetches next/font resources when they are not cached. None of these local checks proves remote DB connectivity, deployed grants or production configuration.

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

Future auth/provider/storage/email environment variables belong in the example only when their corresponding integration lands. Keep test/preview/prod connections, buckets and provider modes separate; no real recipients or financial credentials in automated fixtures.
