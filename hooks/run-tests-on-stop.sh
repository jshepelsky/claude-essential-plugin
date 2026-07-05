#!/usr/bin/env bash
# Opt-in: run the project's fast test suite when Claude finishes a turn, so
# regressions surface immediately. NOT registered by default — running the full
# suite every turn is noisy and slow. To enable, add a Stop hook in hooks.json:
#   "Stop": [{ "hooks": [{ "type": "command",
#     "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/run-tests-on-stop.sh\"" }] }]
# Detects the project's test command, runs it, and reports failures to stderr.
# Non-blocking: always exits 0 so it never wedges the session.
# ponytail: greps package.json/Makefile for a test script — no per-project config.
#   Set ESSENTIALS_TEST_CMD to override detection if a repo needs something specific.
# Priority: ESSENTIALS_TEST_CMD > the /first-run profile's verified Test command > generic detection.

set -u
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

have() { command -v "$1" >/dev/null 2>&1; }

cmd="${ESSENTIALS_TEST_CMD:-}"
if [ -z "$cmd" ] && [ -f .claude/essentials-profile.md ]; then
  cmd=$(sed -n 's/^- Test:[[:space:]]*//p' .claude/essentials-profile.md | head -1 | tr -d '`')
  case "$cmd" in *unconfirmed*|*…*) cmd="" ;; esac
fi
if [ -z "$cmd" ]; then
  if [ -f package.json ] && grep -q '"test"' package.json && have npm; then
    cmd="npm test --silent"
  elif { [ -f pyproject.toml ] || [ -f pytest.ini ] || [ -d tests ]; } && have pytest; then
    cmd="pytest -q"
  elif [ -f go.mod ] && have go; then
    cmd="go test ./..."
  elif [ -f Gemfile ] && have bundle; then
    cmd="bundle exec rspec --no-color"
  elif { [ -f Makefile ] || [ -f makefile ]; } && grep -qiE '^test:' Makefile makefile 2>/dev/null && have make; then
    cmd="make test"
  fi
fi

[ -z "$cmd" ] && exit 0

out=$(eval "$cmd" 2>&1); rc=$?
if [ $rc -ne 0 ]; then
  echo "[essentials] tests failing after this change ($cmd):" >&2
  printf '%s\n' "$out" | tail -30 >&2
fi
exit 0
