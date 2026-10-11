import test from 'node:test';
import assert from 'node:assert/strict';
import { selectVisibleSection, reloadPlan, fragmentPose } from './sectionChoreography.ts';
test('visible chapter wins over its enclosing work section, hidden chapters never win', () => {
  assert.equal(
    selectVisibleSection(
      [
        { id: 'top', top: -900, bottom: 0, visible: true },
        { id: 'work', top: -300, bottom: 4000, visible: true },
        { id: 'work-emprega-co', top: 80, bottom: 800, visible: false },
        { id: 'work-helppet', top: 80, bottom: 800, visible: true },
      ],
      900,
    ),
    'work-helppet',
  );
});
test('selection follows viewport intersection instead of document order', () => {
  assert.equal(
    selectVisibleSection(
      [
        { id: 'top', top: -800, bottom: 80, visible: true },
        { id: 'profile', top: 80, bottom: 900, visible: true },
      ],
      900,
    ),
    'profile',
  );
});
test('each section produces a different actual trajectory', () => {
  const ids = [
    'top',
    'work-emprega-co',
    'work-torneio-pebolim',
    'work-helppet',
    'work-doces-da-pati',
    'profile',
    'about',
    'contact',
    'case-body',
  ];
  const trajectories = ids.map((id) =>
    JSON.stringify(
      [0, 1, 2].map((i) => fragmentPose(id, i, { x: 80, y: 120 }, { w: 1200, h: 900 })),
    ),
  );
  assert.equal(new Set(trajectories).size, ids.length);
});
test('reload keeps saved position and respects remaining 3.2 second ceiling', () => {
  const p = reloadPlan({ section: 'profile', scrollY: 4782 }, false, 0.7);
  assert.equal(p.scrollY, 4782);
  assert.ok(p.duration + 0.7 <= 3.2);
  assert.equal(p.animate, true);
  assert.equal(reloadPlan({ section: 'top', scrollY: 0 }, false, 3.3).animate, false);
});
test('reduced, missing, invalid snapshot release immediately without changing scroll', () => {
  for (const shot of [
    null,
    { section: 'about', scrollY: NaN },
    { section: 'about', scrollY: -2 },
  ])
    assert.equal(reloadPlan(shot, false, 0).animate, false);
  assert.equal(reloadPlan({ section: 'about', scrollY: 42 }, true, 0).animate, false);
  assert.deepEqual(fragmentPose('unknown', 0, { x: 80, y: 120 }, { w: 1200, h: 900 }), {
    x: 0,
    y: 16,
    scale: 1,
    rotate: 0,
  });
});

test('case snapshots retain their project trajectory', () => {
  const center = { x: 80, y: 120 },
    viewport = { w: 1200, h: 900 };
  assert.deepEqual(
    fragmentPose('case-helppet:case-body', 2, center, viewport),
    fragmentPose('work-helppet', 2, center, viewport),
  );
  assert.notDeepEqual(
    fragmentPose('case-helppet:case-body', 2, center, viewport),
    fragmentPose('case-emprega-co:case-body', 2, center, viewport),
  );
});
