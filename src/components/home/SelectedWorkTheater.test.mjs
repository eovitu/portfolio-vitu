import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  chapterIndexForProgress,
  chapterScrollTarget,
} from '../../motion/theaterChapters.ts';

const read = (name) => readFileSync(new URL(name, import.meta.url), 'utf8');
const theater = read('./SelectedWorkTheater.tsx');
const motion = read('../../hooks/useProjectTheaterMotion.ts');
const media = read('./ProjectMediaSurface.tsx');

test('keeps the three projects semantic and ordered inside one theater', () => {
  assert.match(theater, /<S\.Theater/);
  assert.match(theater, /<h2/);
  assert.match(theater, /projects\.map/);
  assert.match(theater, /data-project/);
  assert.match(media, /data-project-media/);
  assert.match(theater, /data-project-link/);
  assert.match(theater, /data-transition-project/);
  assert.match(theater, /TheaterStage/);
  assert.doesNotMatch(theater, /ProjectList/);
});

test('uses one sticky progression and the shared frame loop', () => {
  assert.match(motion, /ScrollTrigger/);
  assert.match(motion, /useAnimationFrame/);
  assert.match(motion, /sceneSignals\.velocity/);
  assert.match(motion, /ctx\.revert\(\)/);
  assert.doesNotMatch(motion, /requestAnimationFrame/);
  assert.doesNotMatch(motion, /wheel|preventDefault/);
});

test('keeps poster-first, one-video playback policy', () => {
  assert.match(media, /muted/);
  assert.match(media, /playsInline/);
  assert.match(media, /loop/);
  assert.match(media, /onPlaying/);
  assert.match(media, /\.play\(\)/);
  assert.match(media, /\.pause\(\)/);
  assert.doesNotMatch(media, /controls/);
  assert.doesNotMatch(media, /currentTime/);
});

test('numbered navigation targets the middle of each chapter band', () => {
  const base = { runTop: 1000, runHeight: 3000, viewportHeight: 1000, count: 3 };
  // Scrollable range is 3000 - 1000 = 2000, split into three 666.6 bands.
  assert.equal(chapterScrollTarget({ ...base, index: 0 }), 1000 + 2000 * (0.5 / 3));
  assert.equal(chapterScrollTarget({ ...base, index: 1 }), 1000 + 2000 * (1.5 / 3));
  assert.equal(chapterScrollTarget({ ...base, index: 2 }), 1000 + 2000 * (2.5 / 3));
});

test('every chapter band maps back to its own index', () => {
  const base = { runTop: 420, runHeight: 2400, viewportHeight: 800, count: 3 };
  const range = base.runHeight - base.viewportHeight;
  for (let index = 0; index < base.count; index += 1) {
    const y = chapterScrollTarget({ ...base, index });
    const progress = (y - base.runTop) / range;
    assert.equal(chapterIndexForProgress(progress, base.count), index);
  }
});

test('degenerate geometry cannot produce a scroll away from the run', () => {
  // A run shorter than the viewport has no scrollable range at all.
  assert.equal(
    chapterScrollTarget({
      runTop: 300,
      runHeight: 500,
      viewportHeight: 900,
      index: 2,
      count: 3,
    }),
    300,
  );
  assert.equal(
    chapterScrollTarget({
      runTop: 300,
      runHeight: 3000,
      viewportHeight: 900,
      index: 0,
      count: 0,
    }),
    300,
  );
});

test('the active index keeps a single author', () => {
  // The trigger writes `active`; the click only moves the scroll.
  assert.match(motion, /setActive\(index\)/);
  assert.match(theater, /openChapter/);
  assert.doesNotMatch(theater, /setActive\(/);
});

test('a preview off screen stops decoding', () => {
  assert.match(media, /IntersectionObserver/);
  assert.match(media, /observer\.disconnect\(\)/);
  // Visibility only ever subtracts from the chapter's playback decision, it
  // can never start a video the theater was not already starting.
  assert.match(media, /const shouldPlay = active && !reduced && onScreen;/);
  assert.match(media, /if \(!shouldPlay\) \{\s*video\.pause\(\);/);
  // Poster-first is unchanged: the poster clears on `playing`, nothing else.
  assert.match(media, /data-playing=\{playing\}/);
  assert.match(media, /onPlaying=\{\(\) => setPlaying\(true\)\}/);
});
