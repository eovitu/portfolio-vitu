import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./useHomeMotion.ts', import.meta.url), 'utf8');

test('releases the hero entrance transform before handing ownership to scroll', () => {
  assert.match(
    source,
    /ctx\?\.revert\(\);[\s\S]*?clearProps:\s*['"]transform,opacity,willChange['"][\s\S]*?setEntranceDone\(true\)/,
  );
});
