import assert from 'node:assert/strict';
import test from 'node:test';
import {
  resetTransientSceneSignals,
  sceneSignals,
  setSceneTarget,
} from './sceneSignals.ts';

test('updates signals in place and resets transition-only fields', () => {
  const identity = sceneSignals;
  setSceneTarget({ energy: 0.8, transitionProgress: 0.5, projectTheme: 'helppet' });
  assert.equal(sceneSignals, identity);
  resetTransientSceneSignals();
  assert.equal(sceneSignals.transitionProgress, 0);
  assert.equal(sceneSignals.energy, 0);
  assert.equal(sceneSignals.projectTheme, 'helppet');
});
