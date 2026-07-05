---
description: Review webhook handlers for signature verification, idempotency, and event handling.
---

Review inbound webhook handlers for signature verification, idempotency, event handling, and secret hygiene: $ARGUMENTS

Use the Agent tool with `subagent_type: essentials:webhook-reviewer` (unnamespaced `webhook-reviewer` if not installed as a plugin). If a provider or path is named in `$ARGUMENTS`, scope to it; otherwise the agent locates the webhook receiver itself.

Report the agent's findings directly without rephrasing.
