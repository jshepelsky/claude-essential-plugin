---
description: Write tests for the current diff or a target file, matching the project's framework.
---

Write tests for the changes: $ARGUMENTS

Use the Agent tool with `subagent_type: test-author`. If a file or path is given in the arguments, scope to it; otherwise the agent targets git-diff changed files.

After the agent reports the tests it wrote, run the suite to confirm they pass and report the result.
