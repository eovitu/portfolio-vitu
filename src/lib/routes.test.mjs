import assert from 'node:assert/strict';
import test from 'node:test';
import { hrefForCase, isSameRoute, resolveRoute } from './routes.ts';

test('resolves home and every public case path', () => {
  assert.deepEqual(resolveRoute('/'), { kind: 'home' });
  assert.deepEqual(resolveRoute('/work/emprega-co'), {
    kind: 'case',
    slug: 'emprega-co',
  });
  assert.deepEqual(resolveRoute('/work/doces-da-pati/'), {
    kind: 'case',
    slug: 'doces-da-pati',
  });
  assert.equal(hrefForCase('helppet'), '/work/helppet');
});

test('an unknown path is its own route, not a silent home page', () => {
  // Falling back to `home` is what made a wrong URL answer 200 with the home
  // page under it, indexable, with no way for the reader to tell.
  assert.deepEqual(resolveRoute('/missing'), { kind: 'notFound', path: '/missing' });
  assert.deepEqual(resolveRoute('/work/nao-existe'), {
    kind: 'notFound',
    path: '/work/nao-existe',
  });
  assert.deepEqual(resolveRoute('/work/emprega-co/extra'), {
    kind: 'notFound',
    path: '/work/emprega-co/extra',
  });
});

test('two different wrong URLs are two different destinations', () => {
  assert.equal(
    isSameRoute({ kind: 'notFound', path: '/a' }, { kind: 'notFound', path: '/a' }),
    true,
  );
  assert.equal(
    isSameRoute({ kind: 'notFound', path: '/a' }, { kind: 'notFound', path: '/b' }),
    false,
  );
  assert.equal(isSameRoute({ kind: 'notFound', path: '/a' }, { kind: 'home' }), false);
});

test('distinguishes adjacent cases while treating equal routes as identical', () => {
  assert.equal(isSameRoute({ kind: 'home' }, { kind: 'home' }), true);
  assert.equal(
    isSameRoute({ kind: 'case', slug: 'emprega-co' }, { kind: 'case', slug: 'emprega-co' }),
    true,
  );
  assert.equal(
    isSameRoute(
      { kind: 'case', slug: 'emprega-co' },
      { kind: 'case', slug: 'doces-da-pati' },
    ),
    false,
  );
});
