export const meta = {
  name: 'dead-code-sweep',
  description: 'Find unreferenced files, assets, templates, and unrouted handlers across the full codebase',
  phases: [
    { title: 'Scan' },
    { title: 'Cross-reference' },
  ],
}

const profileHint = 'If .claude/essentials-profile.md exists, read it first for the stack, source/template layout, and dirs to skip. '

phase('Scan')
const [modules, assets, templates, routes] = await parallel([
  () => agent(
    profileHint + 'Detect the language/stack, then find source files/modules that are never imported, required, or included anywhere. Exclude legitimate entry points (main/index, CLI scripts, framework-convention files, tests, config). Return the list of unreferenced files with the reference search you used.',
    { phase: 'Scan', label: 'orphaned-modules' }
  ),
  () => agent(
    profileHint + 'Detect how static assets (JS/CSS/images) are bundled or included, then find asset files under the source/asset dirs that no bundler entry, import, or template references. Exclude vendored asset dirs. Return the orphaned assets.',
    { phase: 'Scan', label: 'orphaned-assets' }
  ),
  () => agent(
    profileHint + 'If this app renders server-side templates/views, detect how they are referenced and find template files that are never rendered (treat partials/includes separately — they are pulled in by other templates). If there are no server-side templates, say so. Return orphaned templates.',
    { phase: 'Scan', label: 'orphaned-templates' }
  ),
  () => agent(
    'Detect the web framework and its routing style. If routing is explicit (a central route table), find: (1) public handler methods/functions that appear in no route (unreachable over HTTP unless internal helpers — distinguish those by checking for internal callers), (2) routes referencing a handler class/method that does not exist. If routing is convention-based, only report dangling handler references. Return both lists with file references.',
    { phase: 'Scan', label: 'route-gaps', agentType: 'essentials:route-auditor' }
  ),
])

phase('Cross-reference')
const report = await agent(
  `Cross-reference and deduplicate these dead-code findings into a clean removal checklist. Group by type:\n- Orphaned Modules/Files\n- Orphaned Assets\n- Orphaned Templates\n- Unrouted Handlers\n- Broken Routes\n\nFor each item: file path, why it is dead, one-line action (delete file / remove import / add route / remove route). Skip items that are plainly intentional internals: CLI/maintenance scripts, framework entry points, closures used as inline route handlers, and helper methods called within their own module.\n\nModules:\n${modules}\n\nAssets:\n${assets}\n\nTemplates:\n${templates}\n\nRoutes:\n${routes}`,
  { phase: 'Cross-reference' }
)

return report
