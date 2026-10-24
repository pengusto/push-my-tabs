import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const chrome = JSON.parse(await readFile("manifests/chrome.json", "utf8"));
const firefox = JSON.parse(await readFile("manifests/firefox.json", "utf8"));
const changelog = await readFile("CHANGELOG.md", "utf8");

assert.equal(chrome.version, firefox.version);
assert.match(changelog, new RegExp(`^## ${chrome.version} - \\d{4}-\\d{2}-\\d{2}$`, "m"));
assert.deepEqual(chrome.permissions, ["storage", "activeTab"]);
assert.equal(chrome.minimum_chrome_version, "127");
assert.equal(chrome.incognito, "spanning");
assert.deepEqual(firefox.permissions, ["storage", "browserSettings"]);
assert.deepEqual(firefox.browser_specific_settings, {
  gecko: {
    id: "push-my-tabs@pengusto.github.io",
    strict_min_version: "142.0",
    data_collection_permissions: { required: ["none"] }
  }
});
for (const manifest of [chrome, firefox]) {
  assert.equal(manifest.homepage_url, "https://github.com/pengusto/push-my-tabs");
  const { homepage_url, ...executableManifest } = manifest;
  assert.doesNotMatch(JSON.stringify(executableManifest), /https?:\/\//, "manifest must not introduce remote resources");
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(Object.keys(manifest.commands).sort(), [
    "arrow-down", "arrow-left", "arrow-right", "arrow-up",
    "duplicate-tab",
    "history-back", "history-forward",
    "move-first", "move-last", "move-to-new-window", "move-to-next-window",
    "new-tab-after", "new-tab-before", "new-tab-end",
    "recent-tab-quick-switch", "recent-tab-switch", "recent-tab-switch-reverse",
    "switch-first", "switch-last", "switch-next-window", "switch-previous-window",
    "toggle-mute", "toggle-pin"
  ]);
  assert.ok(!manifest.host_permissions);
  assert.ok(!manifest.content_scripts);
  assert.ok(!manifest.externally_connectable);
  for (const [size, path] of Object.entries(manifest.icons)) {
    await checkPng(`src/${path}`, Number(size));
  }
  for (const [size, path] of Object.entries(manifest.action.default_icon)) {
    await checkPng(`src/${path}`, Number(size));
  }
}

async function checkPng(path, size) {
  const data = await readFile(path);
  assert.equal(data.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${path} must be PNG`);
  assert.equal(data.readUInt32BE(16), size, `${path} width`);
  assert.equal(data.readUInt32BE(20), size, `${path} height`);
}

for (const [path, size] of Object.entries({
  "website/logo-128.png": 128,
  "website/favicon-32.png": 32,
  "website/apple-touch-icon.png": 180,
  "website/icon-192.png": 192,
  "website/icon-512.png": 512,
  "website/maskable-512.png": 512
})) await checkPng(path, size);

for (const file of [

  "src/options.html", "src/popup.html", "src/styles.css",
  "src/api.js", "src/background.js", "src/i18n.js", "src/layout.js",
  "src/options.js", "src/popup.js", "src/ui.js", "src/app.js", "src/app.html", "src/shortcuts.js", "src/icons.js"
]) {
  // SVG namespace identifiers are local DOM metadata, not network endpoints.
  const source = (await readFile(file, "utf8")).replaceAll("http://www.w3.org/2000/svg", "SVG_NAMESPACE");
  assert.doesNotMatch(source, /(?:https?|wss?):\/\/(?!\$\{)/, `${file} contains remote code or an endpoint`);
}

console.log("release checks passed");
