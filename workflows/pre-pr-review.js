export const meta = {
  name: 'pre-pr-review',
  description: 'Run the test suite, then parallel security, logic, performance, lint, and route review of changed files',
  phases: [
    { title: 'Tests' },
    { title: 'Discover' },
    { title: 'Review' },
    { title: 'Synthesize' },
  ],
}

phase('Tests')
const tests = await agent(
  'Detect this project\'s test command (check package.json scripts, Makefile, pytest/go/cargo/composer config, README) and run the fast/unit suite. Return whether all tests passed, the total test count, and — if any failed — the full failure output.',
  {
    phase: 'Tests',
    label: 'tests',
    schema: {
      type: 'object',
      properties: {
        passed: { type: 'boolean' },
        summary: { type: 'string' },
      },
      required: ['passed', 'summary'],
    },
  }
)

if (!tests.passed) {
  log('Tests failed — fix before merging.')
  return { findings: `Tests failed:\n\n${tests.summary}` }
}

log(`Tests: ${tests.summary}`)

phase('Discover')
const discovery = await agent(
  'Run `git diff main --name-only` and return the changed source files. If on main, use `git diff HEAD~1 --name-only`. Exclude vendored/generated dirs (vendor/, node_modules/, dist/, build/) and lockfiles. Return the paths as an array and as a space-separated string.',
  {
    phase: 'Discover',
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string' } },
        fileList: { type: 'string' },
      },
      required: ['files', 'fileList'],
    },
  }
)

if (!discovery.files.length) {
  log('No changed source files found — nothing to review.')
  return { findings: 'No changed source files.' }
}

log(`Reviewing ${discovery.files.length} changed file(s): ${discovery.fileList}`)

phase('Review')
const [security, logic, perf, lint, routes] = await parallel([
  () => agent(
    `Security review of these changed files. Detect the stack first, then check for: injection (input concatenated into a query/command vs parameterized), auth/authorization bypass, missing CSRF on mutations, XSS/output-encoding gaps, exposed secrets, missing input validation. Files: ${discovery.fileList}\n\nRead the files and git diff as needed. Report issues with file:line and severity.`,
    { phase: 'Review', label: 'security', agentType: 'security-reviewer' }
  ),
  () => agent(
    `Logic and correctness review of these changed files. Check for: unchecked nullable/"not found" results, inconsistent return shapes, response-mode confusion, input type coercion, missing guards on mutations, off-by-one/boundary bugs, swallowed errors. Files: ${discovery.fileList}\n\nReport issues with file:line.`,
    { phase: 'Review', label: 'logic', agentType: 'logic-reviewer' }
  ),
  () => agent(
    `Performance review of these changed files. Check for: N+1 queries / remote calls in loops, unbounded reads without LIMIT/pagination, SELECT * / over-fetching, non-indexable query shapes, repeated work in loop conditions, and missing indexes on new FK columns. Files: ${discovery.fileList}\n\nReport issues with file:line.`,
    { phase: 'Review', label: 'performance', agentType: 'performance-reviewer' }
  ),
  () => agent(
    `Lint these changed files: run the project's configured linters/formatters and a per-language syntax check, plus generic checks (no hardcoded secrets, no leftover debug artifacts, no merge-conflict markers). Files: ${discovery.fileList}`,
    { phase: 'Review', label: 'lint', agentType: 'linter' }
  ),
  () => agent(
    'Detect the web framework and audit its route table against handlers: (1) routes pointing to a missing handler/method, (2) public handlers with no route (only if routing is explicit). Report with file references.',
    { phase: 'Review', label: 'routes', agentType: 'route-auditor' }
  ),
])

phase('Synthesize')
const report = await agent(
  `Synthesize these parallel code-review findings into one prioritized report. Group by severity: Critical → High → Medium → Low → Info. For each issue: file:line, the problem, a one-line fix suggestion. Omit duplicates and empty sections.\n\nSecurity:\n${security}\n\nLogic:\n${logic}\n\nPerformance:\n${perf}\n\nLint:\n${lint}\n\nRoutes:\n${routes}`,
  { phase: 'Synthesize' }
)

return report
