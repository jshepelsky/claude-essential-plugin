---
description: Logic and correctness review of changed code.
---

Run a logic and correctness review on changed files: $ARGUMENTS

Use the Agent tool with `subagent_type: essentials:logic-reviewer` (unnamespaced `logic-reviewer` if not installed as a plugin) to perform the review. If a filename or path is given in the arguments, pass it as scope; otherwise the agent defaults to git-diff changed files.

Report the agent's findings directly without rephrasing.
