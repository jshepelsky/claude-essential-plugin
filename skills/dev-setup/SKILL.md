---
name: dev-setup
description: Create and refresh the files that help Claude develop this feature well - CLAUDE.md, the essentials profile, and per-area notes. Step 10 of /ship.
argument-hint: [slug]
---

Dev setup: $ARGUMENTS

Never commit, branch, or push. This skill edits `CLAUDE.md`, `.claude/` files, and the work folder only.

Read `.claude/essentials-profile.md`, `CLAUDE.md`, any `.claude/rules/` or `docs/` the project keeps, and the full work folder.

## Step 1 - Profile

If there's no profile, run `/first-run` now. If there is one, re-verify the `Commands` and `Deploy` sections against the repo and fix what's stale.

## Step 2 - `CLAUDE.md`

Make sure it imports the profile (`@.claude/essentials-profile.md`) and says, briefly, what Claude needs every session and can't infer fast: how to run the app and tests, the hard conventions (with the file to copy for each), the things that have burned people before, and where the work folders live. Don't paste the profile into it; don't write a novel. If it's over about 150 lines, move area-specific detail to `.claude/rules/<area>.md` or `docs/` and link it.

## Step 3 - Feature notes

Write `.claude/work/<slug>/notes.md`: the handful of facts a developer needs open while building this feature. Commands scoped to this area, the exact files to copy patterns from, fixtures and test accounts, the local URLs for each screen, env vars this feature needs locally, and gotchas found during planning. `/develop` reads this first and keeps it current.

## Step 4 - Tooling check

Confirm the test runners from `test-plan.md` are installed and runnable (`--version`, a list or dry run). If Playwright, simulators, or coverage tooling are missing, give the user the exact install steps and ask before installing anything that changes the repo's dependencies.

## Output

List what you created or changed. Tick checkpoint 10 in `status.md`. Next: `/develop 1`.
