import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { releaseVersion, releaseNotes, releaseMetadata } from '../scripts/lib/release.mjs';

assert.equal(releaseVersion('v1.3.0'), '1.3.0');
for (const tag of ['1.3.0', 'v01.3.0', 'v1.3.0-beta', 'v1.3.0\nextra', 'v1.65536.0', 'v1.3.0;pwd']) assert.throws(() => releaseVersion(tag));
const fixture = '# Changelog\n\n## Unreleased\n\n## 1.2.0 - 2026-09-20\n\n### Fixed\n\n- Previous release.\n';
assert.equal(releaseNotes(fixture, '1.2.0'), '### Fixed\n\n- Previous release.');
assert.throws(() => releaseNotes(fixture, '1.3.0'));
assert.throws(() => releaseNotes(fixture.replace('2026-09-20', 'yesterday'), '1.2.0'));
const root = await mkdtemp(`${tmpdir()}/pmt-release-`);
try {
  await mkdir(`${root}/manifests`);
  for (const name of ['chrome', 'firefox']) await writeFile(`${root}/manifests/${name}.json`, '{\n  "version": "1.2.0",\n  "unchanged": true\n}\n');
  await writeFile(`${root}/CHANGELOG.md`, fixture);
  assert.equal((await releaseMetadata('v1.2.0', root)).version, '1.2.0');
  await assert.rejects(releaseMetadata('v1.3.0', root), /manifest versions/);
  const prepare = resolve('scripts/prepare-release.mjs');
  assert.throws(() => execFileSync(process.execPath, [prepare, 'v1.3.0'], { cwd: root, stdio: 'pipe' }));
  assert.equal(JSON.parse(await readFile(`${root}/manifests/chrome.json`)).version, '1.2.0', 'invalid release cannot partially change a manifest');
  await writeFile(`${root}/CHANGELOG.md`, fixture.replace('## Unreleased', '## Unreleased\n\n### Improved\n\n- New interface.'));
  await assert.rejects(releaseMetadata('v1.2.0', root), /Unreleased/);
  execFileSync(process.execPath, [prepare, 'v1.3.0'], { cwd: root, stdio: 'pipe' });
  for (const name of ['chrome', 'firefox']) assert.deepEqual(JSON.parse(await readFile(`${root}/manifests/${name}.json`)), { version: '1.3.0', unchanged: true });
  const metadata = await releaseMetadata('v1.3.0', root);
  assert.equal(metadata.notes, '### Improved\n\n- New interface.');
  assert.throws(() => execFileSync(process.execPath, [prepare, 'v1.2.0'], { cwd: root, stdio: 'pipe' }), 'no downgrade');
} finally { await rm(root, { recursive: true, force: true }); }
console.log('Release tag, version, changelog and preparation checks passed');
