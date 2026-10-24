import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Capture the packaged extension, using its real platform and command APIs.
// Dependencies belong to the media toolchain, not the extension bundle.
const { PLAYWRIGHT_MODULE, CHROME_EXECUTABLE } = process.env;
if (!PLAYWRIGHT_MODULE || !CHROME_EXECUTABLE) throw new Error('Set PLAYWRIGHT_MODULE and CHROME_EXECUTABLE.');
const { chromium } = await import(pathToFileURL(PLAYWRIGHT_MODULE));
const extension = resolve('dist/chrome-dev');
for (const file of ['app.js', 'app.html', 'styles.css', 'background.js', 'shortcuts.js']) {
  assert.deepEqual(await readFile(`${extension}/${file}`), await readFile(`src/${file}`), `Rebuild chrome-dev before capturing: ${file}`);
}
const destination = resolve('brag-output/composition/assets/screens');
await mkdir(destination, { recursive: true });
const profile = await mkdtemp(`${tmpdir()}/pmt-store-capture-`);
const context = await chromium.launchPersistentContext(profile, {
  executablePath: CHROME_EXECUTABLE, headless: true,
  viewport: { width: 400, height: 560 }, deviceScaleFactor: 2,
  args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
});
try {
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  const base = worker.url().replace(/\/background.js$/, '');
  await worker.evaluate(() => chrome.storage.local.set({ locale: 'de', layoutMode: 'horizontal' }));
  const page = await context.newPage();
  await page.goto(`${base}/popup.html`);
  await page.waitForSelector('#mapping-preview .action-row');
  const evidence = {
    manifest: await worker.evaluate(() => chrome.runtime.getManifest().version),
    platform: await worker.evaluate(() => chrome.runtime.getPlatformInfo()),
    commands: await worker.evaluate(() => chrome.commands.getAll()),
    views: [],
  };
  for (const view of ['navigation', 'tabloop', 'layout', 'shortcuts', 'settings']) {
    await page.locator(`[data-view="${view}"]`).click();
    if (view === 'layout') await page.locator('[name="layout-mode"][value="auto"]').check();
    await page.mouse.move(399, 559);
    await page.evaluate(async () => {
      document.activeElement?.blur();
      document.querySelector('.workspace').scrollTop = 0;
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
    await page.screenshot({ path: `${destination}/${view}.png` });
    evidence.views.push({ view, heading: await page.locator('#view-heading').textContent() });
  }
  await writeFile(`${destination}/evidence.json`, JSON.stringify(evidence, null, 2) + '\n');
  console.log(`Captured ${evidence.views.length} real Chrome extension views, v${evidence.manifest}, ${evidence.platform.os}.`);
} finally {
  await context.close();
  await rm(profile, { recursive: true, force: true });
}
