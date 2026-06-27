#!/usr/bin/env bash
# Generic, opt-in syntax check for the file just edited/written.
# Reads the hook JSON on stdin, picks a checker by extension, runs it only if
# the tool is installed. Silent on success; non-blocking on failure (prints a
# warning to stderr, exits 0). Remove the hooks block in hooks.json to disable.
# ponytail: extension switch keyed on exit codes, not a full linter — add per-language config if a project needs it.

set -u

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
{ [ -z "$file" ] || [ ! -f "$file" ]; } && exit 0

have() { command -v "$1" >/dev/null 2>&1; }

# Run a checker; surface its output only when it exits non-zero (= a real error).
check() {
  local tool=$1; shift
  have "$tool" || return 0
  local out rc
  out=$("$@" 2>&1 >/dev/null); rc=$?
  # some tools report errors on stdout — capture both streams for the message
  [ $rc -ne 0 ] && out=$("$@" 2>&1)
  if [ $rc -ne 0 ]; then
    echo "[essentials] syntax error in $file:" >&2
    printf '%s\n' "$out" >&2
  fi
  return 0
}

case "$file" in
  *.php)            check php   php -l "$file" ;;
  *.py)             check python3 python3 -m py_compile "$file" ;;
  *.js|*.cjs|*.mjs) check node  node --check "$file" ;;
  *.rb)             check ruby  ruby -c "$file" ;;
  *.go)             check gofmt gofmt -e "$file" ;;
  *.sh|*.bash)      check bash  bash -n "$file" ;;
  *.json)           check jq    jq empty "$file" ;;
esac

exit 0
