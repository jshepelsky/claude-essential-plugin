---
description: Find unreferenced files, symbols, templates, assets, and unrouted handlers.
---

Find dead code: unreferenced files/modules, orphaned templates and assets, and public handlers with no route.

Use the Agent tool with `subagent_type: essentials:dead-code-detector` (unnamespaced `dead-code-detector` if not installed as a plugin) to run the audit. If a path is given in `$ARGUMENTS`, scope to it.

Report the agent's findings directly without rephrasing.
