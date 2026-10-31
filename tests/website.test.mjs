import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const themeScript = await readFile('website/theme.js', 'utf8');
function page(saved, { denyRead = false, denyWrite = false } = {}) {
  const listeners = {};
  const toggle = {
    hidden: true,
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(type, handler) { listeners[type] = handler; }
  };
  const root = { dataset: {} };
  const meta = {};
  const writes = [];
  const context = {
    document: {
      documentElement: root,
      querySelector: (selector) => selector === '.theme-toggle' ? toggle : meta,
      addEventListener(type, handler) { listeners[type] = handler; }
    },
    localStorage: {
      getItem(key) {
        assert.equal(key, 'push-my-tabs-theme');
        if (denyRead) throw new Error('Storage denied');
        return saved;
      },
      setItem(key, value) {
        if (denyWrite) throw new Error('Storage denied');
        writes.push([key, value]);
      }
    }
  };
  vm.runInNewContext(themeScript, context);
  const beforeDOM = root.dataset.theme;
  listeners.DOMContentLoaded();
  return { root, meta, toggle, writes, beforeDOM, click: () => listeners.click() };
}
for (const saved of [null, 'dark', 'invalid', 'system']) {
  const p = page(saved);
  assert.equal(p.beforeDOM, 'dark', 'dark on first visit or unrecognized preference');
  assert.equal(p.toggle.attributes['aria-pressed'], 'false');
  assert.equal(p.writes.length, 0, 'do not store a preference before the user chooses');
}
const light = page('light');
assert.equal(light.beforeDOM, 'light', 'restore before DOMContentLoaded to avoid a theme flash');
assert.equal(light.toggle.hidden, false);
assert.equal(light.meta.content, '#faf9fd');
assert.equal(light.toggle.attributes['aria-pressed'], 'true');
light.click();
assert.equal(light.root.dataset.theme, 'dark');
assert.equal(light.meta.content, '#08090d');
assert.equal(light.toggle.attributes['aria-pressed'], 'false');
assert.deepEqual(light.writes, [['push-my-tabs-theme', 'dark']]);
assert.equal(page(light.writes[0][1]).beforeDOM, 'dark', 'saved selection survives next page load');
light.click();
assert.equal(page(light.writes[1][1]).beforeDOM, 'light');
for (const options of [{ denyRead: true }, { denyWrite: true }, { denyRead: true, denyWrite: true }]) {
  const p = page(null, options);
  assert.equal(p.beforeDOM, 'dark');
  p.click();
  assert.equal(p.root.dataset.theme, 'light', 'blocked storage must not break live switching');
  assert.equal(p.toggle.attributes['aria-pressed'], 'true');
  p.click();
  assert.equal(p.root.dataset.theme, 'dark');
}
console.log('Website theme: dark default, early restore, persistence, accessible state and blocked storage passed');

const matrixScript = await readFile('website/matrix.js', 'utf8');
function motionPage(reduced = false) {
  const events = {};
  const field = { children: [], append(stream) { this.children.push(stream); } };
  const toggle = {
    hidden: true, attributes: {},
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(type, handler) { events[type] = handler; }
  };
  const preference = { matches: reduced, addEventListener(type, handler) { events.preference = handler; } };
  const document = {
    hidden: false, documentElement: { dataset: {} },
    querySelector: (selector) => selector === '#matrix-field' ? field : toggle,
    createElement: () => ({ dataset: {}, style: { setProperty() {} } }),
    addEventListener(type, handler) { events[type] = handler; }
  };
  vm.runInNewContext(matrixScript, { document, matchMedia: () => preference });
  return { document, toggle, field, preference, events };
}
const motion = motionPage();
assert.ok(motion.field.children.length > 0, 'decorative field initialized locally');
assert.equal(motion.document.documentElement.dataset.matrixPaused, 'false');
motion.events.click();
assert.equal(motion.document.documentElement.dataset.matrixPaused, 'true');
assert.equal(motion.toggle.attributes['aria-pressed'], 'true');
motion.document.hidden = true;
motion.events.visibilitychange();
motion.document.hidden = false;
motion.events.visibilitychange();
assert.equal(motion.document.documentElement.dataset.matrixPaused, 'true', 'returning to tab preserves manual pause');
motion.events.click();
assert.equal(motion.document.documentElement.dataset.matrixPaused, 'false');
motion.document.hidden = true;
motion.events.visibilitychange();
assert.equal(motion.document.documentElement.dataset.matrixPaused, 'true', 'hidden tab stops animation');
motion.document.hidden = false;
motion.events.visibilitychange();
assert.equal(motion.document.documentElement.dataset.matrixPaused, 'false');
motion.preference.matches = true;
motion.events.preference();
assert.equal(motion.document.documentElement.dataset.matrixPaused, 'true');
assert.equal(motion.toggle.hidden, true, 'static reduced-motion alternative needs no pause control');
motion.preference.matches = false;
motion.events.preference();
assert.equal(motion.toggle.hidden, false);
assert.equal(motion.document.documentElement.dataset.matrixPaused, 'false');
assert.equal(motionPage(true).document.documentElement.dataset.matrixPaused, 'true', 'honor reduced motion on first load');
console.log('Website Matrix: pause/resume, hidden tab, manual preference and live reduced-motion changes passed');
