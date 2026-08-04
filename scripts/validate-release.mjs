import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const chrome = JSON.parse(await readFile("manifest.json", "utf8"));
const firefox = JSON.parse(await readFile("manifest.firefox.json", "utf8"));

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
  "manifest.json", "manifest.firefox.json", "options.html", "popup.html", "styles.css",
  "api.js", "background.js", "i18n.js", "layout.js", "options.js", "picker.js", "popup.js"
]) {
  assert.doesNotMatch(await readFile(file, "utf8"), /(?:https?|wss?):\/\/(?!\$\{)/, `${file} contains remote code or an endpoint`);
}

console.log("release checks passed");
