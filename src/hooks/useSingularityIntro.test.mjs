import assert from 'node:assert/strict';
import test from 'node:test';
import { reloadPlan } from '../motion/sectionChoreography.ts';

test('reload without a snapshot has no hero dependency and releases immediately', () => {
  assert.equal(reloadPlan(null, false, 0).animate, false);
});
test('case reload preserves its position without any home-only elements', () => {
  const plan = reloadPlan({ section: 'case-helppet:case-body', scrollY: 2170 }, false, 0.2);
  assert.equal(plan.animate, true);
  assert.equal(plan.scrollY, 2170);
});
