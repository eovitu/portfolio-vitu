import assert from 'node:assert/strict';
import test from 'node:test';
import { readVisitSeen, visitMode } from './visitState.ts';

test('uses full entry once, short repeat entry later, and static reduced motion', () => {
  assert.equal(visitMode({ seen: false, reduced: false }), 'first');
  assert.equal(visitMode({ seen: true, reduced: false }), 'repeat');
  assert.equal(visitMode({ seen: false, reduced: true }), 'static');
});

test('reduced motion wins over a remembered visit', () => {
  assert.equal(visitMode({ seen: true, reduced: true }), 'static');
});

test('degrades to a first visit when storage is unavailable', () => {
  // Private mode and blocked storage both throw on access rather than
  // returning null, so the read must never reach the caller as an exception.
  assert.equal(
    readVisitSeen({
      getItem() {
        throw new Error('SecurityError');
      },
    }),
    false,
  );
  assert.equal(visitMode({ seen: readVisitSeen(null), reduced: false }), 'first');
});

test('reads a remembered visit from a working storage', () => {
  assert.equal(readVisitSeen({ getItem: () => 'true' }), true);
  assert.equal(readVisitSeen({ getItem: () => null }), false);
});
