# Transaction lifecycles and authority

**Status:** proposed P0 behavior; no implementation exists. [PRD](../product/prd.md) owns product decisions. This contract prevents later agents from conflating seller approval, order acceptance, payment, execution, proof and bank settlement.

## Actors and common rules

| Actor | Allowed scope |
| --- | --- |
| Public visitor | Read approved public page projection; cannot inspect offers/orders/evidence |
| Verified buyer | Create own request/offer; respond to seller counters; pay own order; view own campaign/proof; raise issue |
| Approved seller | Manage own drafts/inventory; accept/reject/counter incoming proposals; prepare/execute own campaign; submit proof |
| Operator | Approve/suspend supply; record manual checks, creative readiness, proof review and commercial resolution; approve refund/release |
| Payment provider | Supplies authoritative payment, refund, transfer and settlement outcomes through verified API/events |
| Reconciler | Executes bounded authorized expiry/retry/reconciliation work; cannot invent payment or proof success |

All mutations validate actor, ownership, current state, version and idempotency key in server code. Financial state changes record actor/source and correlation ID. Reject self-purchase, self-approval of proof and attempts to accept one's own offer revision. Operator interventions require reason and evidence; money states cannot be changed with an unverified checkbox.

## Supply and offer states

| From → to | Actor/trigger | Preconditions and consequences |
| --- | --- | --- |
| Seller invited → approved | Operator plus verified invite redemption | Rights/access qualification; token matches email and is unexpired/single use |
| Seller approved → suspended | Operator | Disable new publishing/acceptance/payment; existing paid obligations enter operator review, not deletion |
| Page draft → pending_review | Seller | Required identity, rights, context, spots, period, deliverables and price present |
| pending_review → published | Operator | Manual rights/fit/copy check; publication snapshot/version; active seller |
| pending_review → draft | Operator | Reason returned to seller |
| published → pending_review | Seller material edit | Unpublish until operator reapproves; existing participants retain private order access; no rewrite of accepted terms |
| published → suspended/archived | Operator / seller unpublishes unsold inventory | Private access for participants remains; reservations and paid orders retained |
| Listing published → expired | Time/reconciler | Booking cutoff reached; no new requests/acceptance; active campaign is independent |
| No offer → submitted | Verified buyer | Published bookable listing, allowed category, clear amount/terms, reply deadline |
| submitted → superseded + new submitted revision | Recipient counters | Same participants/listing/period in P0; new amount or allowed terms, increment version, invalidate old accept action |
| submitted → accepted | Recipient | Current revision unexpired; buyer and seller agreement; atomic order/reservation creation succeeds |
| submitted → rejected | Recipient | Explicit response; no money/order/reservation created |
| submitted → withdrawn | Sender | Not accepted; no fee or payment |
| submitted → expired | Time/reconciler | No reply by `expires_at`; sender sees expired and may start new proposal |

An asking-price request is an offer at list price; seller acceptance records agreement. A seller counter requires buyer acceptance. For P0, changing spot or period creates a new request, avoiding silent reallocation under an existing proposal. Offer expiry cannot exceed the production/booking cutoff. Submitted offers do not reserve inventory; losing a race to another accepted order produces a clear unavailable response, not a second order.

## Orders, reservations and payment

Recommended business order states: `awaiting_payment`, `funded`, `cancelled`, `closed`. Use separate payment/refund/dispute state to explain what happened; do not add every combination to one enum. `closed` means commercial work is resolved, including a cancelled/refunded case, and does not imply a successful campaign. Normal closure follows campaign completion and settlement reconciliation.

| Transition/event | Actor | Required behavior |
| --- | --- | --- |
| Accepted offer → awaiting_payment + held reservation | Acceptance operation | Atomic snapshot of spot/period/template/page claims/price/fee/deliverables/terms and both acceptance identities; payment deadline capped by preparation lead time |
| Create checkout attempt | Buyer/server | Recheck seller payment eligibility, active hold, currency/amount; persist operation key/provider order association before redirect; one intended payable amount |
| Payment authorized | Provider | Record authorization; order remains unfunded until capture confirmed. Do not leave authorization open until proof |
| Payment fails/cancels | Provider or verified API result | Mark attempt failed; keep order retryable until deadline. Another attempt may be created under the same order; do not create another campaign |
| Browser returns success | Buyer browser | Show pending and fetch server state; never mark funded from query parameters/client payload |
| Captured correct payment → funded, reservation confirmed, campaign created | Verified webhook/API plus DB transaction | Match order, account, currency and amount; dedupe by provider payment ID; exactly one campaign per order; append receipt/activity and notification job |
| Payment deadline passes with no capture | Reconciler | Lock order/spot, query unresolved provider attempts before release; mark unpaid order cancelled and release hold only when safe |
| Capture arrives after cancellation/hold release | Provider | Never seize inventory from a new buyer or reactivate automatically. Mark financial exception and arrange refund/reconciliation; no campaign starts |
| Amount/currency mismatch or duplicate capture | Provider | Quarantine exception, alert operator; prevent extra campaign/fulfillment; reconcile and refund excess through explicit operation |
| Unknown outcome after network timeout | Server | Record unknown; look up provider operation before retry. Do not assume failure or issue a second charge/transfer |

P0 defaults proposed in the PRD: 48-hour offer response, 24-hour payment deadline. Operator may choose shorter near-term periods before acceptance, but cannot extend an expired deal without revalidation and explicit new terms. The hold deadline is not the campaign end. Scheduled reconciliation can run inside the monolith via the selected host's scheduler; a reliable operator-triggered sweep is a P0 fallback, with expiry also checked on every acceptance/payment attempt. No Redis lock service.

## Campaign execution and proof

| From → to | Actor | Required behavior |
| --- | --- | --- |
| Funded order → scheduled/preparing | Confirmed payment handler | Idempotent campaign creation, frozen deliverables and dates, named responsible operator |
| preparing → ready | Operator after buyer creative approval and seller confirmation | Record actual creative version, fit/printing/application/shipping readiness; initial rights/exclusivity still valid |
| ready → in_progress | Seller/operator, at agreed start | Start time and evidence of application; payment confirmed; no silent substitution of asset or sponsor |
| preparing/ready → exception | Deadline missed/event changed | Record issue; notify parties; cancel/refund or explicitly agree revised terms and recheck reservation; do not start late by default |
| in_progress → awaiting_proof | End of execution or seller completion | Record actual dates and required remaining evidence; reaching scheduled end does not complete the campaign |
| awaiting_proof → under_review | Seller | Submit private validated files/links plus checklist; preserve submit time and claimed capture time separately |
| under_review → awaiting_proof | Operator requests changes | Required reason and missing deliverables; original evidence retained; revised deadline mutually clear |
| under_review → completed | Operator | Criteria satisfied, buyer acknowledged or review window/escalation resolved manually; approval evidence and timestamp; no blocking dispute |
| Any active state → cancelled | Operator per accepted policy | Execution stops; refund/financial resolution tracked separately; proof/archive retained; inventory release depends on actual ongoing placement/removal |

An overdue campaign or proof submission becomes an operator task/exception; it is never automatically counted as complete. Buyer silence at 72 hours escalates to founder review, not automatic proof approval. Suspected fraud, disallowed content, event cancellation or failure to remove old branding blocks completion/rebooking as appropriate. Supporting a timestamped exception/reason is sufficient; a configurable workflow engine is not.

## Refunds, disputes and payouts

| Event | Authority and required handling |
| --- | --- |
| Seller rejects before acceptance | Recipient closes offer; no order or charge |
| Buyer withdraws before acceptance | Sender closes offer; no charge |
| Buyer cancels unpaid order | Buyer/server cancels eligible order, confirms no unresolved capture, releases hold; late capture handling still applies |
| Seller cannot fulfill paid order | Operator records cause; agreed policy normally leads to refund or buyer-approved reschedule; never force a credit wallet |
| Buyer cancels funded order | Operator evaluates accepted cancellation terms and production costs; creates approved full/partial refund request; preserve decision and buyer notice |
| Event cancelled/rescheduled | Operator checks new date/rights/availability with both parties; explicit amendment or replacement order with audit trail; original payment/terms retained |
| Proof disputed/rejected | Freeze unreleased seller settlement; request new proof or decide refund/resolution against agreed deliverables |
| Refund requested/submitted/pending/succeeded/failed/unknown | Operator authorizes amount; provider confirms outcome. Sum pending/succeeded refund amounts cannot exceed captured funds. Failure/unknown is a visible unresolved task |
| Refund after seller allocation | Provider-specific linked transfer reversal/recovery; record reversal separately. Do not assume refund automatically recovers seller money |
| Refund after payout | Provider-approved recovery/funding process; no assumption of future seller earnings. Record unrecovered exposure and operator decision |
| Buyer opens provider dispute/chargeback | Verified provider event creates/updates dispute; track evidence deadline; freeze further release where permitted; operator submits existing evidence; provider outcome authoritative |
| Proof approved and campaign completed | Compute payout eligibility from captured money, fee/cost snapshot, completed proof, account capability and no blocking dispute; operator approves release |
| Transfer/release requested | Durable unique operation; provider holds/releases according to approved agreement; request success is not bank success |
| Bank settlement pending/succeeded | Reconcile provider settlement and allocation amounts, bank reference and order; only succeeded qualifies for north star |
| Bank settlement failed/unknown | Record reason, notify operator/seller, remediate provider onboarding/bank state; reconcile before controlled retry; do not mark campaign unexecuted |
| Bank settlement reversed after success | Reopen financial exception; adjust current successful-campaign count; retain original success and reversal history |

Refund and release can race. Lock order financial eligibility before queuing either operation; recheck open disputes and refund intents before release submission, and reconcile already submitted provider operations. If the provider settles automatically before proof, the approved product policy must reflect that; the application cannot guarantee a hold by hiding a release button.

## Minimal cancellation policy to approve

Before checkout ships, founder publishes a versioned policy covering: unpaid expiry; buyer withdrawal; seller nonperformance; event cancellation; costs after creative/production approval; partial fulfillment; unacceptable proof and cure period; buyer nonresponse; support window; provider dispute deadlines; post-payout recovery; tax/fee treatment on refund. Store the policy version and actual agreed exceptions in the order. No legal defaults are invented by this blueprint.

## Required adversarial tests

- Two buyers accept overlapping inventory via different listings; exactly one wins. Adjacent allowed intervals work; buffered intervals conflict.
- Double-click/replayed acceptance yields the same order; accepting a stale counter fails; self-acceptance/foreign-order access fails.
- Payment success before checkout response, webhook duplicate, reversed event order, missed webhook, invalid signature, unknown timeout, late capture after hold release and amount mismatch all preserve one funded order/campaign.
- Seller suspension, page edit/unpublish or template version addition does not erase or alter a paid contract.
- Private evidence cannot be read across orders; resubmission retains prior review; rejected proof cannot release funds.
- Concurrent refund/release, partial refund cap, unknown payout retry and successful-then-reversed settlement preserve correct amounts and auditable outcomes.

The financial adapter, operator screens and tests must implement this same authority model. Manual operations reduce UI scope; they do not reduce evidence or money correctness requirements.
