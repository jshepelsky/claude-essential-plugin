---
name: mockup
description: Create HTML mockups when no design was supplied, with real research, then review them with a critical eye. Steps 3 and 4 of /ship.
argument-hint: <create|review> [slug]
---

Mockup: $ARGUMENTS

`$ARGUMENTS` is `create` or `review`, optionally followed by the work-folder slug.

Never commit, branch, or push. Mockups live in `.claude/work/<slug>/mockups/` and nowhere else; they are not app code.

Read `brief.md` and `plan.md` first. **If `brief.md` says a design was supplied, skip this skill**: tick checkpoints 3 and 4 in `status.md` with "design supplied" and stop.

## `create`

1. **Inventory the screens.** From `plan.md`'s `Design` section, list every screen and every state (loading, empty, error, success, permission denied, mobile and desktop). Each gets a mockup.
2. **Research before drawing.** Look at how the product already looks: pull the real stylesheet, design tokens, component library, fonts, and spacing scale from the repo. Then do real web research on the pattern you're building (a settings page, a checkout, a data table, an onboarding flow): what the best current examples do, what accessibility guidance says, what to avoid. Note sources.
3. **Build the mockups** as self-contained HTML files, one per screen, using the project's real tokens, fonts, and component styles so they look like the product, not a template. If the `frontend-design` skill is available, read it first. Include the real copy from `plan.md`, not lorem ipsum. Make them responsive. Add a `README.md` in the folder listing each file, what it shows, and the research sources.
4. **Show them.** Tell the user the paths and how to open them. Ask for reactions with specific questions ("is the primary action in the right place?", "should empty state link to import?"), each with your recommendation.

## `review`

1. Spawn `essentials:mockup-reviewer` with the work-folder path. In the same message, spawn `essentials:ui-designer` on the mockup files (ask it to report, not edit) and `essentials:copy-reviewer` on the strings. Wait for all three.
2. Merge the findings. Apply every must-fix and should-fix you can resolve directly to the mockup files: missing states, token and component mismatches, contrast, focus, touch targets, copy. Keep the reviewer's research sources.
3. Write `mockups/mockup-review.md`: what changed, what's flagged for the user (each with a recommendation), sources, verdict.
4. Show the user the updated mockups and ask the remaining questions. Stop. When they approve, tick checkpoints 3 and 4 in `status.md` and record the approved mockup list in `plan.md`'s `Design` section.

If the verdict is "revise" after your fixes, re-run `essentials:mockup-reviewer` once. If it's still "revise", stop and talk it through rather than looping.

Next: `/test-plan`.
