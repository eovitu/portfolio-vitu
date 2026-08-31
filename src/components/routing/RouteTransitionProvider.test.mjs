import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./RouteTransitionProvider.tsx', import.meta.url), 'utf8');
const scrollSource = readFileSync(
  new URL('../providers/SmoothScrollProvider.tsx', import.meta.url),
  'utf8',
);

test('owns popstate, history updates, abort cleanup and focus restoration', () => {
  assert.match(source, /popstate/);
  assert.match(source, /history\.pushState/);
  assert.match(source, /AbortController/);
  assert.match(source, /controllerRef\.current\?\.abort/);
  assert.match(source, /focusRouteTarget/);
  assert.match(source, /finally/);
});

test('restores Lenis through an idempotent lock and supports immediate scrolling', () => {
  assert.match(scrollSource, /lockCount/);
  assert.match(scrollSource, /scrollToImmediate/);
  assert.match(scrollSource, /immediate: true, force: true/);
});
