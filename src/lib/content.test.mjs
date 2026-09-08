import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
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

test('describes the final project films and their real poster fallbacks', () => {
  for (const project of projects) {
    assert.equal(project.media.width, 1280);
    assert.equal(project.media.height, 720);
    assert.equal(project.media.width / project.media.height, 16 / 9);
    assert.ok(
      existsSync(new URL(`../../public${project.media.poster}`, import.meta.url)),
      `missing poster for ${project.slug}`,
    );
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

test('publishes source access only for HelpPet', () => {
  const doces = projects.find((project) => project.slug === 'doces-da-pati');
  const helppet = projects.find((project) => project.slug === 'helppet');

  assert.equal(
    doces.actions.some((action) => action.label === 'View Source'),
    false,
  );
  assert.deepEqual(
    helppet.actions.find((action) => action.label === 'View Source'),
    {
      label: 'View Source',
      href: 'https://github.com/orgs/HelpPetSENAI/repositories',
    },
  );
});
