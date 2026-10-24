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

async function pageFor(browser, kind, locale, uncertain = false) {
  const page = await browser.newPage({ viewport: { width: 920, height: 900 } });
  await page.addInitScript(({ kind, locale, uncertain, manifest, locales, base }) => {
    const saved = JSON.parse(sessionStorage.getItem("mock-settings") || "null") ?? { locale, layoutMode: "auto", presetId: "adaptive" };
    const commands = Object.entries(manifest.commands).map(([name, entry]) => ({
      name,
      description: locales[locale][entry.description.slice(6, -2)].message,
      shortcut: name.startsWith("arrow-") ? `Alt+${name.slice(6).replace(/^./, (c) => c.toUpperCase())}` : ""
    }));
    globalThis.__saved = saved;
    globalThis.__commands = commands;
    globalThis.__created = [];
    globalThis.__closed = false;
    window.close = () => { globalThis.__closed = true; };
    Object.defineProperty(navigator, "platform", { value: "MacIntel" });
    const api = {
      storage: { local: {
        get: async (defaults) => ({ ...defaults, ...saved }),
        set: async (value) => {
          if (globalThis.__failSave) throw new Error("Storage unavailable");
          if (globalThis.__holdSave) await new Promise((resolve) => { globalThis.__releaseSave = resolve; });
          Object.assign(saved, value);
          sessionStorage.setItem("mock-settings", JSON.stringify(saved));
        }
      } },
      commands: { getAll: async () => commands },
      i18n: { getUILanguage: () => locale },
      runtime: {
        getURL: (path) => `${base}/${path}`,
        getBrowserInfo: async () => ({ name: "Firefox" }),
        openOptionsPage: async () => {
          if (globalThis.__failOptions) throw new Error("Options unavailable");
          globalThis.__optionsOpened = true;
        },
        sendMessage: async () => {}
      },
      action: { setBadgeText: async () => {} },
      windows: { getLastFocused: async () => ({
        id: 1, width: 1400, height: 900,
        tabs: [{ id: 1, active: true, url: "https://example.com/page", width: uncertain ? 1100 : 1390, height: 780 }]
      }) },
      tabs: { create: async (details) => globalThis.__created.push(details) }
    };
    if (kind === "firefox") {
      api.browserSettings = { verticalTabs: { get: async () => ({ value: true }) } };
      api.commands.update = async ({ name, shortcut }) => {
        if (globalThis.__failSave) throw new Error("Shortcut rejected");
        commands.find((command) => command.name === name).shortcut = shortcut;
      };
    }
    globalThis[kind === "firefox" ? "browser" : "chrome"] = api;
  }, { kind, locale, uncertain, manifest, locales, base });
  return page;
}
async function screenshot(page, name) {
  if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true });
}
async function noOverflow(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
}

try {
  for (const [kind, engine] of [["chrome", chromium], ["firefox", firefox]]) {
    const browser = await engine.launch({ headless: true, ...(kind === "firefox" && process.env.FIREFOX_BINARY ? { executablePath: process.env.FIREFOX_BINARY } : {}) });
    try {
      const popup = await pageFor(browser, kind, "de");
      await popup.setViewportSize({ width: 360, height: 600 });
      await popup.goto(`${base}/popup.html`);
      await popup.waitForSelector("#mapping-preview > div");
      assert.equal(await popup.locator("#mapping-preview > div").count(), 4);
      assert.match(await popup.locator("#detected").textContent(), kind === "chrome" ? /Automatisch geschätzt: Horizontal/ : /Nativ erkannt: Vertikal/);
      assert.ok((await popup.locator("#setup-shortcuts").boundingBox()).y < 556);
      assert.ok((await popup.locator("#options").boundingBox()).y < 556, "daily controls fit in 600px");
      await noOverflow(popup);
      await screenshot(popup, `${kind}-popup-de`);
      if (kind === "chrome") {
        await popup.locator(".detection-settings > summary").click();
        await popup.locator("#remember-site").click();
        await popup.waitForFunction(() => document.querySelector("#detected").textContent.includes("Manuell festgelegt: Horizontal"));
        assert.equal(await popup.locator("#remember-site").isDisabled(), true);
        await popup.locator(".detection-settings > summary").click();
      }
      await popup.locator("#setup-shortcuts").click();
      await popup.waitForFunction(() => __created.length === 1);
      assert.equal(await popup.evaluate(() => __created[0].url), kind === "chrome" ? "chrome://extensions/shortcuts" : `${base}/options.html#direction-shortcuts`);
      await popup.evaluate(() => { __closed = false; __failOptions = true; });
      await popup.locator("#options").click();
      await popup.locator("#retry-save").waitFor({ state: "visible" });
      assert.equal(await popup.evaluate(() => __closed), false, "failed navigation keeps popup open");
      await popup.evaluate(() => { __failOptions = false; });
      await popup.locator("#retry-save").click();
      await popup.waitForFunction(() => __optionsOpened && __closed);

      const options = await pageFor(browser, kind, "en");
      await options.goto(`${base}/options.html`);
      await options.waitForSelector("#shortcuts .effective-action");
      assert.equal(await options.locator("#recent-commands .shortcut-row").count(), 3);
      assert.match(await options.locator("#shortcuts .effective-action").first().textContent(), /Horizontal:.*Vertical:/);
      await options.locator("#layout-mode").selectOption("vertical", { force: true });
      await options.waitForFunction(() => __saved.layoutMode === "vertical");
      assert.equal(await options.locator("#shortcuts .effective-action").first().textContent(), locales.en.actionMoveBackward.message);
      if (kind === "firefox") {
        const firstShortcut = options.locator("#shortcuts input").first();
        await firstShortcut.fill("");
        await firstShortcut.press("Tab");
        await options.waitForFunction(() => document.querySelector("#shortcut-summary").textContent === "3/4");
        await options.locator("#shortcuts button").first().click();
        await options.waitForFunction(() => document.querySelector("#shortcut-summary").textContent === "✓ 4/4");
        assert.equal(await firstShortcut.inputValue(), "Command+Left");
        await options.locator("#recent-commands .shortcut-row").filter({ hasText: locales.en.commandRecentTabDescription.message }).locator("button").click();
        await options.waitForFunction(() => __commands.find((c) => c.name === "recent-tab-switch").shortcut === "Alt+S");
        assert.equal(await options.locator("#recent-commands .shortcut-row").filter({ hasText: locales.en.commandRecentTabDescription.message }).locator("input").inputValue(), "Alt+S");
      } else {
        assert.equal(await options.locator("#shortcuts input").first().getAttribute("readonly"), "");
      }
      await options.evaluate(() => { __failSave = true; });
      await options.locator("#wrap").uncheck();
      await options.locator("#retry-save").waitFor({ state: "visible" });
      assert.equal(await options.evaluate(() => __saved.wrapSwitching), undefined, "failed write does not become saved state");
      await options.evaluate(() => { __failSave = false; });
      await options.locator("#retry-save").click();
      await options.waitForFunction(() => __saved.wrapSwitching === false);
      await options.locator("#retry-save").waitFor({ state: "hidden" });
      await options.evaluate(() => {
        __commands.find((c) => c.name === "arrow-left").shortcut = "Alt+Shift+Left";
        window.dispatchEvent(new Event("focus"));
      });
      await options.waitForFunction(() => document.querySelector("#shortcuts input").value === "Alt+Shift+Left");
      await noOverflow(options);
      await screenshot(options, `${kind}-settings-en`);
      await options.setViewportSize({ width: 390, height: 900 });
      await noOverflow(options);
      await screenshot(options, `${kind}-settings-narrow`);
      await options.close();
      await popup.close();

      const rtl = await pageFor(browser, kind, "ar");
      await rtl.setViewportSize({ width: 360, height: 600 });
      await rtl.goto(`${base}/popup.html`);
      await rtl.waitForSelector("#mapping-preview > div");
      await noOverflow(rtl);
      await screenshot(rtl, `${kind}-popup-ar`);
      await rtl.close();
      if (kind === "chrome") {
        const uncertain = await pageFor(browser, kind, "de", true);
        await uncertain.setViewportSize({ width: 360, height: 600 });
        await uncertain.goto(`${base}/popup.html`);
        await uncertain.locator("#layout-confirmation").waitFor({ state: "visible" });
        assert.equal(await uncertain.locator("#options").isVisible(), true);
        assert.equal(await uncertain.locator("#mapping-preview").isVisible(), true);
        await screenshot(uncertain, "chrome-popup-uncertain");
        await uncertain.evaluate(() => { __holdSave = true; });
        await uncertain.locator('[data-layout="horizontal"]').click();
        await uncertain.waitForFunction(() => typeof __releaseSave === "function");
        assert.equal(await uncertain.evaluate(() => __saved.siteProfiles), undefined, "confirmation awaits durable save before reload");
        await uncertain.evaluate(() => { __holdSave = false; __releaseSave(); });
        await uncertain.waitForFunction(() => document.querySelector("#detected").textContent.includes("Manuell festgelegt: Horizontal"));
        await screenshot(uncertain, "chrome-popup-confirmed");
        await uncertain.close();
      }
      console.log(`${kind}: popup hierarchy, effective actions, CLUT setup, save retry, navigation failure and RTL checks passed (mock extension APIs)`);
    } finally {
      await browser.close();
    }
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
