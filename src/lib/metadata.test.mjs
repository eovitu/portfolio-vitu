import assert from 'node:assert/strict';
import test from 'node:test';
import { metadataFor, personJsonLd } from './metadata.ts';

test('uses professional English metadata for home and cases', () => {
  const home = metadataFor({ kind: 'home' });
  assert.equal(home.lang, 'en');
  assert.match(home.title, /Backend Developer/);
  assert.equal(home.canonical, 'https://devitu.vercel.app/');

  const caseMeta = metadataFor({ kind: 'case', slug: 'doces-da-pati' });
  assert.match(caseMeta.title, /Doces da Pati/);
  assert.match(caseMeta.canonical, /\/work\/doces-da-pati$/);
});

test('publishes verified professional identity as structured data', () => {
  const person = personJsonLd();
  assert.equal(person['@type'], 'Person');
  assert.equal(person.url, 'https://devitu.vercel.app/');
  assert.deepEqual(person.sameAs, ['https://github.com/eovitu']);
});
