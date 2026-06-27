---
description: Run the project's test suite, then plan fixes for any failures.
---

# test

Run the project's test suite(s), then create a plan to fix any failures.

---

## Step 1 — Detect the test command

Find how this project runs tests — don't assume:

```bash
cat package.json 2>/dev/null | grep -A20 '"scripts"'
ls Makefile justfile pytest.ini pyproject.toml go.mod Cargo.toml composer.json Rakefile 2>/dev/null
```

Pick the project's own entry point (in rough priority): a documented command in README/CONTRIBUTING → `make test` / `just test` → `npm test` / `pnpm test` → `pytest` → `go test ./...` → `cargo test` → `bundle exec rspec` → the framework's runner. If there are separate unit and end-to-end/integration suites, note both.

## Step 2 — Run the suite(s)

Run the detected command(s). Capture exit codes and failure output. For each failure, note the test name/file and the exact assertion or error message — you'll need them for the plan.

## Step 3 — Report results

Print a summary:

```
Unit/integration: PASSED / FAILED (N failures)
E2E (if present):  PASSED / FAILED (N failures)
```

If everything passed, print "All tests passed." and stop — do not create a plan.

## Step 4 — Create a fix plan (only if there are failures)

Use the EnterPlanMode tool to create a structured plan. For each failing test:

- **Test name / file**
- **Failure message** (exact assertion or error)
- **Root cause** — classify as one of:
  - Logic bug — production code returns the wrong value or errors
  - Stale mock/fixture — expectations don't match the current code
  - Selector/contract regression — a UI selector or API shape changed
  - Data/state issue — test depends on missing or wrong-state data
  - Flaky — timing, race, or environment-dependent
- **Fix** — specific file(s) and change needed

Group unit/integration and E2E failures into separate sections. Within each, order by severity: logic bugs first, then contract/selector regressions, then data issues, then flaky tests.
