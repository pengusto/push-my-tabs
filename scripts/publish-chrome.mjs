#!/usr/bin/env node
import { readFile, writeFile, appendFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { compareVersions as compare } from './lib/release.mjs';

const versions = revision => (revision?.distributionChannels || []).map(channel => channel.crxVersion);

export async function publishChrome({ publisherId, extensionId, version, token, archive, fetchImpl = fetch, wait = delay }) {
  if (!/^[\w-]+$/.test(publisherId || '') || !/^[a-p]{32}$/.test(extensionId || '') || !token) throw new Error('Chrome publishing requires publisher ID, extension ID and a short-lived access token');
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Invalid Chrome release version');
  const name = `publishers/${publisherId}/items/${extensionId}`;
  const base = 'https://chromewebstore.googleapis.com';
  async function request(path, options = {}) {
    const response = await fetchImpl(`${base}${path}`, { ...options, headers: { Authorization: `Bearer ${token}`, ...options.headers }, signal: AbortSignal.timeout(60000) });
    // Never log request headers, tokens or complete API responses.
    if (!response.ok) throw new Error(`Chrome Web Store API returned HTTP ${response.status}; inspect the developer dashboard before retrying`);
    return response.json();
  }
  const status = await request(`/v2/${name}:fetchStatus`);
  if (status.takenDown || status.warned) throw new Error('Chrome reports a policy warning or takedown; resolve it in the developer dashboard first');
  const published = status.publishedItemRevisionStatus;
  if (versions(published).some(value => compare(value, version) > 0)) throw new Error('Refusing to replace a newer published Chrome version');
  if (published?.state === 'PUBLISHED' && versions(published).some(value => compare(value, version) === 0)) return { version, state: 'PUBLISHED', action: 'already-published' };
  const submitted = status.submittedItemRevisionStatus;
  const sameSubmission = versions(submitted).some(value => compare(value, version) === 0);
  if (submitted?.state === 'PENDING_REVIEW') {
    if (sameSubmission) return { version, state: 'PENDING_REVIEW', action: 'already-submitted' };
    throw new Error('A different Chrome version is already under review; do not replace it automatically');
  }
  if (submitted?.state === 'STAGED') throw new Error('A Chrome version is staged; resolve that submission in the developer dashboard first');
  if (sameSubmission && ['REJECTED', 'PUBLISHED_TO_TESTERS'].includes(submitted?.state)) throw new Error('This Chrome submission requires attention in the developer dashboard');
  {
    const upload = await request(`/upload/v2/${name}:upload`, { method: 'POST', headers: { 'Content-Type': 'application/zip' }, body: archive });
    if (upload.crxVersion && upload.crxVersion !== version) throw new Error('Chrome accepted a different package version than requested');
    let state = upload.uploadState;
    for (let attempt = 0; state === 'IN_PROGRESS' && attempt < 30; attempt++) {
      await wait(5000);
      state = (await request(`/v2/${name}:fetchStatus`)).lastAsyncUploadState;
    }
    if (state !== 'SUCCEEDED') throw new Error('Chrome package upload did not finish successfully; no publish request was sent');
  }
  const result = await request(`/v2/${name}:publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publishType: 'DEFAULT_PUBLISH', blockOnWarnings: true }) });
  if (!['PENDING_REVIEW', 'PUBLISHED'].includes(result.state)) throw new Error('Chrome did not confirm submission; inspect the developer dashboard');
  return { version, state: result.state, action: 'submitted' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [archivePath, version] = process.argv.slice(2);
  try {
    if (!archivePath) throw new Error('Usage: node scripts/publish-chrome.mjs <zip> <version>');
    const result = await publishChrome({ publisherId: process.env.CWS_PUBLISHER_ID, extensionId: process.env.CWS_EXTENSION_ID, token: process.env.CWS_ACCESS_TOKEN, archive: await readFile(archivePath), version });
    await mkdir('dist/store-submissions', { recursive: true });
    await writeFile('dist/store-submissions/chrome.json', JSON.stringify(result, null, 2) + '\n');
    const summary = `Chrome ${version}: ${result.state} (${result.action}).\n`;
    console.log(summary.trim());
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
