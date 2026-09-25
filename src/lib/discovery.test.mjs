import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readPublicFile = (name) =>
  readFileSync(new URL(`../../public/${name}`, import.meta.url), 'utf8');

test('publishes canonical routes in a lean sitemap', () => {
  const sitemap = readPublicFile('sitemap.xml');
  const canonicalRoutes = [
    'https://eovitu.com.br/',
    'https://eovitu.com.br/work/emprega-co',
    'https://eovitu.com.br/work/doces-da-pati',
    'https://eovitu.com.br/work/helppet',
  ];

  for (const route of canonicalRoutes) {
    assert.match(sitemap, new RegExp(`<loc>${route}</loc>`));
  }

  assert.equal((sitemap.match(/<loc>/g) ?? []).length, canonicalRoutes.length);
  assert.equal((sitemap.match(/<lastmod>/g) ?? []).length, canonicalRoutes.length);
  assert.equal((sitemap.match(/<lastmod>2026-09-24<\/lastmod>/g) ?? []).length, 4);
  assert.doesNotMatch(sitemap, /404|not-found|nao-existe/);
  assert.doesNotMatch(sitemap, /<(?:priority|changefreq)>/);
});

test('connects robots and llms discovery files to the canonical site', () => {
  const robots = readPublicFile('robots.txt');
  const llms = readPublicFile('llms.txt');

  assert.match(robots, /Sitemap: https:\/\/eovitu\.com\.br\/sitemap\.xml/);
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.doesNotMatch(robots, /Disallow:/);
  assert.match(llms, /https:\/\/eovitu\.com\.br\/sitemap\.xml/);
  assert.match(llms, /https:\/\/eovitu\.com\.br\/robots\.txt/);
});
