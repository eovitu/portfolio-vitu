import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./CaseStudy.tsx', import.meta.url), 'utf8');

test('case component exposes one heading, factual sections and adjacent navigation', () => {
  assert.match(source, /project\.sections\.map/);
  assert.match(source, /Case study navigation/);
  assert.match(source, /<S\.Title>/);
  assert.match(source, /project\.outcome/);
});
