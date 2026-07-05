export const meta = {
  name: 'codebase-health',
  description: 'Repo-wide health audit — security, performance, dependencies, dead code, docs drift, and lint in parallel, synthesized into one prioritized report',
  whenToUse: 'When adopting a codebase or after /first-run, to get a full-repo baseline instead of a diff-scoped review',
  phases: [
    { title: 'Audit' },
    { title: 'Synthesize' },
  ],
}

const profileHint = 'If .claude/essentials-profile.md exists, read it first for the stack, commands, layout, and dirs to skip. '
const repoWide = 'Audit the ENTIRE codebase, not just changed files — skip your usual git-diff scoping. '

phase('Audit')
const [security, perf, deps, dead, docs, lint] = await parallel([
  () => agent(
    profileHint + repoWide + 'Security review of all source: injection, XSS, CSRF, auth/authorization gaps, exposed secrets, unsafe uploads/SSRF. Prioritize request handlers, data access, templates, and config. Report file:line and severity.',
    { phase: 'Audit', label: 'security', agentType: 'essentials:security-reviewer' }
  ),
  () => agent(
    profileHint + repoWide + 'Performance review of all data-access code and handlers: N+1 queries, unbounded reads, SELECT * over-fetching, non-indexable query shapes, repeated work in loops, missing indexes on FK columns. Report file:line.',
    { phase: 'Audit', label: 'performance', agentType: 'essentials:performance-reviewer' }
  ),
  () => agent(
    'Audit every dependency manifest in the repo for known CVEs, major-version lag, and unused direct dependencies, using the ecosystem\'s native scanners. State which scanners ran and which were unavailable.',
    { phase: 'Audit', label: 'dependencies', agentType: 'essentials:dependency-auditor' }
  ),
  () => agent(
    profileHint + 'Find dead code across the repo: unreferenced files/modules, orphaned templates and assets, and unrouted public handlers.',
    { phase: 'Audit', label: 'dead-code', agentType: 'essentials:dead-code-detector' }
  ),
  () => agent(
    profileHint + repoWide + 'Check the docs surface (README, docs/, .env.example, docstrings on public APIs) against the current code: wrong commands, renamed flags/env vars, stale setup steps, examples that would now fail. For each, report the doc location and the correct value.',
    { phase: 'Audit', label: 'docs', agentType: 'essentials:docs-syncer' }
  ),
  () => agent(
    profileHint + repoWide + 'Run the project\'s configured linter/formatter/typechecker over the whole project. Summarize errors grouped by file; cap the listing at the 30 most severe and state how many were omitted.',
    { phase: 'Audit', label: 'lint', agentType: 'essentials:linter' }
  ),
])

phase('Synthesize')
const report = await agent(
  `Synthesize this repo-wide health audit into one prioritized report. Group by severity: Critical → High → Medium → Low → Info. For each issue: file:line, the problem, a one-line fix suggestion. De-duplicate findings that reference the same file and line. End with a scoreboard: one row per dimension (security, performance, dependencies, dead code, docs, lint) with a count and a one-word grade (clean / minor / needs-work / critical).\n\nSecurity:\n${security}\n\nPerformance:\n${perf}\n\nDependencies:\n${deps}\n\nDead code:\n${dead}\n\nDocs drift:\n${docs}\n\nLint:\n${lint}`,
  { phase: 'Synthesize' }
)

return report
