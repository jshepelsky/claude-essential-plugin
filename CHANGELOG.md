# Changelog

## 1.4.0 - 2026-10-22

The delivery workflow release.

### Added
- `/ship`: a 19-step workflow for one feature, with a checkpoint at every step and `resume <slug>` to pick up in a new session. Progress lives in `.claude/work/<slug>/`.
- Workflow skills: `/plan`, `/review-plan`, `/mockup`, `/test-plan`, `/phase-plan`, `/dev-setup`, `/develop`, `/test-all`, `/deploy`, `/env-test`, `/document`.
- Review agents with fresh context, all read-only: `plan-reviewer` (opus), `test-plan-reviewer`, `phase-reviewer`, `plan-consistency-reviewer` (opus), `mockup-reviewer` (with web research).
- `Deploy` section in the `/first-run` profile (environments, trigger, command, pre-deploy, health check, logs, secrets, rollback). Profile schema is now 3; the session-start hook nudges a re-run.
- Session-start hook lists unfinished features and the `/ship resume` command for each.
- `scripts/check.sh` and a GitHub Actions workflow: frontmatter, name-matches-directory, model aliases, JSON/YAML/bash syntax, every referenced agent and skill exists, schema marker in sync.
- `plugin.json` now carries homepage, repository, and license.

### Changed
- `commands/` is gone. Every command moved to `skills/<name>/SKILL.md` per the Claude Code merge of commands into skills. Invocation is unchanged. Skills with arguments carry `argument-hint`; `/ship`, `/commit`, and `/pr` are `disable-model-invocation` so only you start them.
- `/tooling-audit` now checks for legacy command files and current skill frontmatter.
- The workflow never commits, branches, pushes, merges, or tags. Each development phase ends with a suggested branch name and commit message for you.

### Verified
- Agent `model` aliases (`sonnet`, `haiku`, `inherit`) resolve to the current models per the Claude Code docs; no changes needed.

## 1.3.1 - 2026-08-15
- Ownership assigned to JShep Labs LLC.

## 1.3.0 - 2026-07-05
- Profile-first primitives, branch-aware reviews, new hooks, `/changelog`, `codebase-health` workflow.
- `/first-run` becomes the plugin-update path via profile schema versioning.

## 1.2.0 - 2026-06-28
- `humanize` skill for rewriting AI-generated text.

## 1.1.1 - 2026-06-27
- Sharper agent descriptions for proactive auto-invocation.

## 1.1.0 - 2026-06-27
- Triage skills, authoring commands, dependency audit, and the `/first-run` profile.

## 1.0.0 - 2026-06-27
- Initial release.
