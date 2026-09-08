import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

/**
 * These files document the ownership boundary in prose as well as enforcing it
 * in code, and a comment naming the channel it must not touch is exactly the
 * comment worth keeping. Assertions about who animates what therefore run
 * against code with the comments removed.
 */
const code = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const director = read('./MotionDirector.tsx');
const entry = read('./EntrySequence.tsx');
const tokens = read('../../motion/tokens.ts');
const gravity = read('../../hooks/useGravityLetters.ts');
const heroExit = read('../../hooks/useHeroExit.ts');
const homeMotion = read('../../hooks/useHomeMotion.ts');

test('bounds the entry with the 2200 ms absolute fail-safe', () => {
  assert.match(tokens, /entryFailsafeMs:\s*2200/);
  assert.match(entry, /entryFailsafeMs/);
  // The ceiling must be its own timer, not a branch of the readiness race:
  // its job is to survive the failure of everything else.
  assert.match(entry, /setTimeout\(release,\s*MOTION_DURATION\.entryFailsafeMs\)/);
});

test('releases through exactly one path, on success, failure, timeout and unmount', () => {
  assert.match(entry, /const finish = \(notify/);
  assert.match(entry, /if \(settled\) return;/);
  assert.match(entry, /const release = \(\) => finish\(true\);/);
  // The unmount path tears down without re-notifying the director.
  assert.match(entry, /return \(\) => finish\(false\);/);
  // A thrown timeline still releases the reader.
  assert.match(entry, /catch \{[\s\S]*release\(\);/);
});

test('reverts every scoped context instead of killing tweens by hand', () => {
  assert.match(entry, /ctx\?\.revert\(\)/);
  assert.match(heroExit, /ctx\.revert\(\)/);
  assert.match(homeMotion, /ctx\.revert\(\)/);
});

test('carries a reduced-motion branch that completes rather than shortens', () => {
  assert.match(director, /prefersReducedMotion/);
  assert.match(entry, /if \(mode === 'static'\)/);
  // Static mode renders no overlay at all, so there is nothing to fade.
  assert.match(entry, /if \(mode === 'static'\) return null;/);
});

test('keeps the outer and inner hero transform channels on separate owners', () => {
  // Outer words: entrance and exit. Inner glyphs: gravity. One node, one owner.
  assert.match(code(heroExit), /data-hero-word/);
  assert.match(code(homeMotion), /data-hero-word/);
  assert.doesNotMatch(code(heroExit), /data-hero-glyph/);
  assert.doesNotMatch(code(homeMotion), /data-hero-glyph/);

  assert.match(code(gravity), /data-hero-glyph/);
  assert.doesNotMatch(code(gravity), /data-hero-word/);
});

test('advances from the shared ticker and never starts a frame loop', () => {
  for (const source of [director, entry, heroExit, homeMotion, gravity]) {
    assert.doesNotMatch(code(source), /requestAnimationFrame/);
  }
  assert.match(director, /useAnimationFrame/);
  assert.match(gravity, /useAnimationFrame/);
});

test('writes continuous values into the mutable store, never React state', () => {
  assert.match(director, /sceneSignals\.velocity = velocity/);
  assert.doesNotMatch(director, /setState.*velocity/);
});

test('keeps singularity lifecycle callbacks stable across intro state renders', () => {
  assert.match(director, /const onIntroLock = useCallback/);
  assert.match(director, /const onIntroRelease = useCallback/);
  assert.match(director, /onLock: onIntroLock/);
  assert.match(director, /onRelease: onIntroRelease/);
});
