import assert from 'node:assert/strict';
import test from 'node:test';
import { renderSeoHtml } from './seoHtml.ts';

const shell = `<!doctype html><html lang="en"><head>
<title>Home</title>
<meta name="description" content="home">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="Home">
<meta property="og:description" content="home">
<meta property="og:image" content="https://eovitu.com.br/og.png">
<meta property="og:image:alt" content="Home">
<meta property="og:locale" content="en_US">
<meta property="og:url" content="https://eovitu.com.br/">
<link rel="canonical" href="https://eovitu.com.br/">
<meta name="twitter:title" content="Home">
<meta name="twitter:description" content="home">
<meta name="twitter:image" content="https://eovitu.com.br/og.png">
<meta name="twitter:image:alt" content="Home">
</head><body></body></html>`;

test('renders crawler-visible metadata and valid case JSON-LD into a route document', () => {
  const html = renderSeoHtml(shell, { kind: 'case', slug: 'helppet' });

  assert.match(html, /<title>HelpPet \| Spring API Gateway by Victor Hugo<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/eovitu\.com\.br\/work\/helppet"/);
  assert.match(html, /property="og:type" content="article"/);
  assert.match(
    html,
    /property="og:image" content="https:\/\/eovitu\.com\.br\/media\/helppet-poster\.webp"/,
  );

  const scripts = [
    ...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g),
  ];
  assert.equal(scripts.length, 2);
  const values = scripts.map((match) => JSON.parse(match[1]));
  assert.deepEqual(
    values.map((value) => value['@type']),
    ['Person', 'CreativeWork'],
  );
});

test('renders a noindex document for the generated 404 artifact', () => {
  const html = renderSeoHtml(shell, { kind: 'notFound', path: '/404' });
  assert.match(html, /name="robots" content="noindex, follow"/);
  assert.doesNotMatch(html, /"@type":"CreativeWork"/);
});
