import assert from 'node:assert/strict';
import test from 'node:test';
import { PROJECT_THEMES } from './projectThemes.ts';

test('defines a distinct complete theme for every project', () => {
  assert.deepEqual(Object.keys(PROJECT_THEMES), ['emprega-co', 'doces-da-pati', 'helppet']);
  assert.equal(new Set(Object.values(PROJECT_THEMES).map((theme) => theme.accent)).size, 3);
  for (const theme of Object.values(PROJECT_THEMES)) {
    assert.equal(typeof theme.dust, 'string');
    assert.equal(Number.isFinite(theme.particleSpread), true);
    assert.equal(Number.isFinite(theme.orbitOrder), true);
    assert.equal(Number.isFinite(theme.mediaDepth), true);
    assert.equal(Number.isFinite(theme.temperature), true);
  }
});
