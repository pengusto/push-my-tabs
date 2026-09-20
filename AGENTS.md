# Repository instructions

## Agent skills

### Issue tracker

Issues and specs live as local Markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five canonical Matt Pocock triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository using root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.

## Changelog and version notes

- Every user-facing change updates `CHANGELOG.md` in the same change under `## Unreleased`.
- Keep entries concise and user-facing; group them under the existing categories such as `Added`, `Changed`, `Fixed`, and `Improved`.
- Before a release, move `Unreleased` into `## <version> - <YYYY-MM-DD>`, verify both manifest versions and the `v<version>` tag match, then leave `Unreleased` empty.
- Use the versioned `CHANGELOG.md` section as the source for GitHub version notes. Do not maintain a second release-notes file.
