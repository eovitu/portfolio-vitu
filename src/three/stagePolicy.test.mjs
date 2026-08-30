import assert from 'node:assert/strict';
import test from 'node:test';
import { frameInterval, gravityEnabled, stageMode } from './stagePolicy.ts';

test('classifies visible, background and absent scene states', () => {
  assert.equal(stageMode(1), 'active');
  assert.equal(stageMode(0.16), 'ambient');
  assert.equal(stageMode(0), 'dormant');
});

test('only exposes gravity while the singularity is visually present', () => {
  assert.equal(gravityEnabled(0, true), false);
  assert.equal(gravityEnabled(0.16, true), false);
  assert.equal(gravityEnabled(1, true), true);
  assert.equal(gravityEnabled(1, false), false);
});

test('assigns bounded render intervals to each scene state', () => {
  assert.equal(frameInterval('active', false), 0);
  assert.equal(frameInterval('ambient', false), 83);
  assert.equal(frameInterval('dormant', false), 250);
  assert.equal(frameInterval('active', true), 250);
});
