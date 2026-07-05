#!/usr/bin/env bash
# SessionStart: one-line nudge to run /first-run when no project profile exists.
# The whole plugin specializes to .claude/essentials-profile.md — this is the
# only place a user learns that if they haven't read the README.
# Silence with ESSENTIALS_NO_NUDGE=1. Always exits 0.

set -u
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
[ -d .git ] || exit 0
[ -f .claude/essentials-profile.md ] && exit 0
[ -n "${ESSENTIALS_NO_NUDGE:-}" ] && exit 0

echo "essentials: no project profile found. Suggest running /first-run once — it detects this repo's stack/commands/layout and tailors every essentials agent to it. (Silence this nudge with ESSENTIALS_NO_NUDGE=1.)"
exit 0
