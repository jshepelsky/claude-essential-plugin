---
description: Audit a page or component for UI/UX quality and accessibility.
---

Audit the UI/UX of a page or component: $ARGUMENTS

Use the Agent tool with `subagent_type: essentials:ui-designer` (unnamespaced `ui-designer` if not installed as a plugin). Pass the target page/component from `$ARGUMENTS` as scope.

- If the user said "review" / "look at," instruct the agent to **report only**.
- If the user said "fix" / "improve" / "polish," instruct it to report then **apply** the fixes.

Report the agent's findings (and what it changed, if it applied fixes) directly.
