# Known issues and decision risks

**Baseline:** 2026-09-14 / `41949fe`. All below are open unless a linked issue later records verified resolution. [Backlog](backlog.md) links each code to its actual GitHub issue. Code gaps and uncertain live configuration are distinguished; this audit did not inspect production data.

| Finding | Evidence / impact | Priority and owner issue | Resolution evidence |
| --- | --- | --- | --- |
| Waitlist data access not explicit | Migration has no RLS/grants; potential direct Data API exposure depends on actual grants/config | P0 FOUNDATION-001 | Role-level denial tests plus separately recorded deployed verification |
| Unvalidated environment | DATABASE_URL assertion; localhost public URL; unused Supabase keys in example | P0 FOUNDATION-002 | Explicit env/runtime behavior, role/pool documentation, no client secret import |
| No automated tests or CI | No runner/scripts/test files/workflow | P0 FOUNDATION-003/004 | Repeatable safe test commands and passing PR CI |
| Hosting not proven | Empty config; no tracked deployment | P0 FOUNDATION-005 | Exact runtime spike, later integrated auth/media/webhook validation |
| Payment eligibility/timing unresolved | Route threshold, Cashfree unknown eligibility, Stripe India restrictions, Dodo mismatch | P0 PAY-001 | Written provider approval and funds flow, or founder no-go/revised model |
| Fee and production copy unsupported | No-fees/print-delivery/proof-release promises | P0 DECISION-001, VALIDATION-002; copy implementation PAGE-002 | Agreed terms/economics and consistent public copy |
| “Live” inventory and visual MM labels misleading | Marketing describes nonexistent inventory and unmeasured dimensions | P0 DOMAIN-002/PAGE-002 | Validated templates and truthful copy |
| Missing domain/auth/order/payment/proof code | Only waitlists exist | P0 dependency roadmap | Each scoped issue's verified acceptance; do not treat empty folders as progress |
| Privacy, rights, cancellation and invoice policies absent | Forms have a short contact-use statement, no complete policy routes; physical sponsorship requires permission | P0 DECISION-001 and PAGE-002/LAUNCH-001 | Founder-reviewed published policies and stored acceptance versions |
| Waitlist can duplicate/spam | No rate limits/dedupe/body-size control beyond honeypot and field lengths | P1 BETA-002; advance if observed abuse | Evidence-based limits without silently dropping legitimate leads |
| Lead follow-up manual | Only DB storage, no notifications/status workflow | Founder operation; P1 BETA-004 if bottleneck | Daily founder review initially; automate only if needed |
| Share image absent | Card metadata exists without image | P0 PAGE-002 | Real approved page preview, no private data leak |
| Accessibility claims not newly runtime-audited | Source support and historical PR evidence only | P0 PAGE-002/LAUNCH-001 | Mobile/keyboard/reduced-motion journey against final implementation |
| Structured error/financial alerts absent | Raw console error only; no transaction system yet | P0 OPS-001; SDKs P1 BETA-003 | Visible failed work and safe logs before live money |

The paid-demand, pricing, rights, proof adequacy, cold-start and labor-cost risks are [PRD experiments](../product/prd.md#validation-experiments). Their proper response may be narrowing or pausing the product, not writing additional features. The first 1–5 campaigns and later 10/100 checkpoints require observed evidence.
