# Architecture Overview

## High-level shape

Billboard.me is a single Next.js (App Router) full-stack monolith written in TypeScript.

There is no separate backend service, no microservices, and no additional runtime for the MVP.

## Key layers

- **UI**: React Server Components + Client Components, Tailwind CSS, shadcn/ui
- **Routing**: Next.js App Router with route groups. Only `(marketing)` exists
  today (landing page + waitlist); `(auth)` and `(dashboard)` are planned, not built
- **Domain logic**: Plain TypeScript modules under `src/lib/`
- **Database**: Supabase Postgres accessed via Drizzle ORM
- **Auth**: Better Auth (to be integrated)
- **File storage**: Cloudflare R2
- **Payments**: Thin provider abstraction (starting with one provider)
- **Validation**: Zod at the boundaries

## Domain model

The canonical model is:

User → Asset → AssetTemplate → Surface → Spot → Listing → Offer/Order → Campaign → Proof → Payout

Even though the UI currently only exposes MacBook and Jersey/T-shirt, the data model stays generic so new templates can be added later without redesign.

## Visual rendering

Asset templates use high-quality flat representations (SVG preferred) with predefined coordinates for sponsorship overlays.

The renderer is isolated so it can later be replaced or extended (including 3D) without rewriting the application.

Today the only implementation is `src/components/marketing/asset-plates.tsx`, which
draws the MacBook and jersey as annotated technical drawings from the coordinate
objects `MACBOOK_PLATE` and `JERSEY_PLATE`. It is used for marketing illustration
only and is not wired to any real asset, surface or listing.

## Deployment target

Cloudflare (Pages / Workers path for Next.js) with preview deployments for every PR.

## Principles

- Boring and maintainable over clever
- Explicit over implicit
- Documentation stays synchronized with code
- Database changes only via migrations
- Invite-only and high-touch until real closed transactions exist
