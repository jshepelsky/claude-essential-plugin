---
description: Orchestrated review of the current diff — runs the relevant review agents in parallel and synthesizes findings.
---

# code-review

Run a comprehensive review of the current diff using the relevant review agents, then synthesize one prioritized report.

Supports optional flags in `$ARGUMENTS`:
- `--fix` — after reporting, apply safe convention/style fixes (linter findings only)
- `--comment` — post Critical/Warning findings as inline GitHub PR review comments via `gh`

---

If `.claude/essentials-profile.md` exists, read it first — its `Layout`/`Skip` lines drive the bucketing below, and its `Default branch` sets the diff base.

## Step 1 — Identify what changed

```bash
git diff --name-only HEAD
git diff --name-only --cached
```

If the working tree is clean, review the whole branch — diff against the default branch (the profile's `Default branch`, else detect it):

```bash
base=$(git symbolic-ref -q --short refs/remotes/origin/HEAD | sed 's|.*/||'); base=${base:-main}
git diff --name-only $(git merge-base "$base" HEAD) HEAD
```

If that's empty too (you're on the default branch), fall back to the last commit:

```bash
git diff --name-only HEAD~1 HEAD
```

Categorize the changed paths into these buckets (a file can belong to several). Use extension + path heuristics — adapt to the repo's actual layout:

| Bucket | Matches |
|---|---|
| `code` | any source file (`.php .py .js .ts .rb .go .java .rs`, etc.), excluding tests and vendored dirs |
| `data_access` | files that query the database / ORM models / repositories / services |
| `templates` | server-rendered views/templates or UI component files |
| `routes` | a central route table / URL config |
| `migrations` | schema migration files |
| `webhooks` | inbound webhook receivers or payment/event integration code |
| `manifests` | dependency manifests/lockfiles (`package.json`, `composer.json`, `requirements*`, `go.mod`, `Gemfile`, `Cargo.toml`, `*.lock`) |

If nothing reviewable changed (only vendored deps, lockfiles, docs), print "Nothing to review." and stop.

---

## Step 2 — Select and run agents in parallel

Pick agents from the buckets, then launch **all** of them in a single message (multiple Agent tool calls) so they run concurrently:

| Agent (`subagent_type`, prefixed `essentials:` when installed as a plugin) | Run when |
|---|---|
| `essentials:linter` | always |
| `essentials:logic-reviewer` | `code` non-empty |
| `essentials:security-reviewer` | `code` or `templates` non-empty |
| `essentials:performance-reviewer` | `data_access` non-empty |
| `essentials:webhook-reviewer` | `webhooks` non-empty |
| `essentials:route-auditor` | `routes` non-empty |
| `essentials:migration-validator` | `migrations` non-empty |
| `essentials:dependency-auditor` | `manifests` non-empty |
| `essentials:docs-syncer` | a documented surface changed (public signature, CLI flag, env var, config key, route) |
| `essentials:copy-reviewer` | `templates` non-empty (or user-facing strings changed) |

Use the exact agent names from your available-agents list (unnamespaced if the agents were copied into `.claude/agents/`). Pass each agent the changed-file scope from Step 1 (e.g. "Review these changed files: …"). Wait for all agents to complete before continuing.

---

## Step 3 — Synthesize findings

Collect all agent outputs. De-duplicate findings that reference the same file and line. Present in this order:

### Critical
Security vulnerabilities, logic bugs that cause incorrect behavior or crashes, broken webhook handling, dependencies with known critical/high CVEs.

### Warning
Performance issues, route mismatches, migration problems, logic warnings, security best-practice gaps, outdated/unused dependencies, documentation that drifted from the code.

### Convention / Style
Linter violations, dead imports, copy issues.

### Info
Informational notes, unrouted handlers, suggestions.

For each finding: **[Agent]** `file:line` — description.

---

## Step 4 — Summary table

End with a count table, one row per agent that ran (skip agents not run), plus a total.

---

## Step 5 — Handle flags (if present in `$ARGUMENTS`)

**`--fix`**: apply fixes for `Convention / Style` findings only (linter/formatter violations). Don't auto-fix Critical/Warning — report and let the developer decide. After fixing, re-run `linter` to confirm clean.

**`--comment`**: post each Critical and Warning finding as an inline comment on the current PR. Check a PR exists first:

```bash
gh pr view --json number,headRefName 2>/dev/null
```

If no open PR is found, skip and note it.
