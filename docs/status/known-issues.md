# Known issues and decision risks

**Baseline:** 2026-09-15 / `55e41d4`, PR #53 merged; PR #54 environment work remains open. All below remain open unless a linked issue records verified resolution. [Backlog](backlog.md) links each code to its actual GitHub issue. Repository controls and uncertain deployed configuration are distinguished; no production data was inspected.

| Finding | Evidence / impact | Priority and owner issue | Resolution evidence |
| --- | --- | --- | --- |
| Waitlist deployed access unverified | Repository migration enables RLS and revokes `anon`/`authenticated`; actual Supabase application, exposed schemas, grants and runtime role are not inspected | P0 FOUNDATION-001, then FOUNDATION-002 for role validation | Disposable fresh/upgrade/route checks pass; operator metadata verification and controlled deployment remain |
| Unvalidated environment | DATABASE_URL assertion; localhost public URL; unused Supabase keys in example | P0 FOUNDATION-002 | PR #54 is open; verify/merge explicit env/runtime behavior and role/pool documentation; no client secret import |
| No general test suite or CI | Targeted waitlist shell/SQL checks exist; no Vitest/Playwright/general harness/workflow | P0 FOUNDATION-003/004 | Repeatable broader behavior tests and passing PR CI |
| Hosting not proven | Empty config; no tracked deployment | P0 FOUNDATION-005 | Exact runtime spike, later integrated auth/webhook validation; native-media runtime only when enabled |
| Marketplace provider eligibility unresolved | Normal settlement is supported in candidate docs; Route threshold persists, Cashfree eligibility unconfirmed, Stripe domestic fee flows conditional/invite-only, Dodo mismatch | P0 PAY-001 | Written provider approval and funds flow, or founder no-go/revised model |
| Fee and production copy unsupported | No-fees/print-delivery/proof-release promises | P0 DECISION-001, VALIDATION-002; copy implementation PAGE-002 | Agreed terms/economics and consistent public copy |
| “Live” inventory and visual MM labels misleading | Marketing describes nonexistent inventory and unmeasured dimensions | P0 DOMAIN-002/PAGE-002 | Validated templates and truthful copy |
| Private native file uploads absent | P0 can use private references/notes with approved retention; files/processing remain necessary if accepted evidence terms demand originals | P1 MEDIA-001; founder may advance for a demonstrated requirement | Authorized validated storage and runtime tests before accepting native files |
| Missing domain/auth/order/payment/proof code | Only waitlists exist | P0 dependency roadmap | Each scoped issue's verified acceptance; do not treat empty folders as progress |
| Privacy, rights, cancellation and invoice policies absent | Forms have a short contact-use statement, no complete policy routes; physical sponsorship requires permission | P0 DECISION-001 and PAGE-002/LAUNCH-001 | Founder-reviewed published policies and stored acceptance versions |
| Waitlist can duplicate/spam | No rate limits/dedupe/body-size control beyond honeypot and field lengths | P1 BETA-002; advance if observed abuse | Evidence-based limits without silently dropping legitimate leads |
| Lead follow-up manual | Only DB storage, no notifications/status workflow | Founder operation; P1 BETA-004 if bottleneck | Daily founder review initially; automate only if needed |
| Share image absent | Card metadata exists without image | P0 PAGE-002 | Real approved page preview, no private data leak |
| Accessibility claims not newly runtime-audited | Source support and historical PR evidence only | P0 PAGE-002/LAUNCH-001 | Mobile/keyboard/reduced-motion journey against final implementation |
| Structured error/financial alerts absent | Raw console error only; no transaction system yet | P0 OPS-001; SDKs P1 BETA-003 | Visible failed work and safe logs before live money |

The paid-demand, pricing, rights, proof adequacy, cold-start and labor-cost risks are [PRD experiments](../product/prd.md#validation-experiments). Their proper response may be narrowing or pausing the product, not writing additional features. The first 1–5 campaigns and later 10/100 checkpoints require observed evidence.

## Risk ownership under the marketplace model

A seller obligation is not an automatic platform guarantee. It also does not remove Billboard.me’s own policy, contractual, statutory or provider duties. **Requires external validation** means provider confirmation or qualified advice is still needed; do not code a presumed exemption.

| Risk | Control boundary | Severity / action and owner | Resolve by |
| --- | --- | --- | --- |
| Misleading guarantees, reach or check badges | Platform controls copy, scoped curation and correcting known errors | High: truthful party duties, verification provenance and publication policy; DECISION-001/PAGE-002 | Before payable terms |
| Incorrect charge/fee/allocation, leaked data or lost records | Platform controls integration, permissions and reconciliation | Critical: signed events, immutable terms, refund caps and private records; PAY-003..006/OPS-001 | Before live money |
| Seller nonattendance, misleading inventory or insufficient display | Inherent seller/sponsor transaction risk; platform can curate, record and enforce stated policies | High: seller responsibility, sponsor evaluation, evidence and bounded support; VALIDATION-001/DECISION-001 | Before purchase; learn at 1–5 |
| Seller lacks rights / event, team or employer bans advertising | Seller must establish rights; platform reviews claims within stated scope; external organizer controls permission | High: actual placement/permission trial; **Requires external validation**; VALIDATION-002 | Before listing approval |
| Provider admission, Indian individuals, turnover/category and settlement | Provider/regulatory constraints, not removable by app terminology | Critical: written exact-flow approval; **Requires external validation**; PAY-001 | Before payment implementation |
| Refund/chargeback after seller already settled | Shared contractual/provider exposure; provider may debit platform even without fulfillment guarantee | Critical: funder, recovery limits, deadlines and loss policy; **Requires external validation**; PAY-001/DECISION-001/PAY-005 | Before live collection |
| Ambiguous terms, liability, advertising disclosures, tax/invoices | Platform controls policy clarity; legal effect requires qualified review | High: seller/sponsor/platform terms and remedies; **Requires external validation**; DECISION-001 | Before accepted paid contract |
| External evidence disappears or parties contest it | Seller supplies evidence; platform controls private record/retention and attribution, cannot guarantee truth | High: agreed formats, sponsor response, unresolved-case handling; advance MEDIA-001 if original retention required; PROOF-001/DECISION-001 | Before promising evidence retention |
| Fee fails to pay for support/losses | Platform controls fee proposal and service scope; willingness to pay is market risk | High: test normal-settlement/non-guaranteed offer, track actual support/fees/losses separately from seller costs; VALIDATION-001/LAUNCH-002 | Before launch and after 1–5 |
| Founder becomes bottleneck | Platform controls curation/support workload; seller owns production and fulfillment | Medium/high: bounded support policy, no mandatory production/proof-verdict/release queue; OPS-001/V8 | First loop and each expansion |

No automatic engineering task for every concern. Test sponsor willingness, seller compliance, proof sufficiency and fee economics using the PRD experiments; narrow/pause if the bridge does not sell. Invite-only reduces trust risk but cannot eliminate it.
