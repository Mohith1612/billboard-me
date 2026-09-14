# Billboard.me

A marketplace for physical advertising inventory. People already own objects and
occupy spaces that others look at — a MacBook lid, a jersey, a T-shirt — and
those surfaces can be sold as advertising spots.

The product is invite-only and high-touch right now. The public site is a landing
page and two waitlist forms; everything else is recruited and closed by hand.

## Read this first

**[`AGENTS.md`](AGENTS.md) is the single source of truth** for engineering rules,
product scope, and workflow. Read it completely before making any change, whether
you are a person or a coding agent.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm db:migrate              # creates the waitlist tables
pnpm dev
```

Open <http://localhost:3000>.

Full setup instructions, including Supabase, are in
[`docs/development/setup.md`](docs/development/setup.md).

## Scripts

| Script | Does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:generate` | Generate a Drizzle migration from the schema |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Browse the database (this is how you read waitlist entries) |

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS, Supabase Postgres via Drizzle
ORM, Zod for validation, Cloudflare R2 for storage. Better Auth and a payment
provider come later. It is deliberately a boring monolith.

## Layout

```
src/app/(marketing)   Public landing page and waitlist routes
src/app/api           Route handlers
src/components        UI, grouped by area (marketing, waitlist)
src/lib               Domain and infrastructure modules (db, waitlist, site)
drizzle               Generated SQL migrations — never edit an applied one
docs                  Architecture, product, decisions (ADRs), status, design
```

## Documentation

- [`docs/architecture/overview.md`](docs/architecture/overview.md) — how the app
  is shaped
- [`docs/decisions/`](docs/decisions/) — ADRs; significant decisions live here
- [`docs/design/design-system.md`](docs/design/design-system.md) — the art
  direction, read before touching marketing UI
- [`docs/status/current-state.md`](docs/status/current-state.md) — what actually
  exists today
- [`docs/development/agent-workflow.md`](docs/development/agent-workflow.md) —
  issue → branch → implementation → PR

Documentation must stay true to the code. If you change behaviour, update the
docs in the same pull request.
