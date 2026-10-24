import { readFile, writeFile } from "node:fs/promises";

export function compareVersions(a, b) {
  if (![a, b].every(value => /^\d+\.\d+\.\d+(?:\.\d+)?$/.test(value))) throw new Error('Cannot compare an unexpected store version');
  const left = a.split('.').map(Number), right = b.split('.').map(Number);
  return [0, 1, 2, 3].map(index => (left[index] || 0) - (right[index] || 0)).find(value => value !== 0) || 0;
}

export function releaseVersion(tag) {
  if (!/^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(tag)) throw new Error("Use a stable release tag such as v1.3.0");
  const version = tag.slice(1);
  if (version.split('.').some(part => Number(part) > 65535)) throw new Error("Manifest version components must not exceed 65535");
  return version;
}

export function releaseNotes(changelog, version) {
  const section = changelog.split(/^## /m).find(section => section.startsWith(`${version} - `));
  const notes = section?.slice(section.indexOf('\n') + 1).trim();
  if (!notes || !/^\d{4}-\d{2}-\d{2}\n/.test(section.slice(version.length + 3))) throw new Error(`Missing dated changelog section for ${version}`);
  return notes;
}

export async function releaseMetadata(tag, root = '.') {
  const version = releaseVersion(tag);
  const [chrome, firefox, changelog] = await Promise.all([
    readFile(`${root}/manifests/chrome.json`, 'utf8').then(JSON.parse),
    readFile(`${root}/manifests/firefox.json`, 'utf8').then(JSON.parse),
    readFile(`${root}/CHANGELOG.md`, 'utf8')
  ]);
  if (chrome.version !== version || firefox.version !== version) throw new Error("Tag and both manifest versions must match");
  const unreleased = changelog.split(/^## Unreleased\s*$/m)[1]?.split(/^## /m)[0].trim();
  if (unreleased !== '') throw new Error("Move all Unreleased entries into the versioned changelog section first");
  return { version, tag, notes: releaseNotes(changelog, version) };
}

export async function writeReleaseMetadata(tag) {
  const metadata = await releaseMetadata(tag);
  await writeFile('dist/release-notes.md', `${metadata.notes}\n`);
  await writeFile('dist/amo-metadata.json', JSON.stringify({ version: { release_notes: { 'en-US': metadata.notes }, license: 'MIT' } }, null, 2) + '\n');
  return metadata;
}
