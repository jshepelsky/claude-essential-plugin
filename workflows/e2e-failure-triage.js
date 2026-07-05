export const meta = {
  name: 'e2e-failure-triage',
  description: 'Parse end-to-end test results and diagnose the root cause of each failing test',
  phases: [
    { title: 'Parse' },
    { title: 'Diagnose' },
    { title: 'Summarize' },
  ],
}

phase('Parse')
const parsed = await agent(
  'Detect this project\'s end-to-end test runner (the Test (E2E) line in .claude/essentials-profile.md if present, else Playwright/Cypress/Selenium config) and find its latest results/report file (look for a JSON reporter output, a test-results/ or report dir referenced in the runner config or package.json). Read it and return the list of failing tests. If no results file exists, set noResultsFound and suggest the command to run the E2E suite first.',
  {
    phase: 'Parse',
    schema: {
      type: 'object',
      properties: {
        failures: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              specFile: { type: 'string' },
              error: { type: 'string' },
            },
            required: ['title', 'specFile', 'error'],
          },
        },
        totalFailed: { type: 'number' },
        noResultsFound: { type: 'boolean' },
        runCommand: { type: 'string' },
      },
      required: ['failures', 'totalFailed'],
    },
  }
)

if (parsed.noResultsFound) {
  const cmd = parsed.runCommand || 'the E2E suite'
  log(`No E2E results file found. Run ${cmd} first, then re-run this workflow.`)
  return { message: `No results file found. Run ${cmd} first.` }
}

if (!parsed.failures.length) {
  log('All tests passed — nothing to triage.')
  return { message: 'All tests passed.' }
}

const MAX_DIAGNOSE = 20
const toDiagnose = parsed.failures.slice(0, MAX_DIAGNOSE)
if (parsed.failures.length > MAX_DIAGNOSE) {
  log(`Triaging the first ${MAX_DIAGNOSE} of ${parsed.failures.length} failures — re-run after fixing to triage the rest.`)
} else {
  log(`Triaging ${toDiagnose.length} failing test(s)...`)
}

phase('Diagnose')
const diagnoses = await pipeline(
  toDiagnose,
  failure => agent(
    `Diagnose this failing end-to-end test. Detect the app's stack first.\n\nTest: ${failure.title}\nSpec file: ${failure.specFile}\nError: ${failure.error}\n\nRead the spec file and trace back to the relevant server-side handler/model/template (or client component). Categorize the root cause as one of:\n(A) Logic bug — wrong data returned or incorrect server/client behavior\n(B) UI/selector regression — a selector no longer matches the rendered output\n(C) Data/fixture issue — the test depends on data that doesn't exist or has wrong state\n(D) Flaky — timing, race, or environment-dependent\n\nReturn: category, the specific file and line causing the failure, and a one-line fix suggestion.`,
    { phase: 'Diagnose', label: failure.title }
  )
)

phase('Summarize')
const summary = await agent(
  `Summarize these E2E failure diagnoses into an actionable triage report. Group by root cause:\n- Logic Bug\n- UI/Selector Regression\n- Data/Fixture Issue\n- Flaky Test\n\nFor each failure: test name, spec file, root cause, file:line, recommended fix.\n\n${diagnoses.filter(Boolean).join('\n\n')}`,
  { phase: 'Summarize' }
)

return summary
