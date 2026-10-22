---
name: tooling-audit
description: Audit agents, skills (including legacy commands), and workflows for correctness, current frontmatter standards, and coverage gaps.
---

Audit the project's Claude primitives — agents, skills, legacy commands, and workflows — for correctness, quality, current standards, and coverage gaps. Implement fixes in place and create new primitives where warranted.

## Phase 1 — Inventory

Find the primitive directories (a repo's `.claude/`, a plugin root, or both):

```bash
for d in agents skills commands workflows .claude/agents .claude/skills .claude/commands .claude/workflows; do [ -d "$d" ] && echo "== $d ==" && ls "$d"; done
```

Read every `.md` and workflow `.js` file found. Also read any `hooks.json` / `settings.json` for hook definitions.

## Phase 2 — Quality checks

For each primitive, look for these failure patterns and fix them in place:

**Unescaped `$` in grep patterns** — in a single-quoted grep, `$` is an end-of-line anchor; `grep '...$_POST'` never matches the literal `$_POST`. Any `$VAR` inside a grep pattern must be `\$VAR`. Scan every grep line.

**Hardcoded stack assumptions** — an agent meant to be reusable shouldn't hardcode one language, framework, file layout, or build command. Flag absolute project paths, a single fixed test/lint command, or framework idioms presented as universal. Replace with a "detect the stack first" step that discovers the real toolchain.

**Tool-specific false positives** — a SQL-injection check should flag input concatenated into a query string, not parameterized queries; an "output not escaped" check should target the framework's actual escaping API. Make sure checks match how the target stack really works.

**Unreliable changed-file detection** — `find -newer <dir>` keys off directory mtime and is unreliable. Prefer `git diff --name-only HEAD` + `git diff --name-only --cached`, falling back to `git diff --name-only HEAD~1 HEAD`.

**References to nonexistent infrastructure** — flag commands that invoke tools, scripts, or `make` targets the project doesn't have. Repurpose or remove them.

**Legacy command files** — Claude Code merged commands into skills: a `skills/<name>/SKILL.md` creates the same `/<name>` and adds frontmatter control (`argument-hint`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `model`, `effort`, `context: fork`) plus a folder for supporting files. For each `commands/<name>.md`, move it to `skills/<name>/SKILL.md`, add `name: <name>`, keep `description`, add `argument-hint` when it takes arguments, and set `disable-model-invocation: true` on anything with side effects the user should time (commit, push, deploy, release). Delete the command file; if both exist the skill wins and the command is dead weight. Every skill needs `name` and `description`; descriptions over about 1,500 characters get truncated in the listing.

**Missing shortcut skills for agents** — each agent should have a matching skill that invokes it via the Agent tool, so users can trigger it without a full prompt. Flag agents with no command.

**Frontmatter correctness** — each agent has `name`, `description`, `tools`, and (optionally) `model`/`maxTurns`. Each command has a `description`. Names are unique and kebab-case.

## Phase 3 — Workflow model & effort audit

### Step 3a — Fetch the current model list

Use WebFetch to get the live model list:

```
https://docs.anthropic.com/en/docs/about-claude/models/overview
```

Parse the current model IDs and tiers (Fable/Opus/Sonnet/Haiku); note the latest in each tier and the valid `effort` values. If the fetch fails, fall back to the `claude-api` skill for current IDs.

### Step 3b — Find workflow scripts

```bash
find . ~/.claude/workflows -name "*.js" 2>/dev/null | grep -v -E 'node_modules|marketplaces' | head -100
```

### Step 3c — Scan and update

For each workflow, grep `model:` and `effort:` in `agent()` calls. Flag and replace any model ID that is retired/unknown, an older version within a tier when a newer exists, or carries a date suffix (use the bare alias). Flag `effort` values outside the documented set. Apply edits in place.

## Phase 4 — Coverage gap analysis

Read the project's README/CLAUDE.md to learn its key domains and risks. For each domain, check whether an agent or command covers it (typical domains: security, logic/correctness, performance, linting, dead code, migrations, routing, third-party integrations/webhooks, UI/copy, testing). For any uncovered high-risk domain, assess whether a new primitive is warranted given the project's size and risk profile.

## Phase 5 — Implement

Fix each Phase 2 issue in place. For each warranted gap, create a new agent or skill following the existing pattern — YAML frontmatter, a "detect the stack" step, concrete commands, and a defined output format.

## Phase 6 — Report

Summarize: what was fixed (one-line before/after each), what was created, and what gaps remain (with a note on why).
