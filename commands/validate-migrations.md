---
description: Validate schema migrations (naming, reversibility, dialect, indexes).
---

Validate database schema migrations for naming/ordering, reversibility, dialect correctness, and index coverage: $ARGUMENTS

Use the Agent tool with `subagent_type: migration-validator` to run the validation. If a path is given in `$ARGUMENTS`, scope to it; otherwise the agent defaults to changed migrations.

Report the agent's findings directly without rephrasing.
