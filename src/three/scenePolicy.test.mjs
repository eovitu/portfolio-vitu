import assert from 'node:assert/strict';
import test from 'node:test';
import { sceneMode, shouldRenderScene } from './scenePolicy.ts';

test('falls back before WebGL and uses economy mode on constrained devices', () => {
  assert.equal(
    sceneMode({ webgl: false, coarse: false, width: 1440, saveData: false }),
    'poster',
  );
  assert.equal(
    sceneMode({ webgl: true, coarse: true, width: 390, saveData: false }),
    'economy',
  );
  assert.equal(
    sceneMode({ webgl: true, coarse: false, width: 1440, saveData: false }),
    'full',
  );
});

test('does not continuously render while hidden or under reduced motion', () => {
  assert.equal(
    shouldRenderScene({ visible: true, documentVisible: false, reducedMotion: false }),
    false,
  );
  assert.equal(
    shouldRenderScene({ visible: true, documentVisible: true, reducedMotion: true }),
    false,
  );
  assert.equal(
    shouldRenderScene({ visible: true, documentVisible: true, reducedMotion: false }),
    true,
  );
});
