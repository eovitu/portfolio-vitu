import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  creativeWorkJsonLd,
  metadataFor,
  personJsonLd,
  websiteJsonLd,
} from './metadata.ts';

test('uses professional English metadata for home and cases', () => {
  const home = metadataFor({ kind: 'home' });
  assert.equal(home.lang, 'en');
  assert.match(home.title, /Backend Developer/);
  assert.equal(home.canonical, 'https://eovitu.com.br/');

  const caseMeta = metadataFor({ kind: 'case', slug: 'doces-da-pati' });
  assert.match(caseMeta.title, /Doces da Pati/);
  assert.match(caseMeta.canonical, /\/work\/doces-da-pati$/);
});

test('publishes unique search and social metadata for every indexable route', () => {
  const pages = [
    metadataFor({ kind: 'home' }),
    metadataFor({ kind: 'case', slug: 'emprega-co' }),
    metadataFor({ kind: 'case', slug: 'doces-da-pati' }),
    metadataFor({ kind: 'case', slug: 'helppet' }),
  ];

  assert.equal(new Set(pages.map((page) => page.title)).size, pages.length);
  assert.equal(new Set(pages.map((page) => page.description)).size, pages.length);
  assert.equal(new Set(pages.map((page) => page.canonical)).size, pages.length);
  assert.equal(new Set(pages.map((page) => page.image)).size, pages.length);

  for (const page of pages) {
    assert.ok(page.title.length <= 60, `${page.title.length}: ${page.title}`);
    assert.ok(
      page.description.length >= 145 && page.description.length <= 160,
      `${page.description.length}: ${page.description}`,
    );
    assert.match(page.image, /^https:\/\/eovitu\.com\.br\//);
    assert.ok(page.imageAlt.length > 0);
  }
});

test('publishes valid CreativeWork JSON-LD only for case-study routes', () => {
  assert.equal(creativeWorkJsonLd({ kind: 'home' }), null);
  assert.equal(creativeWorkJsonLd({ kind: 'notFound', path: '/missing' }), null);

  for (const slug of ['emprega-co', 'doces-da-pati', 'helppet']) {
    const value = creativeWorkJsonLd({ kind: 'case', slug });
    assert.equal(value?.['@type'], 'CreativeWork');
    assert.equal(value?.url, `https://eovitu.com.br/work/${slug}`);
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(value)));
  }

  assert.doesNotThrow(() => JSON.parse(JSON.stringify(personJsonLd())));
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(websiteJsonLd())));
});

test('publishes verified professional identity as structured data', () => {
  const person = personJsonLd();
  assert.equal(person['@type'], 'Person');
  assert.equal(person.url, 'https://eovitu.com.br/');
  assert.deepEqual(person.sameAs, [
    'https://github.com/eovitu',
    'https://www.linkedin.com/in/eovitu/',
  ]);
  assert.deepEqual(person.alternateName, ['Vitu', 'eovitu']);
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

test('publishes the Search Console verification token in the static document', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

  assert.match(html, /name="google-site-verification"/);
  assert.match(html, /OkT1hO5kPhsCp6MqJnKpXjNYbMIKQSmUIFZXUrp34Ks/);
});
