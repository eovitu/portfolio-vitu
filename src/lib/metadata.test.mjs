import assert from 'node:assert/strict';
import test from 'node:test';
import { metadataFor, personJsonLd } from './metadata.ts';

test('uses professional English metadata for home and cases', () => {
  const home = metadataFor({ kind: 'home' });
  assert.equal(home.lang, 'en');
  assert.match(home.title, /Backend Developer/);
  assert.equal(home.canonical, 'https://eovitu.com.br/');

  const caseMeta = metadataFor({ kind: 'case', slug: 'doces-da-pati' });
  assert.match(caseMeta.title, /Doces da Pati/);
  assert.match(caseMeta.canonical, /\/work\/doces-da-pati$/);
});

test('publishes verified professional identity as structured data', () => {
  const person = personJsonLd();
  assert.equal(person['@type'], 'Person');
  assert.equal(person.url, 'https://eovitu.com.br/');
  assert.deepEqual(person.sameAs, ['https://github.com/eovitu']);
});

test('a missing page is titled honestly and kept out of the index', () => {
  const page = metadataFor({ kind: 'notFound', path: '/nope' });
  assert.equal(page.robots, 'noindex, follow');
  assert.match(page.title, /Victor Hugo$/);
  assert.notEqual(page.title, metadataFor({ kind: 'home' }).title);
  // The host rewrites everything to index.html, so 200 is unavoidable and
  // `noindex` is the only thing keeping a typo out of search results.
  assert.equal(
    metadataFor({ kind: 'home' }).robots,
    'index, follow, max-image-preview:large',
  );
});
