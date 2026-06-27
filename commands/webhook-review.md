---
description: Review webhook handlers for signature verification, idempotency, and event handling.
---

Review inbound webhook handlers for signature verification, idempotency, event handling, and secret hygiene: $ARGUMENTS

Use the Agent tool with `subagent_type: webhook-reviewer`. If a provider or path is named in `$ARGUMENTS`, scope to it; otherwise the agent locates the webhook receiver itself.

Report the agent's findings directly without rephrasing.
