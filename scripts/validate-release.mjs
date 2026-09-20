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
}

for (const file of [
  "manifests/chrome.json", "manifests/firefox.json",
  "src/options.html", "src/popup.html", "src/styles.css",
  "src/api.js", "src/background.js", "src/i18n.js", "src/layout.js",
  "src/options.js", "src/picker.js", "src/popup.js"
]) {
  assert.doesNotMatch(await readFile(file, "utf8"), /(?:https?|wss?):\/\/(?!\$\{)/, `${file} contains remote code or an endpoint`);
}

console.log("release checks passed");
