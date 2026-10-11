import assert from 'node:assert/strict';
import test from 'node:test';
import { claimArrivalTargets } from './sectionArrivalOwnership.ts';

test('new arrival restores previous owner before claiming shared targets; stale cleanup is inert', () => {
  const a = {},
    b = {},
    calls = [];
  const old = claimArrivalTargets([a, b], () => calls.push('old'));
  const current = claimArrivalTargets([b], () => calls.push('new'));
  assert.deepEqual(calls, ['old']);
  old();
  assert.deepEqual(calls, ['old']);
  current();
  current();
  assert.deepEqual(calls, ['old', 'new']);
});
test('disjoint arrivals are independent and released ownership can be claimed again', () => {
  const a = {},
    b = {},
    calls = [];
  const first = claimArrivalTargets([a], () => calls.push(1));
  const second = claimArrivalTargets([b], () => calls.push(2));
  assert.deepEqual(calls, []);
  first();
  const next = claimArrivalTargets([a], () => calls.push(3));
  assert.deepEqual(calls, [1]);
  second();
  next();
  assert.deepEqual(calls, [1, 2, 3]);
});
