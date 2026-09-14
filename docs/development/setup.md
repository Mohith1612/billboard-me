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
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
# R2 keys added when storage is implemented
```

## 3. Database

We use Drizzle ORM with Supabase Postgres.

Useful scripts (add these to `package.json` if not present):

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio"
```

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
