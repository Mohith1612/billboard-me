# Billboard.me

A marketplace for physical advertising inventory. People already own objects and
occupy spaces that others look at — a MacBook lid, a jersey, a T-shirt — and
those surfaces can be sold as advertising spots.

The product is invite-only and high-touch right now. The public site is a landing
page and two waitlist forms; seller recruitment is manual and no completed paid
campaign is established by the repository. The planned marketplace facilitates
transactions; sellers own physical fulfillment. Provider settlement and campaign
evidence are independent, with explicit party obligations and support policies.

## Read this first

**[`AGENTS.md`](AGENTS.md) is the single source of truth** for engineering rules,
product scope, and workflow. Read it completely before making any change, whether
you are a person or a coding agent.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm db:migrate              # creates and protects the waitlist tables
pnpm dev
```

Open <http://localhost:3000>.

`.env.example` lists every variable the app reads. `NEXT_PUBLIC_SITE_URL` is
required by `pnpm build` — it is inlined into the bundle, so a production build
fails rather than ship localhost canonical URLs — and falls back to localhost in
development. `DATABASE_URL` is only needed once a request touches the database.

Full setup instructions, including the privileges each connection needs, are in
[`docs/development/setup.md`](docs/development/setup.md).

## Scripts

| Script | Does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test:client-boundary` | Prove the database and server-env modules cannot enter a client bundle |
| `pnpm test:env` | Verify the environment contract: canonical origin, database-free build, database boundary |
| `pnpm test:db:waitlist` | Verify waitlist grants, RLS, migrations, and route persistence in Docker |
| `pnpm db:generate` | Generate a Drizzle migration from the schema |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Browse the database (this is how you read waitlist entries) |

## Stack

Implemented: Next.js (App Router) + TypeScript, Tailwind CSS, Postgres through
Drizzle/postgres.js, and Zod. Better Auth, object storage, payments, shadcn/ui,
general application tests, CI, and deployment are not implemented yet. Targeted
shell/SQL checks cover the waitlist data boundary. Supabase Postgres and
Cloudflare R2 are the preferred managed services; runtime and payment eligibility
still need verification. It remains a single monolith.

## Layout

```
src/app/(marketing)   Public landing page and waitlist routes
src/app/api           Route handlers
src/components        UI, grouped by area (marketing, waitlist)
src/lib               Domain and infrastructure modules (env, db, waitlist, site)
drizzle               Generated SQL migrations — never edit an applied one
docs                  Architecture, product, decisions (ADRs), status, design
```

## Documentation

- [`docs/product/prd.md`](docs/product/prd.md) — master product requirements,
  first paid-campaign slice, validation experiments and Not Yet scope
- [`docs/status/roadmap.md`](docs/status/roadmap.md) — dependencies and stage gates
- [`docs/status/backlog.md`](docs/status/backlog.md) — 48 actual GitHub issues,
  ordered and classified P0–P3; FOUNDATION-001 and FOUNDATION-002 are merged,
  FOUNDATION-003 is next
- [`docs/status/product-model-reconciliation.md`](docs/status/product-model-reconciliation.md) — marketplace responsibility changes and all 48 issue dispositions
- [`CONTEXT.md`](CONTEXT.md) — canonical domain vocabulary
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

The blueprint is proposed for founder review. Its existence does not mean the
marketplace has been built or that unresolved provider/product decisions are
approved. [Current state](docs/status/current-state.md) distinguishes code,
scaffolding, historical verification and open risks.
