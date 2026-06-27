# essentials

A codebase-agnostic Claude Code plugin: code-review, testing, and quality primitives that **detect the stack** instead of hardcoding a language or framework. Works on PHP, Python, JS/TS, Ruby, Go, and more.

## Install

As a marketplace (from this repo):

```
/plugin marketplace add <owner>/claude-essential-plugin
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
| `/code-review [--fix] [--comment]` | Orchestrates the relevant review agents over the current diff and synthesizes one prioritized report |
| `/security-review [path]` | Injection, auth/authz, CSRF, secrets, XSS |
| `/logic-review [path]` | Correctness bugs linters miss |
| `/performance-audit [path]` | N+1, unbounded reads, missing indexes |
| `/lint [path]` | Syntax + the project's configured linters |
| `/dead-code [path]` | Unreferenced files, assets, templates, unrouted handlers |
| `/copy-review [path]` | AI writing tells in user-facing copy |
| `/ui-review <page>` | UI/UX + accessibility audit (report, or fix on request) |
| `/webhook-review [path]` | Webhook signature verification, idempotency, event handling |
| `/validate-migrations [path]` | Migration naming, reversibility, dialect, indexes |
| `/route-audit` | Route table vs handlers |
| `/test` | Run the test suite, then plan fixes for failures |
| `/smoke-test` | Run fast tests, then hit key routes on the running app |
| `/tooling-audit` | Audit/repair the project's own Claude primitives |

Each review command is backed by a subagent of the same purpose under `agents/`, so they also run automatically when relevant (and in parallel via `/code-review`).

### Skill

- **flaky-test-investigation** — evidence-first triage of a flaky/failing test (fast suite or E2E).

### Workflows

Multi-agent scripts in `workflows/` (run with the Workflow tool): `pre-pr-review`, `dead-code-sweep`, `e2e-failure-triage`.

### Hook (optional)

`hooks/hooks.json` registers one `PostToolUse` hook that runs a language-appropriate **syntax check** on each edited file (`php -l`, `python -m py_compile`, `node --check`, `ruby -c`, `gofmt -e`, `bash -n`, `jq`). It's silent on success, non-blocking on failure, and skips any language whose tool isn't installed. To disable it, remove the `hooks` block from `hooks/hooks.json`.

## Design

Every agent starts by detecting the language, framework, and toolchain from the repo, then applies its universal checks to the idioms it actually finds — so the same `security-reviewer` works whether the project is Django, Laravel, or Express. Nothing is wired to a specific project's paths, build commands, or domain.

## License

[MIT](LICENSE)
