# Local Development Setup

## Prerequisites

- Node.js 22 LTS (or current LTS)
- pnpm
- Git
- GitHub CLI (`gh`) recommended
- Supabase account
- Cloudflare account (for R2)

## 1. Clone and install

```bash
git clone <repo-url>
cd billboard-me
pnpm install
```

## 2. Environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Fill in the values (never commit `.env.local`):

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
# R2 keys added when storage is implemented
```

`NEXT_PUBLIC_SITE_URL` is used for canonical URLs, `sitemap.xml` and
`robots.txt`. It falls back to `http://localhost:3000` when unset.

## 3. Database

We use Drizzle ORM with Supabase Postgres.

Apply the existing migrations before running the app, otherwise waitlist
submissions will fail to save:

```bash
pnpm db:migrate
```

Available scripts:

| Script | Does |
| --- | --- |
| `pnpm db:generate` | Generate a migration from `src/lib/db/schema.ts` |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Browse the data — this is how you read waitlist entries |

Generated SQL lives in `drizzle/`. Never edit a migration that has already been
applied, and commit `drizzle/meta` along with the SQL: drizzle-kit uses it to
diff the next schema change.

## 4. Run the development server

```bash
pnpm dev
```

## 5. Project conventions

- Read `AGENTS.md` before any work
- Follow the agent workflow in `docs/development/agent-workflow.md`
- All changes go through issues + PRs
- Documentation must stay in sync with code
```
