# Current State

**Last updated**: 2026-09-14

## Stage

Foundation / pre-feature

## What exists

- Next.js 16 + TypeScript + Tailwind + App Router project
- Folder structure for app, lib, docs
- `AGENTS.md` as single source of truth
- Empty documentation skeleton
- Drizzle config and schema placeholder files
- No authentication yet
- No database schema yet
- No domain models yet
- Public site is still the default Next.js starter page

## What is intentionally not built

- Waitlist forms (next)
- Auth
- Asset templates
- Listings
- Payments
- Shareable pages
- Any marketplace functionality

## Current constraints

- Invite-only
- Only MacBook + Jersey/T-shirt will be exposed when we start the domain
- Flat templates only (no 3D)
- Managed Supabase Postgres
- Cloudflare R2 for storage

## Next priorities

1. Finish foundation documentation and first ADR
2. Landing page + seller/brand waitlist forms
3. Supabase + Drizzle real setup
4. Better Auth skeleton
5. Domain schema for the narrow invite-only flow
