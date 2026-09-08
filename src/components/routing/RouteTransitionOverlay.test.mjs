import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const overlay = read('./RouteTransitionOverlay.styles.ts');
const provider = read('./RouteTransitionProvider.tsx');
const refresh = read('../../hooks/useRouteScrollRefresh.ts');

test('the route curtain is opaque black and blocks interaction while visible', () => {
  assert.match(overlay, /background: #000;/);
  assert.match(overlay, /inset: 0;/);
  assert.match(overlay, /pointer-events: auto;/);
  assert.doesNotMatch(overlay, /radial-gradient|scaleY|clip-path/);
});

test('the outgoing page is covered before the destination is mounted', () => {
  const covered = provider.indexOf('opacity: 1, duration: beat(0.18)');
  const swapping = provider.indexOf("machine.advance('swapping')");
  const mounted = provider.indexOf('await mounted;');
  const revealed = provider.indexOf('opacity: 0, duration: beat(0.24)');
  assert.ok(covered > 0 && covered < swapping && swapping < mounted && mounted < revealed);
});

test('route layout refresh does not transform the destination content', () => {
  assert.match(refresh, /phase === 'revealing'/);
  assert.match(refresh, /scheduleScrollRefresh/);
  assert.doesNotMatch(refresh, /gsap|offsetToCore|transform/);
});
