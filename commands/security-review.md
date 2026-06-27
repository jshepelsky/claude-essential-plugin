---
description: Security review of changed files (injection, auth, CSRF, secrets, XSS).
---

Run a security review on changed files: $ARGUMENTS

Use the Agent tool with `subagent_type: security-reviewer` to perform the review. If a filename or path is given in the arguments, scope to that file. Otherwise the agent defaults to git-diff changed files.

Report the agent's findings directly without rephrasing.
