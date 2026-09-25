import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('./RouteTransitionProvider.tsx', import.meta.url),
  'utf8',
);
const scrollSource = readFileSync(
  new URL('../providers/SmoothScrollProvider.tsx', import.meta.url),
  'utf8',
);
const mainSource = readFileSync(new URL('../../main.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');

test('owns popstate, history updates, abort cleanup and focus restoration', () => {
  assert.match(source, /popstate/);
  assert.match(source, /history\.pushState/);
  assert.match(source, /AbortController/);
  assert.match(source, /controllerRef\.current\?\.abort/);
  assert.match(source, /activePromiseRef\.current = lifecycle/);
  assert.match(source, /focusRouteTarget/);
  assert.match(source, /restoreInitialHash/);
  assert.match(source, /finally/);
});

test('restores Lenis through an idempotent lock and supports immediate scrolling', () => {
  assert.match(scrollSource, /lockCount/);
  assert.match(scrollSource, /scrollToImmediate/);
  assert.match(scrollSource, /lenis\.resize\(\)/);
  assert.match(scrollSource, /immediate: true, force: true/);
});

test('leaves native reload and deep-link scroll ownership intact', () => {
  assert.doesNotMatch(mainSource, /scrollRestoration\s*=\s*['"]manual['"]/);
  assert.doesNotMatch(mainSource, /window\.scrollTo\(0, 0\)/);
});

test('the swap waits for the destination DOM instead of the outgoing exit', () => {
  // Exiting is not mounting: wait for the incoming scene ref.
  assert.doesNotMatch(appSource, /AnimatePresence/);
  assert.match(appSource, /ref=\{onSceneMount\}/);
  assert.match(appSource, /if \(node\) notifyRouteMounted\(\)/);
  assert.match(source, /notifyRouteMounted/);
  assert.match(source, /await mounted;/);
  // The destination DOM is never assumed to exist a fixed number of frames
  // after setRoute, that is the defect this replaced.
  assert.doesNotMatch(source, /await nextFrame\(\);\s*await nextFrame\(\);/);
  // A presence layer that never reports must not strand the reader behind the
  // overlay, so the wait keeps a fail-safe.
  assert.match(source, /timeoutMs = 1400/);
});

test('reduced motion removes the movement, not the machine', () => {
  // One preference source, shared with the rest of the site.
  assert.match(source, /prefersReducedMotion/);

  // Nothing travels: no press, no shared media flight, no swept curtain.
  assert.match(source, /const beat = \(seconds: number\) => \(reduced \? 0 : seconds\)/);
  assert.doesNotMatch(source, /sharedMediaRef/);
  // The press is not animated here at all any more, `useMagneticElements`
  // owns `scale` on every anchor and button, and it writes with
  // `overwrite: true`. A second author was silently killing this tween.
  assert.doesNotMatch(source, /scale: 0\.97/);
  assert.match(source, /onInterrupt: done/);
  assert.match(source, /duration: beat\(0\.18\)/);
  assert.match(source, /duration: beat\(0\.24\)/);
  // The phases themselves are untouched, so focus and history still run.
  assert.match(source, /machine\.advance\('occluding'\)/);
  assert.match(source, /machine\.advance\('revealing'\)/);
});

test('persists scroll history once scrolling settles instead of rewriting history each frame', () => {
  assert.match(source, /addEventListener\('scrollend', saveScrollPosition/);
  assert.match(source, /removeEventListener\('scrollend', saveScrollPosition/);
  assert.doesNotMatch(source, /addEventListener\('scroll', saveScrollPosition/);
  assert.doesNotMatch(
    source,
    /requestAnimationFrame\(\(\) => \{\s*pendingFrame = 0;\s*const state/s,
  );
});
