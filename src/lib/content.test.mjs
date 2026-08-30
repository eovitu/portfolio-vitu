import assert from 'node:assert/strict';
import test from 'node:test';
import { contact, hero, projects } from './content.ts';

test('publishes three complete, uniquely-addressable portfolio cases', () => {
  assert.equal(projects.length, 3);
  assert.equal(new Set(projects.map(({ slug }) => slug)).size, projects.length);

  for (const project of projects) {
    assert.ok(project.name.length > 0);
    assert.ok(project.desc.length > 40);
    assert.ok(project.highlights.length >= 2);
    assert.ok(!/project two|project three|\[.+\]/i.test(project.desc));
  }
});

test('keeps the launch position and contact path explicit', () => {
  assert.equal(hero.role, 'BACKEND DEVELOPER');
  const email = contact.links.find(({ label }) => label === 'EMAIL');
  assert.ok(email?.href.startsWith('mailto:eovitu7@gmail.com?subject='));
});
