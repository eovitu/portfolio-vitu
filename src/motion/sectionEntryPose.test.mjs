import assert from 'node:assert/strict';
import test from 'node:test';
import { sectionEntryPose } from './sectionEntryPose.ts';

test('entry preserves section directions with a lighter scroll pose', () => {
  const viewport = { w: 1200, h: 800 },
    center = { x: 100, y: 100 };
  const profile = sectionEntryPose('profile', 0, center, viewport);
  const pet = sectionEntryPose('work-helppet', 0, center, viewport);
  const contact = sectionEntryPose('contact', 0, center, viewport);
  assert.ok(profile.x < 0);
  assert.equal(profile.rotation, 0);
  assert.equal(pet.x, 0);
  assert.ok(pet.y > 0);
  assert.ok(contact.x > 0 && contact.y > 0);
  assert.ok(contact.scale > 0.7);
  const arrival = sectionEntryPose('profile', 0, center, viewport, true);
  assert.ok(Math.abs(arrival.x) > Math.abs(profile.x));
});

test('case entries reuse their project identity and all poses stay finite', () => {
  const center = { x: 300, y: 200 },
    viewport = { w: 390, h: 844 };
  assert.deepEqual(
    sectionEntryPose('case-helppet:body', 2, center, viewport),
    sectionEntryPose('work-helppet', 2, center, viewport),
  );
  for (const section of [
    'top',
    'profile',
    'about',
    'contact',
    'work-emprega-co',
    'work-torneio-pebolim',
    'work-helppet',
    'work-doces-da-pati',
    'unknown',
  ]) {
    assert.ok(
      Object.values(sectionEntryPose(section, 2, center, viewport)).every(Number.isFinite),
    );
  }
});
