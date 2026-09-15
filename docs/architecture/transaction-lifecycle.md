# Transaction lifecycles and authority

**Status:** proposed P0 behavior; no implementation exists. [PRD](../product/prd.md) owns product decisions. This contract prevents later agents from conflating seller approval, order acceptance, payment, execution, proof and bank settlement.

## Actors and common rules

| Actor | Allowed scope |
| --- | --- |
| Public visitor | Read approved public page projection; cannot inspect offers/orders/evidence |
| Verified buyer | Create own request/offer; respond to seller counters; pay own order; view own campaign/proof; raise issue |
| Approved seller | Manage own drafts/inventory; accept/reject/counter incoming proposals; prepare/execute own campaign; submit proof |
| Operator | Approve/suspend supply with stated check scope; support participants, preserve evidence, facilitate resolution; authorize policy/provider-permitted financial remedies |
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

Recommended business order states: `awaiting_payment`, `funded`, `cancelled`, `closed`. Use separate payment/refund/dispute state to explain what happened; do not add every combination to one enum. `closed` means commercial work is resolved, including a cancelled/refunded case, and does not imply a successful campaign. Normal successful closure follows attributed campaign completion and settlement reconciliation, in either sequence. Unresolved support may be administratively closed with an explicit unresolved outcome; that is not campaign success.

| Transition/event | Actor | Required behavior |
| --- | --- | --- |
| Accepted offer → awaiting_payment + held reservation | Acceptance operation | Atomic snapshot of spot/period/template/page claims/price/fee/deliverables, seller/sponsor responsibilities, evidence and settlement policies/terms and both acceptance identities; payment deadline capped by preparation lead time |
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

## Independent states

| Record | Minimal states / facts | Authority and independence |
| --- | --- | --- |
| Order | awaiting_payment / funded / cancelled / closed; closure reason | Agreement container; cancellation or closure is not a refund or proof of performance |
| Payment attempt | created / pending / authorized / captured / failed / cancelled / unknown | Verified provider event/query; capture funds order, browser redirect does not |
| Seller allocation / settlement | allocation pending/confirmed/failed/unknown; bank settlement pending/succeeded/failed/unknown/reversed/provider_restricted | Provider normal schedule; no campaign/proof prerequisite; failed bank settlement does not erase execution |
| Campaign | scheduled / in_progress / fulfillment_reported / completed / cancelled; exception reason and actual dates | Seller reports performance; sponsor acknowledges completion; party-agreed resolution records basis. Time passing is not completion |
| Evidence | submitted / acknowledged / clarification_requested / contested; optional not_required/not_submitted projection | Requirement comes from frozen terms; sponsor responds; operator checks are attributed, never automatic physical truth |
| Support dispute | open / awaiting_party / escalated / resolved / closed_unresolved | Party complaint and facilitated resolution; no automatic settlement freeze |
| Provider dispute | Provider-specific open/won/lost/closed plus response deadline | Provider/network owns financial outcome; do not map support closure to chargeback success |

Expose these as separate panels, not a cross-product enum. A settled-but-unfulfilled order and a completed-but-unsettled campaign are valid exception cases. Financial reporting cannot derive settlement from campaign state.

## Campaign execution and proof

| From → to / event | Actor | Required behavior |
| --- | --- | --- |
| Funded order → scheduled | Confirmed payment handler | Idempotent one-campaign creation, frozen dates/deliverables, seller fulfillment owner and party obligations; no required operator production role |
| Preparation or material change message | Seller/buyer | Record private timestamped message, agreed creative reference, sender and requested response; notify the other party. Seller arranges production unless terms explicitly assign it elsewhere |
| scheduled → in_progress | Seller, at agreed start | Record claimed start; payment confirmed; creative/rights obligations still apply; report exceptions rather than imply platform inspection |
| Active → exception notice | Seller/participant or overdue sweep | Event/date change, missed preparation or nonattendance becomes visible; notify parties. Any amendment requires both parties and a new availability check |
| scheduled/in_progress → fulfillment_reported | Seller | Claim performance with actual dates/context; state evidence remaining under accepted terms |
| Evidence submitted/revised | Seller | Private notes/HTTPS references in P0; preserve prior submissions and claimed capture versus submit time. Native files only when MEDIA-001 is implemented |
| Evidence → acknowledged / clarification_requested / contested | Sponsor | Append attributed response against deliverables. Seller cannot acknowledge on sponsor’s behalf; explanations/resubmissions retained |
| fulfillment_reported → completed | Sponsor acknowledgement, or documented party-agreed resolution | Record completion basis/actor/time; unresolved fulfillment complaint cannot be disguised as verified success. Evidence requirement is per terms; strongest metric requires acknowledged evidence |
| Active → cancelled | Authorized party/operator under accepted policy | Record reason and notification; refund/recovery separate; release inventory only when actual placement/removal permits |
| Sponsor silence / overdue evidence | Reminder/reconciler/operator support | Flag overdue/unconfirmed, follow approved support window. Never assume verification, guaranteed remedy or permission to hold normal settlement |

Founder may facilitate evidence review and record scoped observations, but does not have a required “approve fulfillment then release money” command. No realtime chat, project workflow engine or automatic fraud verdict. External links may expire: retain review summary and references, and obtain an approved secure original-evidence process if required by the contract/provider. No arbitrary server URL fetching or automatic public proof publication.

## Refunds, disputes and normal settlement

| Event | Authority and required handling |
| --- | --- |
| Offer rejected/withdrawn/expired before acceptance | Close proposal; no charge or reservation |
| Unpaid order cancelled | Authorized buyer/server confirms no unresolved capture, releases inventory hold; late capture safeguards remain |
| Seller cannot fulfill / does not attend | Seller responsibility; preserve notices and evidence. Facilitate agreed cancellation/reschedule/remedy under terms; not an automatic platform failure or guaranteed refund. Existing statutory/provider rights remain |
| Buyer cancels funded order | Apply accepted policy with authorized actor, reason, production-cost treatment and party notice; policy eligibility is separate from successful financial refund |
| Event cancelled/rescheduled | Obtain explicit party amendment or replacement agreement; recheck rights/availability; retain original terms and payment history |
| Evidence contested / parties disagree | Open support case; gather terms, messages and both accounts; request clarification. Facilitate agreement or authorized policy remedy; allow unresolved/escalated closure without declaring contested facts true |
| Refund requested/submitted/pending/succeeded/failed/unknown | Authorized policy action; provider confirms. Sum pending/succeeded amounts cannot exceed captured funds; failed/unknown remains visible. No promise of automatic approval or guaranteed recovery |
| Refund after seller allocation/settlement | Track buyer refund and provider reversal/recovery separately. Confirm who funds it and unrecovered exposure if seller balance is insufficient; never assume future earnings |
| Provider dispute/chargeback | Verified event/query; retain response deadline and evidence; use actual permitted provider restrictions and financial remedy. Provider/network outcome is authoritative for financial state |
| Payment captured, fee/share allocated | Provider or durable server operation, according to approved adapter |
| Normal seller settlement | Reconcile amount allocated to each order, provider settlement/bank reference and failure/reversal status. It may occur before the event, before evidence or during support review; there is no founder proof/release check |
| Provider KYC/risk restriction | Record actual provider reason/status and required remediation. Do not label it “awaiting proof” or claim the app can remove it |
| Failed/unknown settlement | Alert seller/operator, query provider before retry, remediate account/bank requirements; preserve completed physical work |
| Settlement reversed after success | Retain original history, reopen financial exception, adjust current qualified success count |

PaymentService allocates seller share if required by the provider's ordinary flow; this is deterministic financial processing, not discretionary fulfillment approval. No mandatory hold/release capability. Optional delayed settlement requires a separately approved contract and provider capability, outside current P0.

Refund operations and external settlement can race. Lock/refund-cap amount intentions in the database, persist unique operation keys and reconcile submitted operations, but do not claim a local lock can stop provider bank settlement. A support complaint does not universally freeze funds. Confirm provider/account loss responsibility before live collection. A non-guarantee product boundary is not an exemption from legal, platform-error or payment-provider obligations.

## Minimal cancellation policy to approve

Before checkout ships, founder publishes a versioned policy covering: unpaid expiry; buyer withdrawal; seller nonperformance; event cancellation; costs after creative/production approval; partial fulfillment; contested or missing agreed evidence and cure period; buyer nonresponse; support window; provider dispute deadlines; post-payout recovery; tax/fee treatment on refund. Also specify seller/sponsor/platform obligations, support authority versus factual adjudication, normal settlement timing, optional evidence, no-response treatment, and any provider-mandated restriction. Store the policy version and actual agreed exceptions in the order. No legal defaults are invented by this blueprint.

## Required adversarial tests

- Two buyers accept overlapping inventory via different listings; exactly one wins. Adjacent allowed intervals work; buffered intervals conflict.
- Double-click/replayed acceptance yields the same order; accepting a stale counter fails; self-acceptance/foreign-order access fails.
- Payment success before checkout response, webhook duplicate, reversed event order, missed webhook, invalid signature, unknown timeout, late capture after hold release and amount mismatch all preserve one funded order/campaign.
- Seller suspension, page edit/unpublish or template version addition does not erase or alter a paid contract.
- Private evidence/messages cannot be read across orders; revisions retain attributed responses; seller self-acknowledgement fails. Evidence changes have no settlement side effect.
- Normal settlement succeeds before campaign/evidence completion; evidence can be acknowledged while settlement fails. Nonattendance after settlement opens a case without erasing financial facts or guaranteeing recovery.
- Refund/settlement race, partial refund cap, unknown payout retry and successful-then-reversed settlement preserve correct amounts and auditable outcomes. Sponsor silence and operator unresolved closure cannot increment verified success.

The financial adapter, operator screens and tests must implement this same authority model. Manual operations reduce UI scope; they do not reduce evidence or money correctness requirements.
