# Product-model reconciliation

**Date:** 2026-09-15. **Owner:** founder. **Task:** [PLAN-002 #55](https://github.com/Mohith1612/billboard-me/issues/55). **Audited main:** `55e41d4`. Planning-only changes; no product code, migrations or dependencies added.

## What was inspected

Verified PR #52 merged as `b9bea6d` and PR #53 merged as `55e41d4`; #4 is closed. Read the PRD, all architecture documents, ADRs, glossary, agent instructions, design/development/status guidance, current source/config/schema/migration/test evidence and all 48 GitHub issue specifications (#4–#51), including dependencies, scope, tests and acceptance. PR #54 is open for #5 at head `dc98cd9`; its source/ADR-004 are not in this baseline. Its documented changes must be preserved during later integration, not reported as merged functionality here.

The current product remains landing + two waitlists + POST API/database persistence, now with repository RLS/client-role revokes and targeted SQL/shell tests from PR #53. No completed marketplace, seller/buyer flow, auth, production payments, native evidence uploads or general Vitest/Playwright/CI suite exists in audited main. Production migration application remains unverified. Current-state retains those distinctions.

## Changed model and removed assumptions

| Area | Previous blueprint assumption | Reconciled plan |
| --- | --- | --- |
| Marketplace role | Curated service with founder execution/proof/settlement control | Complete marketplace infrastructure; seller fulfills, sponsor evaluates, platform owns its infrastructure/support duties |
| Invite-only | Manual onboarding and approval | Also an explicit scoped trust layer; identity/context checks reduce risk without guaranteeing attendance |
| Production | Founder printing/shipping/readiness often mandatory | Seller owns fulfillment; any named platform assistance is separately agreed; unsupported marketing corrected in PAGE-002 |
| Money | Funded → approved proof/completed → founder release → bank settlement | Sponsor → provider fee/share allocation → normal settlement; no proof prerequisite |
| Proof | Mandatory operator checklist verdict controls completion/payout | Private evidence and sponsor response, attributed checks and dispute record; no settlement side effect |
| Campaign completion | Founder approves delivery | Sponsor acknowledgement or documented party resolution; seller report/silence/unresolved closure do not verify success |
| Disputes | Founder determines commercial truth, freezes unreleased money | Gather records, facilitate resolution and authorized remedies; actual provider restrictions/outcomes govern funds; unresolved cases remain explicit |
| First-loop media | Native photo pipeline on P0 critical path | Private text/HTTPS references and response history P0; validated native uploads P1 unless retention obligations require earlier delivery |
| Success measurement | Often implied sequential proof then payout | Same strongest outcome conjunction with sponsor-reviewed evidence provenance; settlement can precede proof; other completions reported separately |

Not removed: seller and sponsor onboarding, listing approval, canonical visuals, share pages, offers/counters, frozen terms, exclusive reservations, KYC, correct payment integration, commission, refunds/reversals/disputes, private communication, campaign records, evidence, notifications, reconciliation or future reputation. This is not passive classifieds. It is also not a legal determination that the platform has no liability.

## Payment/provider consequences

Normal settlement is the recommended default pending actual provider/contract approval. Fee, seller share, provider allocation and bank settlement are separate facts. A seller can settle before failing to attend an event; a seller who performs can still have a bank failure. Preserve both truths and support remedies without inventing a wallet or payout-success toggle.

[Payment research](../architecture/payments.md) was rechecked against primary sources on September 15. Route and Easy Split document ordinary settlement with optional delays. Route’s published turnover condition still matters without holds. Stripe’s India-specific documentation supports some domestic direct/destination charge fee flows, so it remains a conditional candidate; invitation, account/category/individual eligibility and methods require confirmation. Dodo still excludes the model. No provider was contacted and no integration/live action was performed.

**Requires external validation:** exact merchant/payee entity, individual Indian sellers, turnover and category approval, KYC, geographic/payment-method scope, tax/invoices, advance-service limits, schedules/risk restrictions, post-settlement refunds/recovery and legal/provider loss liability. Choosing a provider from API availability or assuming no-hold means no marketplace obligations is prohibited. Deferred/managed/guaranteed products are future explicit decisions.

## Issue-by-issue disposition

All 48 issue IDs are retained. **26 A unchanged; 21 B modified; 1 F re-prioritized with scope clarification.** No C split, D merged, E removed or G converted-to-research dispositions. Existing validation/decision issues already cover the external unknowns; their scope is sharpened instead of creating replacement work. No new product issue was created. #55 is solely this planning reconciliation task, outside the 48-item backlog.

| Issue | Disposition | Priority | Reason / acceptance change |
| --- | --- | --- | --- |
| [FOUNDATION-001 #4](https://github.com/Mohith1612/billboard-me/issues/4) | A — Unchanged | P0 | Closed by merged PR #53; retain historical access-control acceptance and tests. |
| [FOUNDATION-002 #5](https://github.com/Mohith1612/billboard-me/issues/5) | A — Unchanged | P0 | Environment contract is independent of the business model; existing PR #54 remains the active implementation. |
| [FOUNDATION-003 #6](https://github.com/Mohith1612/billboard-me/issues/6) | B — Modified | P0 | Preserve PR #53 targeted tests; describe the missing general harness accurately. |
| [FOUNDATION-004 #7](https://github.com/Mohith1612/billboard-me/issues/7) | A — Unchanged | P0 | CI and browser smoke requirements remain needed. |
| [FOUNDATION-005 #8](https://github.com/Mohith1612/billboard-me/issues/8) | B — Modified | P0 | Native media runtime checks become conditional on enabling uploads. |
| [VALIDATION-001 #9](https://github.com/Mohith1612/billboard-me/issues/9) | B — Modified | P0 | Validate willingness to purchase seller-delivered sponsorship without an inherent platform guarantee. |
| [VALIDATION-002 #10](https://github.com/Mohith1612/billboard-me/issues/10) | B — Modified | P0 | Physical rights/fit trials remain; seller normally owns production and fulfillment. |
| [PAY-001 #11](https://github.com/Mohith1612/billboard-me/issues/11) | B — Modified | P0 | Research normal marketplace fee/share settlement, individual sellers and actual eligibility; remove mandatory hold testing. |
| [DECISION-001 #12](https://github.com/Mohith1612/billboard-me/issues/12) | B — Modified | P0 | Founder decides explicit party/platform responsibilities, evidence policy and normal settlement; no hold-window default. |
| [DOMAIN-001 #13](https://github.com/Mohith1612/billboard-me/issues/13) | B — Modified | P0 | Keep inventory model; add independent settlement and attributed completion invariants. |
| [AUTH-001 #14](https://github.com/Mohith1612/billboard-me/issues/14) | A — Unchanged | P0 | Verified identities, scoped authorization and financial-operator security still apply. |
| [AUTH-002 #15](https://github.com/Mohith1612/billboard-me/issues/15) | A — Unchanged | P0 | Invitations and seller access remain the curated trust boundary, separate from KYC. |
| [DOMAIN-002 #16](https://github.com/Mohith1612/billboard-me/issues/16) | A — Unchanged | P0 | Versioned deterministic template geometry remains correct. |
| [DOMAIN-003 #17](https://github.com/Mohith1612/billboard-me/issues/17) | A — Unchanged | P0 | Seller-owned assets, rights attestation and instantiated spots remain correct. |
| [SELLER-001 #18](https://github.com/Mohith1612/billboard-me/issues/18) | A — Unchanged | P0 | Simple owned-profile/asset forms remain valid. |
| [SELLER-002 #19](https://github.com/Mohith1612/billboard-me/issues/19) | B — Modified | P0 | Snapshot party obligations, evidence and settlement policy in seller listing terms. |
| [SELLER-003 #20](https://github.com/Mohith1612/billboard-me/issues/20) | B — Modified | P0 | Scope curation/verification badges to actual checks. |
| [PAGE-001 #21](https://github.com/Mohith1612/billboard-me/issues/21) | B — Modified | P0 | Sponsorship page supports informed independent evaluation and truthful settlement terms. |
| [PAGE-002 #22](https://github.com/Mohith1612/billboard-me/issues/22) | B — Modified | P0 | Correct existing fee/printing/proof-release promises under approved policies. |
| [BUYER-001 #23](https://github.com/Mohith1612/billboard-me/issues/23) | A — Unchanged | P0 | Verified buyer intent and asking-price requests still precede seller acceptance. |
| [BUYER-002 #24](https://github.com/Mohith1612/billboard-me/issues/24) | A — Unchanged | P0 | Reject, withdraw and counteroffer rules are unchanged. |
| [ORDER-001 #25](https://github.com/Mohith1612/billboard-me/issues/25) | B — Modified | P0 | Freeze commercial responsibility/evidence/settlement terms without weakening reservation invariants. |
| [ORDER-002 #26](https://github.com/Mohith1612/billboard-me/issues/26) | A — Unchanged | P0 | Private frozen-order UI and unpaid inventory expiry remain valid. |
| [PAY-002 #27](https://github.com/Mohith1612/billboard-me/issues/27) | A — Unchanged | P0 | Provider onboarding/KYC and eligibility stay required, separate from curation. |
| [PAY-003 #28](https://github.com/Mohith1612/billboard-me/issues/28) | A — Unchanged | P0 | Checkout amount/identity/idempotency and inventory-reservation checks stay required; “hold” here reserves inventory. |
| [PAY-004 #29](https://github.com/Mohith1612/billboard-me/issues/29) | B — Modified | P0 | Keep signed funding/idempotency guarantees; normalize settlement events independently. |
| [MEDIA-001 #30](https://github.com/Mohith1612/billboard-me/issues/30) | F — Re-prioritized (scope clarified) | P0 → P1 | Native files are P1; P0 uses private references/notes. Advance only if approved retention terms require it. |
| [CAMPAIGN-001 #31](https://github.com/Mohith1612/billboard-me/issues/31) | B — Modified | P0 | Replace mandatory founder production control with seller fulfillment records and participant communication. |
| [PROOF-001 #32](https://github.com/Mohith1612/billboard-me/issues/32) | B — Modified | P0 | Evidence is private trust/dispute history with sponsor response, not platform truth or funds approval. |
| [PAY-005 #33](https://github.com/Mohith1612/billboard-me/issues/33) | B — Modified | P0 | Keep financial remedies P0; distinguish support facilitation from provider disputes and guaranteed recovery. |
| [PAY-006 #34](https://github.com/Mohith1612/billboard-me/issues/34) | B — Modified | P0 | Track provider allocation and normal bank settlement independently of proof; retain robust financial failure handling. |
| [OPS-001 #35](https://github.com/Mohith1612/billboard-me/issues/35) | B — Modified | P0 | Keep operator support/communication/reconciliation; remove proof verdict and payout-release chores. |
| [LAUNCH-001 #36](https://github.com/Mohith1612/billboard-me/issues/36) | B — Modified | P0 | Rehearse independent settlement/evidence, nonperformance after payout and bounded support; media conditional. |
| [LAUNCH-002 #37](https://github.com/Mohith1612/billboard-me/issues/37) | B — Modified | P0 | First paid loop measures seller delivery and independently settled funds; remove founder execution/release requirement. |
| [BETA-001 #38](https://github.com/Mohith1612/billboard-me/issues/38) | A — Unchanged | P1 | Cohort learning and operating-capacity gate remain valid under the revised metric. |
| [BETA-002 #39](https://github.com/Mohith1612/billboard-me/issues/39) | A — Unchanged | P1 | Observed-abuse controls remain conditional on evidence. |
| [BETA-003 #40](https://github.com/Mohith1612/billboard-me/issues/40) | A — Unchanged | P1 | Redacted monitoring uses durable financial truth; no proof-release assumption. |
| [BETA-004 #41](https://github.com/Mohith1612/billboard-me/issues/41) | A — Unchanged | P1 | Repeat-use convenience still waits for observed friction. |
| [BETA-005 #42](https://github.com/Mohith1612/billboard-me/issues/42) | A — Unchanged | P1 | Seller-preapproved instant checkout remains a gated experiment. |
| [PUBLIC-001 #43](https://github.com/Mohith1612/billboard-me/issues/43) | A — Unchanged | P2 | Public access still needs admission, policy and support readiness. |
| [PUBLIC-002 #44](https://github.com/Mohith1612/billboard-me/issues/44) | A — Unchanged | P2 | Reviewed public applications preserve scoped seller eligibility. |
| [PUBLIC-003 #45](https://github.com/Mohith1612/billboard-me/issues/45) | A — Unchanged | P2 | Curated catalogue and simple filters are unaffected. |
| [PUBLIC-004 #46](https://github.com/Mohith1612/billboard-me/issues/46) | B — Modified | P2 | Public earned history uses attributed evidence and transaction records, not platform performance certification. |
| [PUBLIC-005 #47](https://github.com/Mohith1612/billboard-me/issues/47) | A — Unchanged | P2 | Capacity, support cost and financial-quality measurements still apply; proof/settlement timing is independent. |
| [FUTURE-001 #48](https://github.com/Mohith1612/billboard-me/issues/48) | A — Unchanged | P3 | Additional template demand/rights validation remains dormant. |
| [FUTURE-002 #49](https://github.com/Mohith1612/billboard-me/issues/49) | A — Unchanged | P3 | Procurement/bundle experiment already includes liability and cardinality review. |
| [FUTURE-003 #50](https://github.com/Mohith1612/billboard-me/issues/50) | A — Unchanged | P3 | Pricing/matching/auction intervention remains an evidence-only future experiment. |
| [FUTURE-004 #51](https://github.com/Mohith1612/billboard-me/issues/51) | A — Unchanged | P3 | Additional corridor requires its own entity/provider/legal/recovery validation. |

**Priority totals:** previously 34 P0 / 5 P1 / 5 P2 / 4 P3; now **33 / 6 / 5 / 4**. One P0 (#4) is already completed; 32 remain open. MEDIA-001 (#30) alone changes priority. No issue state is changed by this reconciliation. Specific product/policy choices remain pending founder approval even though their planning criteria are now reconciled.

**Dependency changes:** CAMPAIGN-001 drops MEDIA-001; PAY-006 drops PROOF-001 and explicitly depends on PAY-004 plus PAY-005; OPS-001 explicitly joins CAMPAIGN-001/PROOF-001 with its existing PAY-006/PAGE-002 prerequisites. These changes allow financial settlement integration before evidence UI without removing evidence/support from overall launch readiness. The local backlog is topologically ordered and both issue bodies and roadmap carry these edges.

## Smallest end-to-end transaction

Previous: seller → listing → sponsor → payment → campaign → proof → Billboard.me review → payout.

Reconciled: invited seller → approved one-spot listing/page → sponsor request/offer → seller acceptance (or buyer acceptance of seller counter) → frozen/reserved order → payment. Then **provider normal settlement** runs independently of **seller fulfillment → agreed/expected evidence → sponsor response → campaign outcome**. Keep private participant messages and cancellation/refund/dispute paths. The strongest first-campaign metric waits for all qualifying outcomes; the seller’s settlement does not wait for that metric.

**This is the first thing the team should make work end-to-end.** One seller, one buyer, one MacBook lid or garment chest, one period, INR, one provider. No mandatory founder production, physical truth verdict or proof-to-payout release. Optional evidence in an accepted contract is permitted by the model; a no-evidence order can complete/settle but is not counted as a verified-proof campaign. Founder approves the pilot evidence/retention rule before acceptance.

## Founder decisions still required

The responsibility boundary follows explicit founder direction. Approve the actual fee/waiver and cost/tax treatment; scoped seller/listing checks; provider and merchant/payee flow; normal settlement and any provider restrictions; cancellation/refund/recovery policy; support versus provider dispute authority and loss liability; seller/sponsor/platform terms; evidence requirement/formats/retention, optional founder checks, sponsor silence and metric definition; any exceptional proof-linked settlement/guarantee; URL/domain choices and hosting/storage. External validation and founder approval are separate gates. The [PRD decision register](../product/prd.md#founder-decision-register) assigns owners and existing issues.

## Documentation and integration

PRD owns scope/obligations; lifecycle owns independent states/authority; database owns conceptual rows/constraints; payments owns dated provider evidence; roadmap/backlog own dependencies. ADR-005 records this meaningful responsibility/funds-flow decision. ADR-003 keeps its inventory proposal and links the refinement; accepted ADR-001/002 remain intact. ADR-004 is already used in PR #54 and is not overwritten. `application-architecture.md` was an empty duplicate removed by PR #52; update the authoritative `overview.md` rather than recreate it. CLAUDE.md remains only a pointer to canonical AGENTS.md. Setup/source files require no business-model edits.

PR #54 overlaps README, database, testing, current-state, known-issues and backlog. Preserve its env/getDb/test facts when that PR merges while retaining this responsibility model and revised dependencies. Whichever PR merges second must reconcile the overlap against actual main and rerun relevant checks. Do not solve documentation conflicts by dropping either set of changes or claiming an open PR is shipped.

## Next implementation issue and parallel work

Exactly one recommended issue to finish now: **[FOUNDATION-002 #5 — Validate environment and document database connection roles](https://github.com/Mohith1612/billboard-me/issues/5)**. Its existing PR #54 is open: continue review/fixes there, then founder merge. Do not commission a duplicate implementation. The validated env/DB-role boundary is prerequisite to the broader harness and CI. No payment/domain feature should jump ahead of its unresolved gates.

Founder demand/rights/provider validation can run alongside this foundation lane. Later template art, page presentation and campaign presentation can run in isolated files after agreed contracts; settlement and evidence are independent runtime paths but share reviewed financial/domain interfaces. Keep auth/identity, schema migrations, payment adapter/state changes and architectural decisions under sequential ownership. Normal settlement independence is not permission for two agents to edit the financial schema simultaneously.

## Verification

The reconciliation validates issue coverage/dispositions, priority labels, unchanged bodies, dependency graph and Markdown links/anchors. Existing repository lint/typecheck/build and targeted checks are recorded in the reconciliation PR with actual results and limits. No product tests were invented for prose; no migration was generated or applied to a shared database. Git diff must contain Markdown only. Remote affected issue bodies are compared with the intended specifications after publishing; valid unchanged issues are left untouched.

Verified on 2026-09-15, Node 22.14.0 / pnpm 10.15.1:

| Check | Result / limit |
| --- | --- |
| Markdown and live issue reconciliation | Pass: 26 Markdown documents, 86 local links/anchors, all 48 issue bodies/titles/priority labels/states and table dependencies; acyclic; 26 unchanged/22 edited |
| `pnpm lint` | Pass |
| `pnpm typecheck` | Pass |
| `pnpm test:client-boundary` | Pass: database import rejected from Client Component |
| `pnpm test:db:waitlist` | Pass: disposable PostgreSQL 16 fresh/upgrade, role-denial and both real POST routes; test resources cleaned up |
| `pnpm build` | Pass using an explicit dummy localhost database URL and public site origin; no live database queried |
| `git diff --check` / scope | Pass; 22 Markdown files only, including two new documents; no product source, dependency or migration changes |

No commercial/provider approval, deployed runtime test, live transaction or production database verification is claimed. Existing PR #53 test teardown was wrapped in an isolated process group for this run so its dev-server children were cleaned up; the test scripts themselves were not changed. PR #54 already proposes a teardown fix. The research and live issue updates do not authorize implementation of unresolved policy choices.
