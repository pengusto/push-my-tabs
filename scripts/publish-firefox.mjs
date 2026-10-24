#!/usr/bin/env node
import { createHmac, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, appendFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { compareVersions } from './lib/release.mjs';

const exec = promisify(execFile);
export function amoAuthorization(key, secret) {
  const iat = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const content = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ iss: key, jti: randomUUID(), iat, exp: iat + 60 })}`;
  return `JWT ${content}.${createHmac('sha256', secret).update(content).digest('base64url')}`;
}

export async function firefoxVersionState({ addonId, version, key, secret, fetchImpl = fetch }) {
  if (!addonId || !key || !secret) throw new Error('Firefox publishing requires the existing add-on ID and both AMO API credentials');
  let target = null;
  for (let page = 1; page <= 20; page++) {
    const url = `https://addons.mozilla.org/api/v5/addons/addon/${encodeURIComponent(addonId)}/versions/?filter=all_without_unlisted&page_size=50&page=${page}`;
    const response = await fetchImpl(url, { headers: { Authorization: amoAuthorization(key, secret) }, signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`Firefox Add-ons API returned HTTP ${response.status}; check the existing listing and publisher credentials`);
    const data = await response.json();
    for (const existing of data.results || []) {
      if (['public', 'unreviewed'].includes(existing.file?.status) && compareVersions(existing.version, version) > 0) throw new Error('Refusing to replace a newer approved or pending Firefox version');
      if (existing.version !== version) continue;
      if (existing.channel !== 'listed' || existing.is_disabled) throw new Error('This Firefox version is not an active listed submission');
      if (existing.file?.status === 'public') target = 'APPROVED';
      else if (existing.file?.status === 'unreviewed') target = 'PENDING_REVIEW';
      else throw new Error('This Firefox version is rejected, disabled or incomplete; inspect the developer dashboard before retrying');
    }
    if (!data.next) return target;
  }
  throw new Error('Firefox version pagination exceeded the verification limit; no upload was attempted');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let stage;
  try {
    const [archive, version] = process.argv.slice(2);
    if (!archive || !/^\d+\.\d+\.\d+$/.test(version || '')) throw new Error('Usage: node scripts/publish-firefox.mjs <zip> <version>');
    const { stdout } = await exec('unzip', ['-p', archive, 'manifest.json']);
    const manifest = JSON.parse(stdout);
    if (manifest.version !== version) throw new Error('Firefox package and release versions must match');
    const addonId = manifest.browser_specific_settings?.gecko?.id;
    const key = process.env.WEB_EXT_API_KEY, secret = process.env.WEB_EXT_API_SECRET;
    const existing = await firefoxVersionState({ addonId, version, key, secret });
    let state = existing;
    if (!existing) {
      stage = await mkdtemp(`${tmpdir()}/push-my-tabs-amo-`);
      await exec('unzip', ['-q', archive, '-d', stage]);
      // Use Mozilla's pinned client; credentials are inherited, never command arguments.
      await exec('npx', ['--yes', 'web-ext@10.5.0', 'sign', '--source-dir', stage, '--channel', 'listed', '--amo-metadata', 'dist/amo-metadata.json', '--approval-timeout', '0', '--no-input'], { timeout: 600000, maxBuffer: 2 * 1024 * 1024 });
      state = 'SUBMITTED';
    }
    const response = await fetch(`https://addons.mozilla.org/api/v5/addons/addon/${encodeURIComponent(addonId)}/`, { signal: AbortSignal.timeout(30000) });
    if (response.ok && (await response.json()).current_version?.version === version) state = 'PUBLISHED';
    const result = { version, state, action: existing ? 'already-submitted' : 'submitted' };
    await mkdir('dist/store-submissions', { recursive: true });
    await writeFile('dist/store-submissions/firefox.json', JSON.stringify(result, null, 2) + '\n');
    const summary = `Firefox ${version}: ${state} (${result.action}).\n`;
    console.log(summary.trim());
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
  } catch (error) {
    // exec errors can contain CLI output. Keep credentials and subprocess details out of CI logs.
    console.error(error.cmd ? 'Firefox submission failed; inspect the developer dashboard and rerun only the failed job.' : error.message);
    process.exitCode = 1;
  } finally { if (stage) await rm(stage, { recursive: true, force: true }); }
}
