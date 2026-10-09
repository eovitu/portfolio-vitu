import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { renderSitemap, publishedPaths } from './discovery.ts';

const readPublicFile = (name) =>
  readFileSync(new URL(`../../public/${name}`, import.meta.url), 'utf8');

test('publishes canonical routes in a lean sitemap', () => {
  const sitemap = renderSitemap('https://www.eovitu.com.br');
  const canonicalRoutes = [
    'https://www.eovitu.com.br/',
    'https://www.eovitu.com.br/work/emprega-co',
    'https://www.eovitu.com.br/work/doces-da-pati',
    'https://www.eovitu.com.br/work/helppet',
  ];

  for (const route of canonicalRoutes) {
    assert.match(sitemap, new RegExp(`<loc>${route}</loc>`));
  }

  assert.equal((sitemap.match(/<loc>/g) ?? []).length, canonicalRoutes.length);
  assert.equal(publishedPaths.length, 4);
  assert.doesNotMatch(sitemap, /404|not-found|nao-existe|torneio-pebolim/);
  assert.doesNotMatch(sitemap, /<lastmod>/);
  assert.doesNotMatch(sitemap, /<(?:priority|changefreq)>/);
});

test('connects robots and llms discovery files to the canonical site', () => {
  const robots = readPublicFile('robots.txt');
  const llms = readPublicFile('llms.txt');

  assert.match(robots, /Sitemap: https:\/\/www\.eovitu\.com\.br\/sitemap\.xml/);
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.doesNotMatch(robots, /Disallow:/);
  assert.match(llms, /https:\/\/www\.eovitu\.com\.br\/sitemap\.xml/);
  assert.match(llms, /https:\/\/www\.eovitu\.com\.br\/robots\.txt/);
});
