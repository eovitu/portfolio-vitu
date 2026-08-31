import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeHistoryState } from './historyState.ts';

test('keeps a valid route and finite scroll state', () => {
  assert.deepEqual(normalizeHistoryState({ path: '/work/helppet', scrollY: 420 }), {
    path: '/work/helppet',
    scrollY: 420,
  });
});

test('drops invalid positions and rejects unknown paths', () => {
  assert.deepEqual(normalizeHistoryState({ path: '/work/helppet', scrollY: Infinity }), {
    path: '/work/helppet',
  });
  assert.equal(normalizeHistoryState({ path: '/missing', scrollY: 20 }), null);
});
