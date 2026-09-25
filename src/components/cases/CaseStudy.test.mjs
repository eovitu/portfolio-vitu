import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./CaseStudy.tsx', import.meta.url), 'utf8');

test('case component exposes one heading, factual sections and adjacent navigation', () => {
  assert.match(source, /project\.sections\.map/);
  assert.match(source, /copy\.navigation/);
  assert.match(source, /<S\.Title[^>]*>/);
  assert.match(source, /project\.outcome/);
});

test('case navigation exposes route focus and project transition context', () => {
  assert.match(source, /data-route-heading/);
  assert.match(source, /href="\/"/);
  assert.match(source, /data-transition-project/);
  assert.match(source, /data-transition-cause/);
});

test('Doces da Pati has a dedicated production story', () => {
  assert.match(source, /lazy\(\(\) => import\('\.\/CommerceStory'\)\)/);
  assert.match(source, /project\.slug === 'doces-da-pati' \? <CommerceStory \/> : null/);
});
