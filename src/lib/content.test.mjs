import assert from 'node:assert/strict';
import test from 'node:test';
import { projects } from './content.ts';

test('publishes exactly three complete, uniquely addressed cases', () => {
  assert.deepEqual(
    projects.map((project) => project.slug),
    ['emprega-co', 'doces-da-pati', 'helppet'],
  );
  for (const project of projects) {
    assert.ok(project.summary.length > 30);
    assert.ok(project.ownership.length >= 2);
    assert.ok(project.media.poster.startsWith('/'));
    assert.ok(project.sections.length >= 3);
  }
});

test('does not expose placeholder links', () => {
  for (const project of projects) {
    for (const action of project.actions) {
      assert.notEqual(action.href, '#');
      assert.notEqual(action.href, '#contact');
    }
  }
});
