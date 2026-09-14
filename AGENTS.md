# AGENTS.md — Billboard.me Engineering Instructions

This is the single source of truth for every coding agent working on this repository.

**Read this file completely before doing any work.**

---

## 1. Product Summary

Billboard.me is a marketplace for physical advertising inventory.

Core insight: People already own physical objects and occupy physical spaces that others see. Those surfaces can be sold as advertising spots.

**Current stage (strict):**
- Invite-only / high-touch
- Only two asset types exposed: MacBook and Jersey/T-shirt
- Public site is only a landing page + waitlist forms
- Real sellers are recruited manually by the founder
- Success metric = closed paid campaigns with proof and payout

We are **not** building a full open marketplace yet.

---

## 2. Non-Negotiable Rules

### Git & Branching
- **Never** commit directly to `main`
- **Never** push directly to `main`
- **Never** merge your own PR
- **Never** force-push `main`
- Every change must go through: Issue → Branch (or worktree) → Implementation → Tests → Documentation update → PR → Human review → Human merge

### Workflow for every task
1. Investigate first (read relevant docs, existing code, schema, ADRs)
2. Create or update a GitHub issue describing the problem, investigation, proposed solution, risks, and acceptance criteria
3. Create a dedicated branch (and git worktree when multiple agents are active)
4. Implement following existing architecture
5. Run lint, typecheck, tests, and build
6. Update documentation so it matches the code
7. Commit with clear messages
8. Open a PR that references the issue
9. Stop. Wait for human review and merge

### Code & Architecture
- Keep it a boring Next.js monolith
- Do not introduce microservices, separate backends, Redis, Elasticsearch, Kubernetes, or unnecessary complexity
- Prefer simple, readable code over clever abstractions
- Database changes only through Drizzle migrations
- Never edit an already-applied migration
- Do not add dependencies without clear justification
- Do not hard-code the five original asset categories — keep the domain model generic even if the UI only shows two

### Documentation
- Documentation must stay true to the code at all times
- Significant architectural decisions require an ADR in `docs/decisions/`
- Update `docs/status/current-state.md` when the actual state of the project changes

### Security
- Never commit secrets or `.env` files
- Never use production credentials in development
- Never expose service-role keys to the client

---

## 3. Current Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Database**: Supabase Postgres + Drizzle ORM
- **Auth**: Better Auth (to be added)
- **Storage**: Cloudflare R2
- **Validation**: Zod
- **Email**: Resend (later)
- **Analytics / Errors**: PostHog + Sentry (later)
- **Deploy**: Cloudflare (preferred)

---

## 4. Domain Model (canonical)

User
└── Asset
└── AssetTemplate (MacBook, Jersey, …)
└── Surface
└── Spot
└── Listing
└── Offer / Order
└── Campaign
└── Proof
└── Payout

Keep this abstraction even while the UI only exposes MacBook and Jersey/T-shirt.

---

## 5. Visuals

- Use high-quality flat templates (SVG preferred) with predefined coordinates for overlays
- Do **not** introduce Three.js / React Three Fiber until we have real traction and closed transactions
- Isolate the asset renderer so it can be upgraded later without rewriting the app

---

## 6. What is explicitly out of scope right now

- Public self-serve listing creation
- Full marketplace browse / search / filters
- Auctions
- Multiple payment providers
- 3D assets
- Complex recommendation or ranking engines
- Native mobile apps
- Microservices

---

## 7. Agent Responsibilities

- Stay true to first principles and clean engineering
- Prefer investigation and documentation over rushing code
- When in doubt, stop and ask (via the GitHub issue) rather than inventing new architecture
- Multiple agents must not modify the same schema or critical shared files concurrently without coordination

---

## 8. Definition of Done

A task is complete only when:
- Code works
- Tests pass (lint + typecheck + relevant tests)
- Documentation is updated
- GitHub issue exists and is linked
- PR is opened
- Human has reviewed and merged

---

**If any instruction in this file conflicts with a temporary request, this file wins.**

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
