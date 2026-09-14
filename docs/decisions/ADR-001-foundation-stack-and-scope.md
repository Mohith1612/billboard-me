# ADR-001: Foundation Stack and Initial Scope

**Date**: 2026-09-14  
**Status**: Accepted

## Context

We are starting Billboard.me as a solo founder using multiple AI coding agents. The product is a marketplace for physical advertising inventory, but we are deliberately constraining the first version heavily.

Key constraints agreed so far:
- Invite-only / high-touch
- Only MacBook and Jersey/T-shirt exposed
- Public surface is only a landing page + waitlist
- Distribution still lives with the seller
- Success = closed paid campaigns with proof

## Decision

1. **Application shape**: Single Next.js (App Router) TypeScript monolith. No separate backend, no microservices.
2. **Database**: Managed Supabase Postgres + Drizzle ORM. Connection string abstraction so the database can be moved later if needed.
3. **Storage**: Cloudflare R2.
4. **UI**: Tailwind CSS + shadcn/ui.
5. **Auth**: Better Auth (to be added).
6. **Visuals**: High-quality flat templates (SVG preferred) with predefined coordinates. No Three.js / React Three Fiber until real traction and closed transactions exist.
7. **Payments**: Thin abstraction layer. Start with a single provider (Razorpay Route is the leading candidate for India). Do not build multi-provider support yet.
8. **Scope**: No public self-serve listings, no marketplace browse/search, no auctions, no 3D, no complex ranking.

## Consequences

- Agents can work against a clear, narrow target.
- We optimize for learning from real closed loops rather than feature completeness.
- The domain model stays generic (Asset → Template → Surface → Spot…) even though the UI is narrow.
- Documentation and the agent workflow become critical because multiple agents will touch the repo.

## Alternatives considered

- Full open marketplace from day one → rejected (liquidity and quality problems).
- Self-hosted Postgres on Oracle VM → rejected for initial operational overhead.
- 3D assets immediately → rejected as premature complexity.
- Multiple payment providers at once → rejected until the first provider is proven.
