---
name: document
description: Write and audit documentation after a feature ships - CLAUDE.md, process docs, and anything a future session or developer needs. Step 19 of /ship.
argument-hint: [slug]
---

Document: $ARGUMENTS

Never commit, branch, or push.

Read the whole work folder, `CLAUDE.md`, `.claude/essentials-profile.md`, and the project's `docs/` and README.

## Step 1 - Audit what exists

Run the `essentials:docs-syncer` agent over the feature's changed files to find docs, docstrings, examples, flags, env vars, and setup steps that drifted. Fix them.

## Step 2 - `CLAUDE.md`

Everything important that helps Claude in a future session goes here or is linked from here: new commands, new conventions this feature established, gotchas found during development (pull them from `notes.md` and the handoffs), new env vars and where they're set, how to run the new tests. Keep it short; link to docs for detail.

## Step 3 - Process docs

For any process that benefits from its own doc, write it under the project's docs dir: how to deploy and roll back this feature, how to run the environment tests, how to operate any new job or integration, runbook entries for new alerts. Match the project's existing doc style.

## Step 4 - Feature doc and README

If the project documents features for users or other developers, add or update the entry. Update the README if setup, commands, or architecture changed.

## Step 5 - Close the work folder

Set `plan.md`, `test-plan.md`, and `phases.md` status to `done`. Add a `## Outcome` section to `status.md`: what shipped, where, when, known gaps, and follow-ups. Tick checkpoint 19.

Report what you wrote and changed, with paths. Suggest a branch name and commit message for the docs.
