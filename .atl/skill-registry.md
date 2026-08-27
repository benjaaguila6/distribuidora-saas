# Skill Registry — distribuidora-saas

Generated: 2026-08-27 by sdd-init / skill-registry. Cache: regenerated (first generation — no prior registry).

This registry is an INDEX, not a summary. Delegators pass exact `SKILL.md` paths; agents read the full skill source of truth.

## Scanned Sources

| Source | Scope | Status |
| --- | --- | --- |
| `C:\Users\USUARIO\.config\opencode\skills\` | user | indexed (13 skills) |
| `<built-in>` (opencode) | builtin | indexed (1 skill: customize-opencode) |
| Project skill dirs (`skills/`, `.opencode/skills/`, `.atl/skills/`, `.claude/skills/`, `.github/skills/`, ...) | project | none found |
| Project convention files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `GEMINI.md`, `copilot-instructions.md`) | project | none found |

## Registry Contract

- Index only. `SKILL.md` remains the source of truth.
- Skip `sdd-*`, `_shared`, and `skill-registry`.
- Deduplicate by skill name; prefer project-level over user-level.

## Indexed Skills (14)

| Skill | Scope | Trigger / Description | Path |
| --- | --- | --- | --- |
| branch-pr | user | Create Gentle AI pull requests with issue-first checks. Trigger: creating, opening, or preparing PRs for review. | `C:\Users\USUARIO\.config\opencode\skills\branch-pr\SKILL.md` |
| chained-pr | user | Trigger: PRs over 400 lines, stacked PRs, review slices. Split oversized changes into chained PRs that protect review focus. | `C:\Users\USUARIO\.config\opencode\skills\chained-pr\SKILL.md` |
| cognitive-doc-design | user | Design docs that reduce cognitive load. Trigger: writing guides, READMEs, RFCs, onboarding, architecture, or review-facing docs. | `C:\Users\USUARIO\.config\opencode\skills\cognitive-doc-design\SKILL.md` |
| comment-writer | user | Write warm, direct collaboration comments. Trigger: PR feedback, issue replies, reviews, Slack messages, or GitHub comments. | `C:\Users\USUARIO\.config\opencode\skills\comment-writer\SKILL.md` |
| customize-opencode | builtin | Use ONLY when the user is editing or creating opencode's own configuration (opencode.json, .opencode/, ~/.config/opencode/, agents, subagents, skills, plugins, MCP servers, permissions). | `<built-in>` |
| gentle-ai-bench | user | Trigger: bench, journey, journeys, driven mode, gentle-ai-bench, journey corpus, j-numbers, bench axis. Author and verify gentle-ai bench journeys. | `C:\Users\USUARIO\.config\opencode\skills\gentle-ai-bench\SKILL.md` |
| go-testing | user | Trigger: Go tests, go test coverage, Bubbletea teatest, golden files. Apply focused Go testing patterns. | `C:\Users\USUARIO\.config\opencode\skills\go-testing\SKILL.md` |
| issue-creation | user | Create and triage GitHub issues from repository evidence. Trigger: issue creation, bug reports, feature requests, or issue approval. | `C:\Users\USUARIO\.config\opencode\skills\issue-creation\SKILL.md` |
| judgment-day | user | Trigger: judgment day, dual review, adversarial review, juzgar. Run explicit blind dual review with at most two scoped fix/re-judgment rounds. | `C:\Users\USUARIO\.config\opencode\skills\judgment-day\SKILL.md` |
| rdd-defect-workflow | user | Trigger: RDD, receipt-driven development, review authority, receipt/lineage, correction/recovery, delivery gate/kill switch, bounded review defects. Guide work. | `C:\Users\USUARIO\.config\opencode\skills\rdd-defect-workflow\SKILL.md` |
| skill-creator | user | Trigger: new skills, agent instructions, documenting AI usage patterns. Create LLM-first skills with valid frontmatter. | `C:\Users\USUARIO\.config\opencode\skills\skill-creator\SKILL.md` |
| skill-improver | user | Trigger: improve skills, audit skills, refactor skills, skill quality. Audit and upgrade existing LLM-first skills. | `C:\Users\USUARIO\.config\opencode\skills\skill-improver\SKILL.md` |
| systemic-issue-triage | user | Trigger: new issue, bug report, triage, backlog, issue flood, community report, root cause, dead-end, blocked user. Attack issues by root class, never one-by-one. | `C:\Users\USUARIO\.config\opencode\skills\systemic-issue-triage\SKILL.md` |
| work-unit-commits | user | Plan commits as reviewable work units. Trigger: implementation, commit splitting, chained PRs, or keeping tests and docs with code. | `C:\Users\USUARIO\.config\opencode\skills\work-unit-commits\SKILL.md` |

## Excluded (12)

- `_shared` — shared SDD references (not invokable).
- `skill-registry` — the index tool itself.
- `sdd-apply`, `sdd-archive`, `sdd-design`, `sdd-explore`, `sdd-init`, `sdd-onboard`, `sdd-propose`, `sdd-spec`, `sdd-tasks`, `sdd-verify` — SDD pipeline phases, dispatched by the orchestrator.

## Notes

- Engram save of this registry: skipped by explicit user instruction (only `sdd-init/distribuidora-saas` was persisted to memory).
- User-level conventions live in `C:\Users\USUARIO\.config\opencode\AGENTS.md` (persona + Engram protocol); project has no convention files.