# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| When creating a GitHub issue, reporting a bug, or requesting a feature. | issue-creation | C:\Users\mauri\.config\opencode\skills\issue-creation\SKILL.md |
| When creating a pull request, opening a PR, or preparing changes for review. | branch-pr | C:\Users\mauri\.config\opencode\skills\branch-pr\SKILL.md |
| When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen". | judgment-day | C:\Users\mauri\.config\opencode\skills\judgment-day\SKILL.md |
| When user asks to create a new skill, add agent instructions, or document patterns for AI. | skill-creator | C:\Users\mauri\.config\opencode\skills\skill-creator\SKILL.md |
| When writing Go tests, using teatest, or adding test coverage. | go-testing | C:\Users\mauri\.config\opencode\skills\go-testing\SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### issue-creation
- Blank issues are disabled — MUST use a template (bug report or feature request)
- Every issue gets `status:needs-review` automatically on creation
- A maintainer MUST add `status:approved` before any PR can be opened
- Questions go to Discussions, not issues

### branch-pr
- Every PR MUST link an approved issue — no exceptions
- Every PR MUST have exactly one `type:*` label
- Branch names MUST match: `^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)\/[a-z0-9._-]+$`
- Commit messages MUST match conventional commits: `^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([a-z0-9\._-]+\))?!?: .+`
- Run shellcheck on modified scripts before pushing

### judgment-day
- Resolve skills BEFORE launching judges — read registry, match by code+task context, inject Project Standards block
- Launch TWO judge sub-agents in parallel via delegate — neither knows about the other
- The orchestrator synthesizes verdicts: Confirmed (both), Suspect A/B (one), Contradiction (disagree)
- WARNING classification: real (normal user can trigger) vs theoretical (contrived scenario)
- Fix and re-judge: max 2 iterations, then ask user to continue or escalate
- Round 1: ask user before fixing. Round 2+: only re-judge for confirmed CRITICALs

### skill-creator
- Create skill only for reusable patterns, not one-offs or trivial tasks
- Skill structure: SKILL.md (required), assets/ (templates/schemas), references/ (local docs only)
- Frontmatter required: name, description (with trigger), license (Apache-2.0), metadata.author, metadata.version
- Don't add Keywords section, don't use web URLs in references, keep examples minimal
- After creating, add to AGENTS.md

### go-testing
- Pure functions → table-driven tests
- TUI state changes → test Model.Update() directly
- Full TUI flows → use teatest.NewTestModel()
- Visual output → golden file testing
- File operations → use t.TempDir()
- Mock dependencies via interfaces for side effects

## Project Conventions

No project convention files found (no AGENTS.md, CLAUDE.md, .cursorrules, GEMINI.md, or copilot-instructions.md).
