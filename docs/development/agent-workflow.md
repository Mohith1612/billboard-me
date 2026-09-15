# Agent workflow and documentation authority

[AGENTS.md](../../AGENTS.md) is the canonical rule source; [CLAUDE.md](../../CLAUDE.md) deliberately only points there. The founder owns product, architecture, final review and merge. Agents investigate and implement a bounded issue; they do not approve their own architecture or change requirements silently.

## Pick up a task

1. Read AGENTS.md fully, [current state](../status/current-state.md), the issue and its linked dependencies. Read relevant PRD sections, domain glossary, architecture and accepted/proposed ADR status. Inspect actual code; do not infer implementation from paths.
2. Verify dependencies are human-merged/accepted with evidence. The [backlog](../status/backlog.md) is topologically ordered and the [roadmap](../status/roadmap.md) shows independent lanes. FOUNDATION-001 and FOUNDATION-002 merged in PR #53 and PR #54. FOUNDATION-003 (#6) is next; extend the existing environment, client-boundary and waitlist checks into the general test harness.
3. Update the existing issue with investigation and actual affected files; create a new issue only for genuinely new scope. Every planned issue has Problem, Context, Dependencies, Scope, Out of scope, Proposed implementation, Files/components likely affected, Acceptance criteria, Tests required, Documentation required, Risks and Notes.
4. Create a dedicated branch (`fix/foundation-001-waitlist-access`, for example). Use a separate worktree for each simultaneously coding agent. Record issue owner, touched modules, shared files, prerequisite branches and intended merge order in the issue before parallel changes.
5. Implement only that issue using existing modules and installed version documentation. When schema/auth/payment/state contracts need a change, coordinate with their current owner first. Return unresolved product decisions to the founder in the issue with concrete options/evidence; continue unrelated authorized work.
6. Run required lint, typecheck, relevant tests and build; use [testing guidance](testing.md). Record actual results and untested limits. Re-test after changes/rebases that affect behavior. Keep migration generation and edits sequential.
7. Update the authoritative docs in the same PR. New capabilities change current-state; changed dependencies update issue and roadmap/backlog; meaningful architecture tradeoffs need an ADR. Proposed decisions remain labeled proposed until founder approval.
8. Commit focused changes, push the task branch, open a PR referencing the issue and its validation. Describe final behavior, test evidence, limits and decision points. Keep source, migration and docs coherent. Stop for founder review/merge; issue closure alone is not acceptance evidence.

The AGENTS.md prohibitions apply throughout: no main commits/pushes, self-merges, force-pushes, secret commits, production development credentials, applied-migration edits, invented product scope or removal of tests to hide failure.

## Parallel work contract

One owner sequences schema migrations, auth identity/permissions and payment/lifecycle changes. Independent agents may build presentation against agreed fixtures/DTOs, canonical SVGs, provider research or tests in separate files/worktrees. Fixture-only UI is not backend completion. Each integration PR runs the relevant combined journey after prerequisites merge. Do not use raw SQL edits to bypass domain transitions during testing or operations.

Handoff includes: exact issue/branch/commit, dependency state, changed files, remaining acceptance, tests/commands/results, decisions awaiting founder, and next issue. A full handoff does not authorize another agent to merge. Founder intervention and external communication/live financial execution follow explicit task authorization, not assumptions in an issue template.

## Documentation authority

| Source | Authoritative for | Read/update trigger |
| --- | --- | --- |
| AGENTS.md | Engineering rules and founder/agent authority | Every task; rule changes only here |
| CLAUDE.md | Pointer to AGENTS.md | Keep pointer; do not duplicate rules |
| README.md, setup.md | Entry point and current local setup | Onboarding/environment changes |
| product/prd.md | Product scope, UX, stages, Not Yet, metrics, experiments, founder decisions | Any product behavior or scope decision |
| CONTEXT.md | Canonical domain vocabulary | Schema/lifecycle/naming change; glossary only |
| architecture/overview.md | Module/runtime/storage strategy and alternatives | Integration or architecture work |
| architecture/database.md | Conceptual schema, constraints, ownership and migration plan | Any schema/access change |
| architecture/transaction-lifecycle.md | State/actor/money invariants and failure behavior | Offers/orders/campaigns/proof/payments |
| architecture/assets-and-surfaces.md, authentication.md | Template and identity contracts | Corresponding implementation |
| architecture/payments.md, deployment.md | Dated provider evidence, feasibility and open gates | Provider/runtime work; reverify changing facts |
| decisions/ADR-* | Accepted/proposed consequential decisions and rationale | Meaningful architecture decision; preserve accepted history |
| design/design-system.md | Current design intent and future product extension | UI/design work; CSS is actual token implementation |
| status/current-state.md | Verified implementation and audit evidence limits | Actual shipped/verified state changes |
| status/known-issues.md | Open gaps and owner issues | Discovery/resolution of real gaps |
| status/product-model-reconciliation.md | PLAN-002 change rationale and disposition of all 48 original issues | Marketplace responsibility/settlement reconciliation; historical comparison, not another PRD |
| status/roadmap.md, backlog.md | Stages, dependency graph and issue navigation | Ordering, gate or dependency changes |
| GitHub issues | Bounded implementation/evidence acceptance and progress | Before/during/after task; link PR |
| development/testing.md, operating-first-campaign.md | Verification and founder-run release/campaign operations | Testing/release/support changes |

Empty duplicates consolidated by PLAN-001: product vision/overview/marketplace-model/user-flows → PRD; terminology → CONTEXT; architecture application-architecture → overview; development branching → this workflow. Their empty files are removed, not retained as competing authorities. Authentication/assets/database/payments/deployment/testing/roadmap/known-issues were empty and are now substantive. No nonempty accepted ADR was deleted or rewritten.

Authority is scoped: code demonstrates implementation, PRD describes intended behavior, ADR status records approval, and GitHub issues bound tasks. If they disagree, record the discrepancy and resolve it explicitly; never mark future design as shipped to make documentation look consistent.
