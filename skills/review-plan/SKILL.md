---
name: review-plan
description: Fine-tooth review of a plan in the work folder - the implementation plan, test plan, phase plan, or all of them together for consistency - by a fresh-context reviewer agent. Steps 2, 6, 7, and 9 of /ship.
argument-hint: <plan|tests|phases|all> [slug]
---

Review plan: $ARGUMENTS

`$ARGUMENTS` is `plan`, `tests`, `phases`, or `all`, optionally followed by the work-folder slug. If no slug is given and exactly one folder exists under `.claude/work/`, use it; otherwise ask.

Never commit, branch, or push. This skill edits only files in the work folder.

The review itself is done by an agent that hasn't seen the plan being written, so it reads it the way a second engineer would. You orchestrate, apply, and talk to the user.

## Step 1 - Spawn the reviewers

Launch all of the agents for the mode in one message so they run in parallel. Pass each the work-folder path and tell it which document to review. Use the exact names from your available-agents list (prefixed `essentials:` when installed as a plugin).

| Mode | Agents |
|---|---|
| `plan` | `essentials:plan-reviewer`, plus `essentials:security-reviewer` and `essentials:performance-reviewer` with the plan's `Security` and `Performance` sections and the files the plan will touch, plus `essentials:copy-reviewer` with the plan's `Copy` section |
| `tests` | `essentials:test-plan-reviewer` |
| `phases` | `essentials:phase-reviewer` |
| `all` | `essentials:plan-consistency-reviewer` |

Wait for all of them.

## Step 2 - Apply

Merge the findings. For every **Must fix** and **Should fix** that you can resolve from the documents and the repo, edit the plan file(s) directly. Where two reviewers disagree, check the repo and pick; note why under `Decisions`.

Don't apply a change that needs the user's call. Collect those with the reviewers' recommendations.

## Step 3 - Record

Append to the bottom of each reviewed file:

```markdown
## Review <n> - <date>
- Changed: …
- Flagged for the user: …
- Verified against repo: …
- Verdict: …
```

## Step 4 - Report and stop

Tell the user: what you changed, the questions that need their answer (each with a recommendation), and the verdict. Tick the matching checkpoint in `status.md` only when the verdict is ready and there are no open must-fix items. Say the next skill.

If the verdict is "not ready" after you've applied fixes, re-run the reviewer once on the updated file. If it's still not ready, stop and talk it through with the user rather than looping.
