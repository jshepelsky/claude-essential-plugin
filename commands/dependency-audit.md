---
description: Audit dependencies for known vulnerabilities, outdated versions, and unused packages.
---

Audit the project's dependencies: $ARGUMENTS

Use the Agent tool with `subagent_type: essentials:dependency-auditor` (unnamespaced `dependency-auditor` if not installed as a plugin). If a manifest path or ecosystem is given in the arguments, pass it as the scope; otherwise the agent detects every manifest in the repo.

Report the agent's findings directly without rephrasing.
