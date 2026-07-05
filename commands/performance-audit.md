---
description: Static performance audit (N+1, unbounded reads, missing indexes).
---

Perform a static performance audit on the target: $ARGUMENTS

Use the Agent tool with `subagent_type: essentials:performance-reviewer` (unnamespaced `performance-reviewer` if not installed as a plugin) to run the audit. Pass the target scope from the arguments in the agent prompt. If no target is given, the agent defaults to git-diff changed files (focusing on data-access code, handlers, and services).

Report the agent's findings directly without rephrasing.
