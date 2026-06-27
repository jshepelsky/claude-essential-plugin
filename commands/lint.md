---
description: Lint changed files for syntax errors and run configured linters.
---

Run the linter on changed files: $ARGUMENTS

Use the Agent tool with `subagent_type: linter` to perform the lint. If a filename or path is given in the arguments, pass it as the scope; otherwise the agent defaults to git-diff changed files.

Report the agent's findings directly without rephrasing.
