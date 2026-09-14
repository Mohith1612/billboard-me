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

Drizzle CLI currently reads `.env.local` with dotenv and uses DATABASE_URL; the app reads the same variable through Next. There is no enforced separation of migration/test/runtime URLs yet. Verify the selected target is nonproduction before running migrations or Studio. The client disables prepared statements; confirm direct versus session/transaction-pooler connection requirements using [Supabase connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres). Connection string, role and deployment assumptions are not proven merely by the client constructor.

## Database and run

For your isolated development database, apply existing migrations before testing persistence:

```bash
pnpm db:migrate
pnpm dev
```

The only migration is `drizzle/0000_clammy_ma_gnuci.sql`, creating the seller and brand waitlists. PR #2 reports applying it to its development DB, not yours. Commit newly generated SQL and Drizzle metadata together; never edit applied migrations. `pnpm db:generate` generates migrations from schema, and `pnpm db:studio` inspects the database. There is no lead-review dashboard or notification service today.

Open localhost:3000. Current routes are `/`, `/waitlist/seller`, `/waitlist/brand` and `POST /api/waitlist`, plus generated metadata routes. Valid waitlist submissions write real rows to the configured development DB; use synthetic addresses and clean up only your test fixtures.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

There is no automated test command yet. [Testing](testing.md) specifies FOUNDATION-003/004 and later integration expectations. A fresh typecheck may need Next-generated route types; the CI issue must make that sequence reproducible. Build fetches next/font resources when they are not cached. Neither successful build nor typecheck proves remote DB connectivity, grants or production deployment.

Future auth/provider/storage/email environment variables belong in the example only when their corresponding integration lands. Keep test/preview/prod connections, buckets and provider modes separate; no real recipients or financial credentials in automated fixtures.
