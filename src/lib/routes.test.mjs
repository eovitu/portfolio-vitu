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

test('unknown paths fall back to home without inventing a route', () => {
  assert.deepEqual(resolveRoute('/missing'), { kind: 'home' });
});

test('distinguishes adjacent cases while treating equal routes as identical', () => {
  assert.equal(isSameRoute({ kind: 'home' }, { kind: 'home' }), true);
  assert.equal(
    isSameRoute(
      { kind: 'case', slug: 'emprega-co' },
      { kind: 'case', slug: 'emprega-co' },
    ),
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
