import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('does not turn scroll progress into input latency', () => {
  const provider = readFileSync(
    new URL('../components/providers/SmoothScrollProvider.tsx', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(
    provider,
    /lenis\.options\.(duration|wheelMultiplier|touchMultiplier)\s*=/,
  );
});
