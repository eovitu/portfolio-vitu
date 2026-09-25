import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./NotFound.styles.ts', import.meta.url), 'utf8');

test('the primary 404 action preserves contrasting text on hover and keyboard focus', () => {
  const interactionRule =
    source.match(/&:hover,[\s\S]*?&:focus-visible\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? '';

  assert.match(interactionRule, /border-color:/);
  assert.match(interactionRule, /color:.*\$primary/s);
});
