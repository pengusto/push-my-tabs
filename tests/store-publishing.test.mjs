import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { publishChrome } from '../scripts/publish-chrome.mjs';
import { amoAuthorization, firefoxVersionState } from '../scripts/publish-firefox.mjs';

const base = { publisherId: 'publisher-test', extensionId: 'bagfcickffpfkgecknaepmfleikeojik', version: '1.3.0', token: 'test-token', archive: Buffer.from('fixture') };
const revision = (state, version) => ({ state, distributionChannels: [{ crxVersion: version }] });
function api(replies) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    assert.match(url, /^https:\/\/chromewebstore.googleapis.com\//);
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    assert.ok(replies.length, `Unexpected request: ${url}`);
    const next = replies.shift();
    return { ok: next.http ? false : true, status: next.http || 200, json: async () => next };
  };
  return { calls, fetchImpl };
}
{
  const mock = api([{}, { uploadState: 'IN_PROGRESS' }, { lastAsyncUploadState: 'SUCCEEDED' }, { state: 'PENDING_REVIEW' }]);
  const result = await publishChrome({ ...base, ...mock, wait: async () => {} });
  assert.equal(result.state, 'PENDING_REVIEW');
  assert.equal(mock.calls.length, 4);
  assert.ok(mock.calls[1].url.includes('/upload/v2/'));
  assert.equal(mock.calls[1].options.body, base.archive);
  assert.deepEqual(JSON.parse(mock.calls[3].options.body), { publishType: 'DEFAULT_PUBLISH', blockOnWarnings: true });
}
for (const [field, state, action] of [['publishedItemRevisionStatus', 'PUBLISHED', 'already-published'], ['submittedItemRevisionStatus', 'PENDING_REVIEW', 'already-submitted']]) {
  const mock = api([{ [field]: revision(state, '1.3.0') }]);
  assert.equal((await publishChrome({ ...base, ...mock })).action, action);
  assert.equal(mock.calls.length, 1, 'a retry cannot upload a duplicate reviewed version');
}
for (const status of [
  { takenDown: true }, { warned: true },
  { publishedItemRevisionStatus: revision('PUBLISHED', '1.4.0') },
  { submittedItemRevisionStatus: revision('PENDING_REVIEW', '1.2.1') },
  { submittedItemRevisionStatus: revision('STAGED', '1.3.0') },
  { submittedItemRevisionStatus: revision('REJECTED', '1.3.0') }
]) {
  const mock = api([status]);
  await assert.rejects(publishChrome({ ...base, ...mock }));
  assert.equal(mock.calls.length, 1);
}
for (const upload of [{ uploadState: 'FAILED' }, { uploadState: 'SUCCEEDED', crxVersion: '9.0.0' }, { http: 401 }]) {
  const mock = api([{}, upload]);
  await assert.rejects(publishChrome({ ...base, ...mock }));
  assert.equal(mock.calls.length, 2, 'a failed upload cannot trigger publication');
}
await assert.rejects(publishChrome({ ...base, token: '', fetchImpl: () => assert.fail('missing credentials must not reach the API') }));
{
  const auth = amoAuthorization('test-issuer', 'test-secret');
  const [header, payload, signature] = auth.slice(4).split('.');
  const data = JSON.parse(Buffer.from(payload, 'base64url'));
  assert.deepEqual(JSON.parse(Buffer.from(header, 'base64url')), { alg: 'HS256', typ: 'JWT' });
  assert.equal(data.iss, 'test-issuer');
  assert.equal(data.exp - data.iat, 60);
  assert.equal(signature, createHmac('sha256', 'test-secret').update(`${header}.${payload}`).digest('base64url'));
  assert.notEqual(auth, amoAuthorization('test-issuer', 'test-secret'), 'JWTs cannot be reused across requests');
}
const firefox = { addonId: 'push-my-tabs@pengusto.github.io', version: '1.3.0', key: 'issuer', secret: 'test-secret' };
for (const [status, expected] of [['public', 'APPROVED'], ['unreviewed', 'PENDING_REVIEW'], ['disabled', 'error']]) {
  const result = firefoxVersionState({ ...firefox, fetchImpl: async (url, options) => {
    assert.match(url, /filter=all_without_unlisted/);
    assert.match(options.headers.Authorization, /^JWT /);
    return { ok: true, json: async () => ({ results: [{ version: '1.3.0', channel: 'listed', file: { status } }], next: null }) };
  } });
  if (expected === 'error') await assert.rejects(result);
  else assert.equal(await result, expected);
}
assert.equal(await firefoxVersionState({ ...firefox, fetchImpl: async () => ({ ok: true, json: async () => ({ results: [], next: null }) }) }), null);
await assert.rejects(firefoxVersionState({ ...firefox, fetchImpl: async () => ({ ok: false, status: 403 }) }));
await assert.rejects(firefoxVersionState({ ...firefox, fetchImpl: async () => ({ ok: true, json: async () => ({ results: [{ version: '1.4.0', channel: 'listed', file: { status: 'public' } }], next: null }) }) }), /newer/);
{
  let count = 0;
  assert.equal(await firefoxVersionState({ ...firefox, fetchImpl: async () => ({ ok: true, json: async () => ++count === 1 ? { results: [], next: 'next-page' } : { results: [{ version: '1.3.0', channel: 'listed', file: { status: 'unreviewed' } }], next: null } }) }), 'PENDING_REVIEW');
  assert.equal(count, 2, 'check all relevant version pages before uploading');
}
console.log('Store API v2, asynchronous upload, retry, blocked states, and AMO credential/status checks passed');
