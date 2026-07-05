---
description: Validate schema migrations (naming, reversibility, dialect, indexes).
---

Validate database schema migrations for naming/ordering, reversibility, dialect correctness, and index coverage: $ARGUMENTS

Use the Agent tool with `subagent_type: essentials:migration-validator` (unnamespaced `migration-validator` if not installed as a plugin) to run the validation. If a path is given in `$ARGUMENTS`, scope to it; otherwise the agent defaults to changed migrations.

Report the agent's findings directly without rephrasing.
