---
description: Stage logical change groups and write a clean commit message from the diff.
---

Create one or more commits from the current changes: $ARGUMENTS

Work in the main loop (no subagent). Be conservative — never push, never amend published commits, and never commit secrets.

## Steps

1. **Survey** the working tree:
   ```bash
   git status --porcelain
   git diff --stat
   git log --oneline -10
   ```
   Infer the repo's message convention from recent history (Conventional Commits? prefix style? imperative mood?) and match it.

2. **Branch if needed.** If `HEAD` is the default branch (`main`/`master`) and the changes aren't a trivial fix the user asked to commit there, create a topic branch first.

3. **Group changes logically.** If the diff spans unrelated concerns, stage and commit them separately (`git add -p` or per-path) so each commit is one coherent change. If `$ARGUMENTS` names paths, scope to those.

4. **Refuse to commit** obvious secrets, large binaries, or debug artifacts you spot in the diff — surface them instead.

5. **Write the message**: a concise imperative subject (≤72 chars) matching the repo's convention, and a body explaining *why* only when the change isn't self-evident. No filler, no AI tells.

6. **Commit.** Show the resulting `git log --oneline -<n>`. Push only if the user explicitly asked.

Report what you committed and what you deliberately left unstaged.
