import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, chmod, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

async function setup(t, options = {}) {
  const dir = await mkdtemp(`${tmpdir()}/pmt-cloud-setup-`);
  t.after(() => rm(dir, {recursive:true, force:true}));
  const log = `${dir}/calls.jsonl`;
  await writeFile(`${dir}/gcloud`, `#!/usr/bin/env node
import fs from 'node:fs';
const a=process.argv.slice(2),s=a.join(' ');
fs.appendFileSync(process.env.MOCK_LOG,JSON.stringify(a)+'\\n');
if(s.startsWith('auth list')) console.log(process.env.MOCK_ACCOUNT);
else if(s.startsWith('billing projects describe')) console.log(process.env.MOCK_BILLING);
else if(s.startsWith('projects describe')) console.log('474097420976');
else if(s.includes('providers describe')) {
 if(process.env.MOCK_EXISTING!=='1') process.exit(1);
 console.log(s.includes('attributeCondition')?'wrong-repository':s.includes('oidc.issuerUri')?'https://token.actions.githubusercontent.com':'{}');
}
else if(s.includes(' describe ')) process.exit(1);
`);
  await chmod(`${dir}/gcloud`, 0o755);
  const result = spawnSync('bash', [resolve('scripts/connect-google-cloud.sh'), 'push-my-tabs-releases', 'approved@example.invalid'], {
    encoding:'utf8', env:{...process.env,PATH:`${dir}:${process.env.PATH}`,MOCK_LOG:log,MOCK_ACCOUNT:options.account??'approved@example.invalid',MOCK_BILLING:options.billing??'False',MOCK_EXISTING:options.existing?'1':'0'},
  });
  const calls = (await readFile(log,'utf8')).trim().split('\n').map(JSON.parse);
  return {result,calls};
}

test('Cloud setup refuses a different Google account before any mutation', async t => {
  const {result,calls}=await setup(t,{account:'different@example.invalid'});
  assert.notEqual(result.status,0);
  assert.deepEqual(calls.map(a=>a.slice(0,2)),[['auth','list']]);
});
for(const billing of ['True','']) test(`Cloud setup refuses unverified disabled billing (${JSON.stringify(billing)})`, async t => {
  const {result,calls}=await setup(t,{billing});
  assert.notEqual(result.status,0);
  assert.equal(calls.some(a=>a.includes('create')||a.includes('enable')||a.includes('add-iam-policy-binding')),false);
});

test('Cloud setup limits federation to this release workflow and creates no project role or key', async t => {
  const {result,calls}=await setup(t);
  assert.equal(result.status,0,result.stderr);
  const create=calls.find(a=>a.includes('create-oidc'));
  assert.ok(create);
  const condition=create.find(a=>a.startsWith('--attribute-condition='));
  for(const requirement of ["assertion.repository_id == '1309289503'","assertion.repository_owner_id == '106893073'",'repo:pengusto/push-my-tabs:environment:chrome-web-store','.github/workflows/release.yml@refs/heads/main','.github/workflows/release.yml@refs/tags/v',"assertion.event_name == 'push'","assertion.event_name == 'workflow_dispatch'"]) assert.ok(condition.includes(requirement),requirement);
  const grant=calls.find(a=>a.includes('add-iam-policy-binding'));
  assert.equal(grant[0],'iam');
  assert.equal(grant[1],'service-accounts');
  assert.ok(grant.includes('--role=roles/iam.workloadIdentityUser'));
  assert.ok(grant.some(a=>a.endsWith('/attribute.repository_id/1309289503')));
  assert.equal(calls.some(a=>a.includes('keys')),false);
  assert.match(result.stdout,/CWS_WORKLOAD_IDENTITY_PROVIDER=projects\/474097420976/);
});

test('Cloud setup does not replace a different existing identity provider or grant it access', async t => {
  const {result,calls}=await setup(t,{existing:true});
  assert.notEqual(result.status,0);
  assert.equal(calls.some(a=>a.includes('update-oidc')||a.includes('add-iam-policy-binding')),false);
});
