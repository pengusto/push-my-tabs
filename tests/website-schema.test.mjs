import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile('website/index.html', 'utf8');
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
assert.equal(blocks.length, 1, 'one server-readable JSON-LD graph');
const data = JSON.parse(blocks[0][1]);
assert.equal(data['@context'], 'https://schema.org');
const byType = Object.fromEntries(data['@graph'].map(node => [node['@type'], node]));
const site = byType.WebSite;
const app = byType.SoftwareApplication;
const brand = byType.Brand;
const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
assert.equal(site.url, canonical);
assert.equal(app.url, canonical);
assert.equal(site.mainEntity['@id'], app['@id']);
assert.equal(site.about['@id'], brand['@id']);
assert.equal(app.image['@id'], brand.logo['@id']);
assert.equal(site.image['@id'], brand.logo['@id']);
assert.equal(brand.logo.contentUrl, new URL('icon-512.png', canonical).href);
const png = await readFile('website/icon-512.png');
assert.equal(png.readUInt32BE(16), brand.logo.width);
assert.equal(png.readUInt32BE(20), brand.logo.height);
for (const url of app.installUrl) assert.ok(html.includes(url), 'install URL must be visible on the page');
assert.ok(html.includes('Chrome 127+'));
assert.ok(html.includes('Firefox 142+'));
for (const node of data['@graph']) {
  assert.equal(node.aggregateRating, undefined, 'no invented reviews');
  assert.equal(node.offers, undefined, 'no unsubstantiated offer');
  assert.equal(node.softwareVersion, undefined, 'avoid stale duplicated release version');
}
assert.equal(app.logo, undefined, 'logo belongs on Brand; SoftwareApplication uses image');
console.log('Website JSON-LD references, visible claims and Wingman image checks passed');
