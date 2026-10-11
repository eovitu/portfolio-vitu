import test from 'node:test';
import assert from 'node:assert/strict';
import { localMediaSource } from './localMediaSource.ts';

test('ghost media rejects URL parser authority changes and malformed paths', () => {
  const origin = 'https://www.eovitu.com.br';
  for (const source of [
    '/\\example.com/a.png',
    '//example.com/a.png',
    '/media/..//example.com/a.png',
    '/\n/example.com/a.png',
    '/media/\ta.png',
    '/media/%5ca.png',
    '/media/%00a.png',
    'https://example.com/a.png',
    'data:image/png;base64,a',
    '/media/a.png?remote=1',
    '/media/a.svg',
    null,
  ])
    assert.equal(localMediaSource(source, origin), undefined, String(source));
});

test('ghost media accepts and normalizes supported local images', () => {
  const origin = 'https://www.eovitu.com.br';
  for (const source of [
    '/media/helppet-poster.webp',
    '/media/photo.png',
    '/media/photo.JPEG',
    '/media/photo.avif',
  ])
    assert.equal(localMediaSource(source, origin), source);
  assert.equal(localMediaSource('/media/../photo.png', origin), '/photo.png');
});
