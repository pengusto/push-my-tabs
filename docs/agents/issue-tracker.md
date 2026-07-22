# Issue tracker: Local Markdown

Issues and specs for this repo live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Never combine all tickets into one file
- Triage state is recorded as a `Status:` line near the top of each issue file
- Comments and conversation history append under a `## Comments` heading

## Publishing and fetching

When a skill says to publish to the issue tracker, create the corresponding file under `.scratch/<feature-slug>/`. When a skill says to fetch a ticket, read the referenced local Markdown file.

## Wayfinding

- Map: `.scratch/<effort>/map.md`
- Child ticket: `.scratch/<effort>/issues/<NN>-<slug>.md`
- Ticket type is recorded as `Type:` and status as `Status:`
- Dependencies use `Blocked by: NN, NN`
- The first open, unblocked, unclaimed ticket by number is the frontier
- Claim by setting `Status: claimed` before work
- Resolve by adding `## Answer`, setting `Status: resolved`, and appending the decision to the map
