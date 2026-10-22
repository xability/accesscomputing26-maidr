import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const html = readFileSync(new URL('../_extensions/jy-a11y/jy-a11y.html', import.meta.url), 'utf8');
const source = html.match(/<script[^>]*>([\s\S]*)<\/script>/)[1];
function run(keyboard, ready = true, existing = '') {
  const config = { keyboard, overview: false, navigationMode: 'linear' };
  let readyCallback;
  const attributes = new Map(existing ? [['data-at-shortcutkeys', existing]] : []);
  const element = {getAttribute: key => attributes.get(key) || null, setAttribute: (key, value) => attributes.set(key, value)};
  const reveal = {
    getConfig: () => config,
    configure: options => Object.assign(config, options),
    isReady: () => ready,
    on: (event, fn) => { assert.equal(event, 'ready'); readyCallback = fn; },
    getRevealElement: () => element
  };
  vm.runInNewContext(source, {window: {Reveal: reveal}, document: {body: element}});
  if (!ready) { assert.equal(config.keyboard, keyboard); readyCallback(); }
  return {config, attributes};
}
assert.equal(run(true).config.keyboard[72], null);
assert.equal(run(undefined).config.keyboard[72], null);
assert.equal(run(false).config.keyboard, false);
assert.equal(run(false).attributes.size, 0);
const custom = {13: 'next', 72: 'prev', 74: 'down', 80: null};
const changed = run(custom).config.keyboard;
assert.equal(changed[13], 'next');
assert.equal(changed[72], null);
assert.equal(changed[74], 'down');
assert.equal(changed[80], null);
assert.equal(custom[72], 'prev');
assert.equal(run(true, false).config.keyboard[72], null);
assert.equal(run(true).config.overview, false);
assert.ok(!source.includes('preventDefault'));
assert.ok(!source.includes('stopPropagation'));
assert.ok(!source.includes('keydown'));
const declaration = readFileSync(new URL('../_extensions/jy-a11y/reserved-keys.html', import.meta.url), 'utf8');
const reservedSource = declaration.match(/<script[^>]*>([\s\S]*)<\/script>/)[1];
function runReserved(initial = null) {
  const attrs = new Map(initial === null ? [] : [['data-at-shortcutkeys', initial]]);
  const body = {getAttribute: name => attrs.get(name) || null, setAttribute: (name, value) => attrs.set(name, value)};
  // No generic marker node exists: only document.body can receive attributes.
  const context = {document: {body}};
  vm.runInNewContext(reservedSource, context);
  const once = attrs.get('data-at-shortcutkeys');
  vm.runInNewContext(reservedSource, context);
  assert.equal(attrs.get('data-at-shortcutkeys'), once, 'idempotent BODY declaration');
  return once;
}
const reserved = JSON.parse(runReserved());
const merged = JSON.parse(runReserved('{"x":"Existing shortcut"}'));
assert.equal(merged.x, 'Existing shortcut');
assert.equal(merged.j, reserved.j);
assert.equal(runReserved('not-json'), 'not-json');
assert.equal(runReserved('[]'), '[]');
assert.ok(!declaration.includes('<div'));
assert.deepEqual(Object.keys(reserved).sort(), ['j', 'k', 'n', 'p']);
assert.ok(Object.values(reserved).every(value => typeof value === 'string' && value.length));
assert.ok(!declaration.includes('tabindex'));
assert.ok(!declaration.includes('role="application"'));
console.log('PASS: H disabled; custom map and keyboard:false preserved; ready lifecycle; no key interception; BODY receives j/k/n/p JSON; existing declarations preserved; idempotent');
