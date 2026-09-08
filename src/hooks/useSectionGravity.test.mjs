import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const gravity = read('./useSectionGravity.ts');
const homeMotion = read('./useHomeMotion.ts');
const homePage = read('../components/home/HomePage.tsx');
const caseStudy = read('../components/cases/CaseStudy.tsx');
const measure = read('../motion/scrollMeasure.ts');

test('both routes enter and leave through the same gravitational system', () => {
  assert.match(homeMotion, /useSectionGravity\(\)/);
  assert.match(caseStudy, /useSectionGravity\(\)/);
  // No second implementation: the vectors are computed in exactly one place.
  for (const source of [homePage, caseStudy, homeMotion]) {
    assert.doesNotMatch(source, /offsetToCore/);
  }
});

test('case studies expose top-level compositions as gravity targets', () => {
  const targets = caseStudy.match(/data-gravity-section/g) ?? [];
  assert.equal(targets.length, 3);
  // The media travels through the shared-media handoff and `layoutId`. Giving
  // it a gravity vector as well would put two authors on one transform.
  assert.doesNotMatch(caseStudy, /data-case-media\s+data-gravity-section/);
});

test('the post-swap re-measure is coalesced and never a loop', () => {
  assert.match(gravity, /scheduleScrollRefresh\(\)/);
  // Requested from the entrance only, and only once the transforms are gone.
  assert.match(measure, /if \(pending\) return;/);
  assert.match(measure, /ScrollTrigger\.refresh\(\)/);
  assert.doesNotMatch(gravity, /ScrollTrigger\.refresh/);
  // No polling: one frame, one refresh.
  assert.equal((measure.match(/requestAnimationFrame/g) ?? []).length, 1);
});

test('a reduced-motion or empty swap still re-measures the document', () => {
  assert.match(
    gravity,
    /if \(prefersReducedMotion\(\) \|\| !sections\.length\) \{\s*if \(phase === 'revealing'\) scheduleScrollRefresh\(\);/,
  );
});
