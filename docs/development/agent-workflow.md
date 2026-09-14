# Agent Workflow

This document defines how every coding agent must work on Billboard.me.

## Required sequence for every task

1. **Investigate**
   - Read `AGENTS.md`
   - Read relevant files in `docs/`
   - Inspect existing code, schema, and ADRs
   - Understand dependencies and architectural implications

2. **Create / update GitHub issue**
   - Problem statement
   - Investigation notes
   - Current behavior
   - Proposed solution
   - Affected files
   - Risks
   - Acceptance criteria
   - Alternatives considered

3. **Work in isolation**
   - Create a dedicated branch (`feat/...`, `fix/...`, `chore/...`)
   - Prefer a git worktree when multiple agents are active

4. **Implement**
   - Follow existing architecture and patterns
   - Keep changes focused

5. **Test**
   - `pnpm lint`
   - `pnpm tsc --noEmit` (or the project typecheck script)
   - Relevant unit / integration tests
   - `pnpm build`

6. **Update documentation**
   - Code and docs must stay in sync
   - Update `docs/status/current-state.md` if the overall state changed
   - Add an ADR if a significant decision was made

7. **Commit**
   - Clear, meaningful commit messages

8. **Open Pull Request**
   - Reference the GitHub issue
   - Provide a concise summary and test plan

9. **Stop**
   - Do not merge
   - Do not push to `main`
   - Wait for human review and merge

## Parallel agents

- One agent owns foundation / schema changes at a time
- Highly coupled areas (database migrations, auth, payments) must not be modified concurrently without coordination
- Use worktrees to keep working directories isolated

## Prohibited

- Committing or pushing to `main`
- Merging your own PR
- Force-pushing shared branches
- Editing already-applied migrations
- Adding dependencies without justification
- Changing product requirements silently
