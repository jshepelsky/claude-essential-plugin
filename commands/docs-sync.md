---
description: Find documentation that has drifted from the changed code.
---

Check for docs that no longer match the code: $ARGUMENTS

Use the Agent tool with `subagent_type: docs-syncer`. If a path is given in the arguments, scope to it; otherwise the agent checks docs against git-diff changed code.

Report the agent's findings directly. Apply fixes only if the user asks.
