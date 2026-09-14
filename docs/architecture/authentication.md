# Authentication and authorization

**Current:** no auth package, schema, routes, sessions or guards; `src/lib/auth` and `(auth)` are empty. **Proposed P0:** Better Auth, as accepted in ADR-001, with its Drizzle adapter and one email-link method. Select/pin a compatible release during implementation; do not invent library tables or APIs from memory.

Better Auth documents Next.js integration and magic links with automatic signup unless disabled. Seller invitation must be a server-enforced capability, not a hidden link. [Next.js integration](https://better-auth.com/docs/integrations/next), [magic-link behavior](https://better-auth.com/docs/plugins/magic-link).

Use verified email for buyers; a person may also become an approved seller. Founder operator access is explicitly provisioned; public registration never accepts role/approval fields. Buyers may register through transaction intent without seller privileges. If early auth restricts accounts to precreated users, BUYER-001 must add the verified buyer path while preserving the seller gate.

Invitations store issuer, email, token hash, expiry and redeemed/revoked state; redemption is atomic, one use and email-bound. Login links use the library's short-lived single-use verification and supported secure token storage. Restrict return URLs to internal paths; retain chosen spot through login. Rate-limit sending/redemption with a simple host/database mechanism; secure cookies and trusted origins. Add one mail provider/test sink; no test mail to real waitlist contacts.

Seller suspension blocks new business while preserving paid obligations and support. Founder sessions need verified identity and a supported second factor before money-release/refund authority; recovery is a documented operator procedure. Provider dashboard access also requires its own protected account.

Authorize in domain operations and safe reads using actor and resource owner/participant. Layouts and `proxy.ts` are UX only. Read installed Next.js `01-app/02-guides/authentication.md` and `data-security.md`; avoid obsolete middleware conventions. Better Auth IDs do not automatically populate Supabase `auth.uid()`. Use server-owned Postgres access unless a supported identity integration is deliberately approved.

Generate supported auth schema, inspect it, then commit/apply a new Drizzle migration. Auth/schema owner coordinates dependent key types and foreign keys. Tests: expired/revoked/used/wrong-email invite; concurrent redemption; link replay; CSRF/origin/redirect restrictions; revocation; buyer/seller/operator access; cross-owner operations; role injection; suspension; private metadata/cache access.
