---
description: Audit user-facing copy for AI writing tells and style violations.
---

Audit user-facing copy for AI writing giveaways and style violations: $ARGUMENTS

Use the Agent tool with `subagent_type: copy-reviewer`. If `$ARGUMENTS` contains a path or file, scope the scan to it; otherwise the agent defaults to user-facing text across the repo (templates/views, UI strings, README/docs, email templates).

Report all violations grouped by file:

```
[RULE] file/path:LINE
  Found:    "original text"
  Fix:      "suggested replacement"
```

End with a summary table of total violations by rule category. If no violations are found, say so clearly.

To rewrite the flagged text rather than just list fixes, hand off to the **humanize** skill — it's the rewrite counterpart to this audit.
