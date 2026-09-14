# First-campaign operating runbook

**Proposed; not a record of a campaign already run.** Founder owns external commercial actions, production coordination, reviews and live financial approval. Implemented operator tools will follow OPS-001; today none exists. [Lifecycle](../architecture/transaction-lifecycle.md) owns transition authority and [PRD](../product/prd.md) owns agreed product policy.

## Before offering a payable placement

Founder verifies seller invitation/identity, control of object, event/team/employer advertising permission, conflicts with existing sponsors and the actual period/location. Trial the active template's production dimensions, printing/removal and delivery timing. Confirm named buyer and budget authority, relevant placement, agreed creative restrictions, proof checklist, total, seller net and cost owner.

PAY-001 must record written provider eligibility and permissible funds flow. DECISION-001 must resolve fee/waiver, invoices/tax responsibilities, cancellation, evidence/retention and dispute policy. Fit the booking horizon, production, campaign, proof and review windows inside the approved provider schedule. If that is impossible, founder revises the commercial model through an ADR before collecting funds.

## Release gate

LAUNCH-001 records nonproduction end-to-end journey and failure cases, deployed auth/media/webhook behavior, migration/backup/restore evidence, operator protection, mail/error visibility and reconciliation. Founder names the support contact, backup operator/escalation contact if available, daily review window and first transaction's maximum exposure. Founder explicitly enables live mode after these gates; no agent changes it merely because tests pass.

## Per-campaign record

| Step | Record / check | Stop or escalate if |
| --- | --- | --- |
| Qualify and publish | Seller/page/listing IDs, rights check, measured variant, dates, approved public claims | Rights, fit or truthful terms unclear |
| Agree | Latest offer revision, both authenticated acceptances, immutable order terms, reserved period | Stale price, unapproved creative category or inventory conflict |
| Collect | Provider-confirmed captured amount/currency/reference; seller account active | Unknown, late or mismatched payment; no execution based on browser return |
| Prepare | Artwork version, buyer approval, production supplier/owner/cost, application/shipping readiness | Missed lead time or incompatible material; obtain explicit resolution |
| Execute | Actual start/end, placement, agreed frequency/context and exceptions | Event cancellation, nonperformance or prohibited sponsorship |
| Review proof | Private files/links, submit/capture dates, checklist result, buyer objection/acknowledgement, reviewer | Missing proof, disputed deliverables, buyer silence needing manual resolution |
| Release/settle | Eligibility decision, provider transfer and bank-settlement references, amount allocated to order | Open dispute/refund, provider restriction, unknown/failed settlement |
| Close and learn | Verified north-star qualification, fees/taxes/production/shipping, founder minutes, feedback/next intent | Any unreconciled amount, reversed payout or unresolved buyer issue |

No direct “mark paid” database edits. If a provider dashboard operation is necessary, record actor/time/reason and provider reference, then reconcile via the app/provider API. Do not upload raw bank/KYC/contract details into public GitHub issues. Public case studies and proof require explicit sharing consent.

## Daily checks during active campaigns

Review unanswered offers, expiring holds with unresolved payment attempts, funding mismatches, preparation deadlines, overdue proof/review, open disputes/provider deadlines, failed notification jobs and unknown/failed/reversed settlements. Run the reconciliation sweep. Failed mail is not an excuse to infer a buyer/seller consent; contact through an authorized fallback and record what happened.

The first live campaign count increments only after payment, completed execution, approved proof and confirmed seller bank payout. Test or founder-funded demonstration orders do not count. Reversals/disputes adjust the current successful count without deleting historical evidence.

## Incident handling

Pause the affected listing/payment/release operation; preserve evidence and record incident owner. Query provider status before retrying ambiguous money movements. Use accepted cancellation/refund policy, submit chargeback evidence within provider deadlines and retain transfer/reversal/refund amounts separately. Failed bank payout may require seller remediation; it does not erase completed physical work. Rescheduling requires both parties' consent and a new availability check. Restore/replay procedures are rehearsed in nonproduction before needed.

After 1–5 campaigns, compare actual cost/labor and buyer/seller feedback against PRD experiments. Decide continue, narrow or stop before building conveniences. Repeat at ten campaigns and each controlled expansion toward one hundred. Publish only sanitized outcomes in current-state and roadmap.
