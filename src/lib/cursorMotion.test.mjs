import assert from 'node:assert/strict';
import test from 'node:test';
import { seedCursor } from './cursorMotion.ts';

test('seeds the cursor at the first real pointer coordinate', () => {
  const state = seedCursor(320, 240);

  assert.deepEqual(state.position, { x: 320, y: 240 });
  assert.deepEqual(state.target, { x: 320, y: 240 });
  assert.notEqual(state.position, state.target);
});
