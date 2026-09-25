import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./useSingularityIntro.ts', import.meta.url), 'utf8');

test('optional home-only intro targets are resolved and guarded before GSAP receives them', () => {
  assert.match(source, /const meta = gsap\.utils\.toArray<HTMLElement>\('\[data-meta\]'\)/);
  assert.match(
    source,
    /const stagedLines = gsap\.utils\.toArray<HTMLElement>\('\[data-line\]'\)/,
  );
  assert.match(source, /if \(lines\.length\) gsap\.set\(lines/);
  assert.match(source, /if \(meta\.length\)/);
  assert.match(source, /if \(stagedLines\.length\)/);
  assert.doesNotMatch(source, /\.to\(\s*'\[data-meta\]'/);
  assert.doesNotMatch(source, /\.to\(\s*'\[data-line\]'/);
});
