import assert from 'node:assert/strict';
import test from 'node:test';
import { selectSharedMediaSource } from './sharedMedia.ts';

test('prefers a loaded poster and never selects a live video clone', () => {
  assert.deepEqual(
    selectSharedMediaSource({
      posterLoaded: true,
      poster: '/media/helppet.webp',
      frameReady: true,
    }),
    { kind: 'poster', src: '/media/helppet.webp' },
  );
});

test('falls back to a static frame surface or no shared element', () => {
  assert.deepEqual(selectSharedMediaSource({ posterLoaded: false, frameReady: true }), {
    kind: 'frame-surface',
  });
  assert.equal(selectSharedMediaSource({ posterLoaded: false, frameReady: false }), null);
});
