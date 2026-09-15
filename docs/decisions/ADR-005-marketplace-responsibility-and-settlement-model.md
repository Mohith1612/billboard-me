# ADR-005: Marketplace responsibility and independent settlement

**Date:** 2026-09-15. **Status:** Marketplace responsibility boundary accepted by explicit founder direction; normal-settlement implementation and specific commercial policies proposed pending PAY-001/DECISION-001. **Issue:** [PLAN-002 #55](https://github.com/Mohith1612/billboard-me/issues/55). ADR-004 is reserved by open PR #54 for environment configuration; do not reuse its number.

## Context

PR #52 correctly separates many domain entities, but its PRD/lifecycle/backlog require founder proof approval before seller settlement. This implies a managed fulfillment and escrow-like operating model that the founder has not chosen. A curated seller who lists jersey sponsorship at a race remains responsible for their promised attendance and display. Marketplace infrastructure must support the transaction without silently guaranteeing physical performance.

## Decision

Billboard.me facilitates curation, listings, negotiation, orders, payments, communication, campaign records, evidence, reputation and disputes. Sellers own listing accuracy, rights and fulfillment; sponsors evaluate the opportunity, provide agreed creative and pay. Billboard.me owns its platform, known representations, policies, secure records, support and correct payment integration. Invite-only selection reduces risk and creates attributable checks; it is not a performance warranty.

Propose normal marketplace collection/allocation/settlement through one approved provider: sponsor payment → platform fee and seller share → provider bank settlement. Payment, allocation, settlement, campaign fulfillment, evidence and dispute status remain separate. Evidence submission/review cannot trigger, authorize or block ordinary settlement. Provider-required restrictions remain authoritative. Any delayed-settlement or guaranteed offering requires a separate explicit decision and supported terms; no custom wallet or escrow.

Campaigns are records of seller fulfillment and participant responses. Sponsor acknowledgement and evidence provenance support history and success measurement; founder support closure cannot manufacture verified physical truth. Support preserves terms/messages/evidence, facilitates party resolution and performs authorized policy/provider actions. It need not decide every contested fact or promise recovery after settlement.

## Consequences

- Removes mandatory founder production, proof-verdict and funds-release work from the first transaction; native uploads can follow a lighter private evidence-reference capability.
- Retains refund/reversal/dispute infrastructure, provider reconciliation and settlement failure handling before live collection. Settled funds can be difficult to recover; non-guarantee language does not eliminate legal, network or contractual liability.
- Requires explicit seller/sponsor/platform obligations, scoped trust labels, cancellation/refund rules, evidence terms and liability allocation. **Requires external validation:** provider admission, individual Indian sellers, turnover/category rules, merchant/payee roles, taxes/invoicing, advance-service restrictions and loss responsibility.
- Normal settlement is a supported capability in candidate documentation, not approval of Billboard.me. Route/Easy Split and qualifying Stripe India flows need actual commercial validation; Dodo currently excludes this marketplace model.
- The north star remains completed paid campaigns with evidence-backed sponsor acknowledgement and successful seller settlement. These are independent outcome facts, not a chronological money-release rule.
- Future managed/guaranteed products remain possible with distinct pricing, obligations, provider controls and founder approval.

## Alternatives

Mandatory proof-gated payout was rejected as the default because it adds an unchosen operating promise and provider constraints. Passive classifieds were rejected because transaction, evidence and support infrastructure are core value. A single giant order status was rejected because settlement can succeed before seller nonperformance, or fail after successful fulfillment. Removing disputes was rejected because seller responsibility does not remove real buyer remedies or platform/provider duties.

[PRD](../product/prd.md), [payment research](../architecture/payments.md) and [lifecycle](../architecture/transaction-lifecycle.md) specify the revised plan. ADR-003's inventory relationships remain proposed; this ADR supplements their responsibility/funds-flow semantics. No schema or product implementation is made here.
