import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { SITE_ORIGIN } from './site.ts';

test('index.html canonical and og:url match the single production origin', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const ogUrl = html.match(/property="og:url" content="([^"]+)"/)?.[1];

  assert.equal(canonical, `${SITE_ORIGIN}/`);
  assert.equal(ogUrl, `${SITE_ORIGIN}/`);
});
