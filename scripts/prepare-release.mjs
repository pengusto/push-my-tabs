#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { releaseVersion } from './lib/release.mjs';

const version = releaseVersion(process.argv[2] || '');
const paths = ['manifests/chrome.json', 'manifests/firefox.json'];
const sources = await Promise.all(paths.map(path => readFile(path, 'utf8')));
const manifests = sources.map(JSON.parse);
if (manifests[0].version !== manifests[1].version) throw new Error('Both manifest versions must match before preparing a release');
const parts = value => value.split('.').map(Number);
const before = parts(manifests[0].version), after = parts(version);
const difference = after.map((part, index) => part - before[index]).find(value => value !== 0);
if (!(difference > 0)) throw new Error('The new version must be higher than the current version');
const changelog = await readFile('CHANGELOG.md', 'utf8');
const marker = /^## Unreleased\s*$/m;
if (!marker.test(changelog)) throw new Error('Missing Unreleased heading');
const notes = changelog.split(marker)[1].split(/^## /m)[0].trim();
if (!notes) throw new Error('Add user-facing release notes to Unreleased first');
if (changelog.includes(`## ${version} - `)) throw new Error('This changelog version already exists');
const dated = changelog.replace(marker, `## Unreleased\n\n## ${version} - ${new Date().toISOString().slice(0, 10)}`);
// Validate everything before writing any release files. Do not create or push a tag here.
for (const [index, path] of paths.entries()) await writeFile(path, sources[index].replace(/("version"\s*:\s*")[^"]+(")/, (_, start, end) => start + version + end));
await writeFile('CHANGELOG.md', dated);
console.log(`Prepared v${version}: both manifests and CHANGELOG.md. Commit the result, then push the matching tag to publish.`);
