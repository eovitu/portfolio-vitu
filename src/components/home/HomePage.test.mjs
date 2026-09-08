import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const home = read('./HomePage.tsx');

test('the hero CTAs are outside the first-visit gather-and-release wrapper', () => {
  // `[data-warp]` is what the first-visit EntrySequence collapses to
  // `scale: 0` and holds there through the gather phase before releasing it,
  // roughly 1 to 1.5 seconds. A first-time reader clicking a CTA the moment
  // it looks ready (its own `opacity` reads 1 regardless of an ancestor's
  // transform) would land on a zero-size hit area and miss it entirely.
  //
  // The title alone owns the entrance; `S.HeroGrid` and `S.HeroAside` (the
  // copy and the "View selected work" / "Start a conversation" CTAs) must
  // never be wrapped by it again.
  assert.doesNotMatch(home, /<S\.HeroGrid data-warp>/);
  assert.match(home, /<div data-warp>/);
  assert.match(home, /<S\.HeroAside data-hero-fade>/);
  assert.doesNotMatch(home, /<S\.HeroAside[^>]*data-warp/);
});
