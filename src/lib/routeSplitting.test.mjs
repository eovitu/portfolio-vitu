import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

test('loads each route surface behind the route suspense boundary', () => {
  assert.match(app, /const HomePage = lazy\(/);
  assert.match(app, /const CaseStudy = lazy\(/);
  assert.match(app, /const NotFound = lazy\(/);
  assert.match(app, /<Suspense fallback=/);
  assert.doesNotMatch(app, /import \{ CaseStudy \} from/);
  assert.doesNotMatch(app, /import \{ HomePage \} from/);
});
