// Optional browser regressions. Uses installed Playwright; no extension permissions are granted.
// PLAYWRIGHT_MODULE may point to an existing Playwright index.mjs; SCREENSHOT_DIR is optional.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
const { chromium, firefox } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const manifest = JSON.parse(await readFile("manifests/chrome.json", "utf8"));
const locales = Object.fromEntries(await Promise.all(["en", "de", "ar"].map(async (locale) => [locale,
  JSON.parse(await readFile(`src/_locales/${locale}/messages.json`, "utf8"))
])));
const root = resolve("src");
const server = createServer(async (request, response) => {
  try {
    const path = resolve(root, `.${new URL(request.url, "http://localhost").pathname}`);
    if (!path.startsWith(`${root}/`)) throw new Error("outside source");
    const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };
    response.setHeader("Content-Type", `${types[extname(path)] || "application/octet-stream"}; charset=utf-8`);
    response.end(await readFile(path));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const shots = process.env.SCREENSHOT_DIR;
if (shots) await mkdir(shots, { recursive: true });


async function pageFor(browser, kind, locale, options = {}) {
  const page = await browser.newPage({ viewport: { width: 400, height: 560 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(({ kind, locale, options, manifest, base }) => {
    const os = options.os ?? "mac";
    const saved = JSON.parse(sessionStorage.getItem("mock-settings") || "null") ?? { locale, layoutMode: "auto", presetId: "adaptive", ...options.saved };
    if (options.poison) saved.siteProfiles = { '<img src=x onerror="globalThis.__injected=true">': { '20:120': 'horizontal' } };
    const commands = Object.entries(manifest.commands).map(([name, entry]) => ({ name, description: name, shortcut: name.startsWith("arrow-") ? `${os === "mac" ? "Command" : "Ctrl"}+${name.slice(6).replace(/^./, c => c.toUpperCase())}` : "" }));
    const tabs = [{ id: 1, windowId: 1, active: true, incognito: Boolean(options.private), url: "https://example.com/page", width: options.unknown ? undefined : options.uncertain ? 1100 : 1390, height: options.unknown ? undefined : 780 }, { id: 2, windowId: 1 }, { id: 3, windowId: 1 }];
    const win = { id: 1, width: 1400, height: 900, tabs };
    Object.assign(globalThis, { __tabs: tabs, __saved: saved, __commands: commands, __created: [], __messages: [], __closed: false, __nativeReads: 0, __loadToken: Math.random() });
    window.close = () => { __closed = true; };
    const api = {
      storage: { local: {
        get: async (defaults) => ({ ...defaults, ...saved }),
        set: async (value) => {
          if (__failSave) throw new Error("Storage unavailable");
          if (__holdSave) await new Promise(resolve => { __releaseSave = resolve; });
          Object.assign(saved, value);
          sessionStorage.setItem("mock-settings", JSON.stringify(saved));
        }
      } },
      commands: { getAll: async () => commands },
      i18n: { getUILanguage: () => locale },
      runtime: {
        id: "test-extension", getURL: path => `${base}/${path}`,
        getManifest: () => manifest,
        getPlatformInfo: async () => ({ os }),
        getBrowserInfo: async () => options.zen ? ({ name: "Firefox", zen: { version: "1.23.4b" } }) : ({ name: "Firefox" }),
        sendMessage: async details => { __messages.push(details); return __failCommand ? { ok: false, error: "Unavailable" } : { ok: true }; }
      },
      extension: { isAllowedIncognitoAccess: async () => false },
      action: { setBadgeText: async () => {} },
      windows: { getLastFocused: async () => win, get: async () => win, getAll: async () => [win] },
      tabs: { create: async details => { if (__failCreate) throw new Error("Could not open browser settings"); __created.push(details); } }
    };
    if (kind === "firefox") {
      api.browserSettings = { verticalTabs: { get: async () => { __nativeReads += 1; return { value: options.zen ? false : true }; } } };
      api.commands.update = async ({ name, shortcut }) => {
        if (__failSave) throw new Error("Shortcut rejected");
        commands.find(c => c.name === name).shortcut = shortcut;
      };
    }
    Object.assign(globalThis, { __failSave: false, __holdSave: false, __failCommand: false, __failCreate: false });
    globalThis[kind === "firefox" ? "browser" : "chrome"] = api;
  }, { kind, locale, options, manifest, base });
  return { page, errors };
}
async function ready(page, path = "popup.html") {
  await page.goto(`${base}/${path}`);
  await page.waitForSelector('#mapping-preview .action-row', { state: 'attached' });
}
async function view(page, name) {
  await page.locator(`[data-view="${name}"]`).click();
  await page.waitForFunction(name => !document.querySelector(`[data-page="${name}"]`).hidden, name);
}
async function shot(page, name) {
  await page.mouse.move(399, 559);
  await page.waitForTimeout(160);
  // Deep-link and keyboard focus behavior are checked separately; captures start at the top.
  await page.evaluate(async () => {
    document.activeElement?.blur();
    window.scrollTo(0, 0);
    document.querySelector('.workspace').scrollTop = 0;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true });
}
async function noOverflow(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.querySelector('.workspace').scrollWidth <= document.querySelector('.workspace').clientWidth + 1), true);
}
try {
  for (const [kind, engine] of [["chrome", chromium], ["firefox", firefox]]) {
    const browser = await engine.launch({ headless: true });
    try {
      const { page, errors } = await pageFor(browser, kind, "de");
      await ready(page);
      assert.equal(await page.locator('.rail [data-view]').count(), 5);
      assert.match(await page.locator('#detected').textContent(), kind === "chrome" ? /Automatisch geschätzt: Horizontal/ : /Nativ erkannt: Vertikal/);
      assert.equal(await page.locator('#mapping-preview kbd').first().textContent(), '⌘←');
      for (const name of ['navigation', 'tabloop', 'layout', 'shortcuts', 'settings']) {
        await view(page, name);
        await noOverflow(page);
        assert.equal(await page.locator('.rail [aria-current="page"]').getAttribute('data-view'), name);
        await shot(page, `${kind}-${name}`);
      }
      assert.equal(await page.locator('#private-status').textContent(), 'Nicht erlaubt');
      if (kind === 'firefox') {
        await page.locator('#private-help').waitFor({ state: 'visible' });
        assert.match(await page.locator('#private-help').textContent(), /Erweiterungen und Themes/);
        assert.equal(await page.locator('[data-open-permissions]:visible').count(), 0, 'Firefox gives manual steps instead of opening a blocked privileged URL');
      } else {
        await page.locator('.private-settings [data-open-permissions]').click();
        assert.equal(await page.evaluate(() => __created.at(-1).url), 'chrome://extensions/?id=test-extension');
        await page.evaluate(() => { __closed = false; __created.length = 0; });
      }
      await page.evaluate(() => { __failSave = true; });
      await page.locator('#wrap').uncheck();
      await page.locator('#retry-save').waitFor({ state: 'visible' });
      assert.equal(await page.evaluate(() => __saved.wrapSwitching), undefined);
      await page.evaluate(() => { __failSave = false; });
      await page.locator('#retry-save').click();
      await page.waitForFunction(() => __saved.wrapSwitching === false);
      await view(page, 'shortcuts');
      const functionCount = await page.locator('[data-shortcut]').count();
      assert.equal(await page.locator('.shortcut-default').count(), 4, 'only manifest installation defaults are marked');
      assert.equal(await page.locator('[data-shortcut="arrow-left"] .shortcut-default').textContent(), 'Installationsstandard');
      assert.equal(await page.locator('[data-shortcut="recent-tab-switch"] .shortcut-default').count(), 0, 'recommendations are not installation defaults');
      assert.equal(await page.locator('#shortcut-summary').textContent(), `4 von ${functionCount} Funktionen belegt`);
      assert.equal(await page.locator('.shortcut-recommendation').count(), functionCount, 'all functions explain their recommendation status');
      assert.equal(await page.locator('#recent-shortcuts').getAttribute('open'), '', 'TabLoop bindings are visible by default');
      const tabloopRow = page.locator('[data-shortcut="recent-tab-switch"]');
      assert.equal(await tabloopRow.locator('.shortcut-recommendation').textContent(), 'Empfehlung: ⌥S');
      assert.equal(await tabloopRow.locator('.shortcut-assignment').textContent(), 'Nicht belegt');
      assert.equal(await page.locator('[data-shortcut="recent-tab-quick-switch"] .shortcut-recommendation').textContent(), 'Keine Standardempfehlung');
      assert.equal(await page.evaluate(() => __commands.find(c => c.name === 'recent-tab-switch').shortcut), '', 'displaying a recommendation never assigns it');
      if (kind === 'firefox') {
        const row = page.locator('[data-shortcut="arrow-left"]');
        await row.locator('input').fill('');
        await row.locator('input').press('Tab');
        await page.waitForFunction(() => __commands.find(c => c.name === 'arrow-left').shortcut === '');
        await row.locator('button').click();
        await page.waitForFunction(() => __commands.find(c => c.name === 'arrow-left').shortcut === 'Command+Left');
        await page.locator('[data-shortcut="recent-tab-switch"] button').click();
        await page.waitForFunction(() => __commands.find(c => c.name === 'recent-tab-switch').shortcut === 'Alt+S');
        await page.waitForFunction(() => document.querySelector('[data-shortcut="recent-tab-switch"] .shortcut-assignment').textContent === 'Belegt');
        assert.equal(await page.locator('#shortcut-summary').textContent(), `5 von ${functionCount} Funktionen belegt`);
      } else {
        assert.equal(await page.locator('#shortcuts input').count(), 0, 'Chrome has genuine read-only binding displays');
        await page.evaluate(() => { __failCreate = true; __closed = false; });
        await page.locator('#shortcut-settings').click();
        await page.locator('#retry-save').waitFor({ state: 'visible' });
        assert.equal(await page.evaluate(() => __closed), false);
        await page.evaluate(() => { __failCreate = false; });
        await page.locator('#retry-save').click();
        await page.waitForFunction(() => __closed && __created.length === 1);
        assert.equal(await page.evaluate(() => __created[0].url), 'chrome://extensions/shortcuts');
      }
      await page.evaluate(() => { __commands.find(c => c.name === 'arrow-left').shortcut = 'Alt+Shift+Left'; __commands.find(c => c.name === 'recent-tab-switch').shortcut = 'Alt+S'; window.dispatchEvent(new Event('focus')); });
      await page.waitForFunction(() => document.querySelector('#shortcuts kbd').textContent === '⌥⇧←');
      assert.equal(await page.locator('#shortcut-summary').textContent(), `5 von ${functionCount} Funktionen belegt`);
      assert.equal(await page.locator('[data-shortcut="arrow-left"] .shortcut-recommendation').textContent(), 'Empfehlung: ⌘←', 'actual binding and recommendation remain distinct');
      await page.locator('#preset-settings summary').click();
      await page.locator('#preset').selectOption('custom');
      await page.waitForFunction(() => __saved.presetId === 'custom');
      await page.locator('[data-mapping="horizontal"] select').first().selectOption('none');
      await page.waitForFunction(() => __saved.customPreset?.horizontal['arrow-left'] === 'none');
      assert.equal(await page.evaluate(() => __saved.presetId), 'custom');
      assert.deepEqual(errors, []);
      await page.close();

      const rtl = (await pageFor(browser, kind, 'ar')).page;
      await ready(rtl);
      for (const name of ['navigation', 'tabloop', 'layout', 'shortcuts', 'settings']) { await view(rtl, name); await noOverflow(rtl); }
      await shot(rtl, `${kind}-rtl-settings`);
      assert.equal(await rtl.getAttribute('html','dir'), 'rtl');
      await rtl.close();

      const options = (await pageFor(browser, kind, 'en')).page;
      await options.setViewportSize({ width: 1000, height: 900 });
      await ready(options, 'options.html#recent-shortcuts');
      assert.equal(await options.locator('#recent-shortcuts').getAttribute('open'), '');
      await noOverflow(options);
      await shot(options, `${kind}-options`);
      await options.setViewportSize({ width: 390, height: 780 });
      await view(options, 'settings');
      await noOverflow(options);
      await shot(options, `${kind}-options-narrow`);
      await options.close();

      if (kind === 'chrome') {
        for (const os of ['win', 'linux']) {
          const platform = (await pageFor(browser, kind, 'en', { os })).page;
          await ready(platform);
          assert.equal(await platform.locator('#mapping-preview kbd').first().textContent(), 'Ctrl+←');
          await view(platform, 'shortcuts');
          assert.match(await platform.locator('#platform-caption').textContent(), os === 'win' ? /Windows/ : /Linux/);
          await shot(platform, `${os}-shortcuts`);
          await platform.close();
        }
      }
      const unsafe = (await pageFor(browser, kind, 'en', { poison:true })).page;
      await ready(unsafe);
      await view(unsafe,'layout');
      await unsafe.locator('#saved-profiles summary').click();
      assert.equal(await unsafe.locator('#site-profiles img').count(), 0);
      assert.equal(await unsafe.evaluate(() => globalThis.__injected), undefined, 'profile labels are text, never HTML');
      await unsafe.close();
      const forced = (await pageFor(browser, kind, 'de', kind === 'firefox' ? { zen: true } : {})).page;
      await ready(forced);
      await view(forced, 'layout');
      await forced.locator('[name="layout-mode"][value="horizontal"]').check();
      await forced.waitForFunction(() => __saved.layoutMode === 'horizontal');
      await forced.locator('#confirmation-auto-help').waitFor({ state: 'visible' });
      await forced.locator('[data-layout="vertical"]').click();
      await forced.evaluate(() => { __failSave = true; });
      await forced.locator('#remember-layout').click();
      await forced.locator('#retry-save').waitFor({ state: 'visible' });
      assert.equal(await forced.evaluate(() => __saved.layoutMode), 'horizontal', 'failed confirmation preserves the global mode');
      assert.equal(await forced.evaluate(() => __saved.siteProfiles), undefined);
      await forced.evaluate(() => { __failSave = false; });
      await forced.locator('#retry-save').click();
      await forced.waitForFunction(() => __saved.layoutMode === 'auto' && Object.values(__saved.layoutHints || {}).includes('vertical'));
      await forced.waitForFunction(() => document.querySelector('#layout-source').textContent.includes('Manuell festgelegt: Vertikal'));
      assert.equal(await forced.locator('[data-layout="vertical"]').getAttribute('aria-pressed'), 'true', 'a remembered tile becomes the effective layout');
      assert.equal(await forced.locator('[name="layout-mode"][value="auto"]').isChecked(), true);
      await forced.close();
      const ambiguous = (await pageFor(browser, kind, 'de', kind === 'firefox' ? { zen: true } : { uncertain: true })).page;
      await ready(ambiguous);
      await ambiguous.locator('#confirmation-notice').waitFor({ state:'visible' });
      assert.equal(await ambiguous.locator('#mapping-preview button:disabled').count(), 4);
      const loadToken = await ambiguous.evaluate(() => __loadToken);
      await view(ambiguous, 'layout');
      assert.equal(await ambiguous.locator('#profile-scope').inputValue(), 'geometry', 'confirmations default to reuse across sites');
      await ambiguous.locator('[data-layout="vertical"]').click();
      await ambiguous.evaluate(() => { __holdSave = true; });
      await ambiguous.locator('#remember-layout').click();
      await ambiguous.waitForFunction(() => typeof __releaseSave === 'function');
      assert.equal(await ambiguous.evaluate(() => __saved.siteProfiles), undefined);
      await ambiguous.evaluate(() => { __holdSave = false; __releaseSave(); });
      await ambiguous.waitForFunction(() => document.querySelector('#layout-source').textContent.includes('Manuell festgelegt: Vertikal'));
      assert.deepEqual(await ambiguous.evaluate(() => __saved.siteProfiles), {}, 'shared calibration does not store a new site URL');
      assert.equal(await ambiguous.evaluate(() => __loadToken), loadToken, 'confirming does not reload or resize popup');
      if (kind === 'firefox') assert.equal(await ambiguous.evaluate(() => __nativeReads), 0, 'Zen never trusts inherited native setting');
      await view(ambiguous, 'navigation');
      await ambiguous.evaluate(() => { __failCommand = true; });
      await ambiguous.locator('#mapping-preview button').first().click();
      await ambiguous.locator('#retry-save').waitFor({ state:'visible' });
      assert.equal(await ambiguous.evaluate(() => __closed), false, 'failed command keeps UI reachable');
      await ambiguous.evaluate(() => { __failCommand = false; });
      await ambiguous.locator('#retry-save').click();
      await ambiguous.waitForFunction(() => __closed);
      assert.equal(await ambiguous.evaluate(() => __messages.at(-1).targetTabId), 1);
      await ambiguous.close();

      // Existing explicit site/path overrides remain supported. A new global
      // confirmation must take effect on the current tab despite older overrides.
      const calibrated = (await pageFor(browser, kind, 'en', {
        uncertain: true, ...(kind === 'firefox' ? { zen: true } : {}),
        saved: { siteProfiles: { 'https://example.com': { '300:120': 'horizontal' }, 'https://example.com/page': { '300:120': 'horizontal' } } }
      })).page;
      await ready(calibrated);
      await view(calibrated, 'layout');
      await calibrated.locator('[data-layout="vertical"]').click();
      await calibrated.locator('#remember-layout').click();
      await calibrated.waitForFunction(() => __saved.layoutHints?.['300:120'] === 'vertical');
      assert.equal(await calibrated.evaluate(() => __saved.siteProfiles['https://example.com/page']['300:120']), 'vertical');
      assert.match(await calibrated.locator('#layout-source').textContent(), /Manually set: Vertical/);
      await calibrated.evaluate(() => { __tabs[0].url = 'https://another.example/'; __tabs[0].width = 1080; });
      await calibrated.locator('[name="layout-mode"][value="horizontal"]').check();
      await calibrated.waitForFunction(() => __saved.layoutMode === 'horizontal');
      await calibrated.locator('[name="layout-mode"][value="auto"]').check();
      await calibrated.waitForFunction(() => __saved.layoutMode === 'auto');
      assert.match(await calibrated.locator('#detected').textContent(), /Manually set: Vertical/);
      assert.equal(await calibrated.locator('#confirmation-notice').isVisible(), false);
      await view(calibrated, 'layout');
      await calibrated.locator('#profile-scope').selectOption('path');
      await calibrated.locator('[data-layout="horizontal"]').click();
      await calibrated.locator('#remember-layout').click();
      await calibrated.waitForFunction(() => __saved.siteProfiles['https://another.example/']?.['320:120'] === 'horizontal');
      assert.equal(await calibrated.evaluate(() => __saved.layoutHints['300:120']), 'vertical', 'path-specific saves do not overwrite the shared calibration');
      await calibrated.close();
      console.log(`${kind}: five screens, platform glyphs, save/retry, command acknowledgement, profiles, presets, RTL and options checks passed (mock extension APIs)`);
    } finally { await browser.close(); }
  }
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
