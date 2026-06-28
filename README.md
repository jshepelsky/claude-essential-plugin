# essentials

A codebase-agnostic Claude Code plugin: code-review, testing, and quality primitives that **detect the stack** instead of hardcoding a language or framework. Works on PHP, Python, JS/TS, Ruby, Go, and more.

## Install

As a marketplace (from this repo):

```
/plugin marketplace add jshepelsky/claude-essential-plugin
/plugin install essentials@claude-essentials
```

Or point Claude Code at a local clone:

```
/plugin marketplace add /path/to/claude-essential-plugin
```

## What's included

### Commands

| Command | What it does |
|---|---|
| `/first-run` | One-time: detect this codebase and write a profile every primitive specializes to (see [Tailoring](#tailoring-to-your-codebase)) |
| `/code-review [--fix] [--comment]` | Orchestrates the relevant review agents over the current diff and synthesizes one prioritized report |
| `/security-review [path]` | Injection, auth/authz, CSRF, secrets, XSS |
| `/logic-review [path]` | Correctness bugs linters miss |
| `/performance-audit [path]` | N+1, unbounded reads, missing indexes |
| `/lint [path]` | Syntax, type errors, + the project's configured linters |
| `/dependency-audit [path]` | Known CVEs, outdated versions, unused/typosquat packages |
| `/dead-code [path]` | Unreferenced files, assets, templates, unrouted handlers |
| `/copy-review [path]` | AI writing tells in user-facing copy |
| `/ui-review <page>` | UI/UX + accessibility audit (report, or fix on request) |
| `/webhook-review [path]` | Webhook signature verification, idempotency, event handling |
| `/validate-migrations [path]` | Migration naming, reversibility, dialect, indexes |
| `/route-audit` | Route table vs handlers |
| `/test` | Run the test suite, then plan fixes for failures |
| `/write-tests [path]` | Write tests for the diff/file, matching the project's framework |
| `/smoke-test` | Run fast tests, then hit key routes on the running app |
| `/docs-sync [path]` | Find docs/docstrings that drifted from the changed code |
| `/commit [paths]` | Stage logical groups and write a clean commit message from the diff |
| `/pr [notes]` | Open a PR with title/body generated from the branch diff |
| `/tooling-audit` | Audit/repair the project's own Claude primitives |

Each review command is backed by a subagent of the same purpose under `agents/`, so they also run automatically when relevant (and in parallel via `/code-review`).

### Skills

Evidence-first triage procedures — detect the stack, gather proof, then propose one narrow next step (no guessing, no premature fix):

- **flaky-test-investigation** — a flaky/failing test (fast suite or E2E).
- **regression-bisect** — "worked before, broke now": drives `git bisect run` to the culprit commit.
- **stacktrace-triage** — a crash/exception/error log: locate the throwing frame and classify the cause.

Plus a rewrite skill:

- **humanize** — rewrites prose to strip AI writing tells (em dashes, rule of three, significance inflation, filler). The fix counterpart to `/copy-review`'s audit. Adapted from the MIT-licensed [humanizer](https://github.com/blader/humanizer) skill and [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing).

### Workflows

Multi-agent scripts in `workflows/` (run with the Workflow tool): `pre-pr-review`, `dead-code-sweep`, `e2e-failure-triage`.

### Hooks

`hooks/hooks.json` registers one `PostToolUse` hook that runs a language-appropriate **syntax check** on each edited file (`php -l`, `python -m py_compile`, `node --check`, `ruby -c`, `gofmt -e`, `bash -n`, `jq`). It's silent on success, non-blocking on failure, and skips any language whose tool isn't installed. To disable it, remove the `hooks` block from `hooks/hooks.json`.

**Opt-in:** `hooks/run-tests-on-stop.sh` runs the project's fast test suite when Claude finishes a turn, so regressions surface immediately. It's **not registered by default** (running the full suite every turn is noisy). To enable, add a `Stop` hook to `hooks/hooks.json`:

```json
"Stop": [{ "hooks": [{ "type": "command",
  "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/run-tests-on-stop.sh\"" }] }]
```

It detects the test command from `package.json`/`pytest`/`go.mod`/`Gemfile`/`Makefile`; override with the `ESSENTIALS_TEST_CMD` env var.

## Tailoring to your codebase

Run **`/first-run`** once per project. It detects your stack, commands, layout, conventions, and domain, then writes `.claude/essentials-profile.md` and imports it from your `CLAUDE.md`. Every agent and detection skill reads that profile first and trusts it over re-detection — so reviews use *your* test/lint commands, skip *your* generated dirs, and judge against *your* conventions.

The profile is a plain markdown file in your repo — edit it by hand anytime. The plugin's own files stay generic, so this customization survives plugin updates and never leaks between projects.

## Design

Every agent starts by detecting the language, framework, and toolchain from the repo (or reading the `/first-run` profile if present), then applies its universal checks to the idioms it actually finds — so the same `security-reviewer` works whether the project is Django, Laravel, or Express. Nothing is wired to a specific project's paths, build commands, or domain.

## License

[MIT](LICENSE)
