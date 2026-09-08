import assert from 'node:assert/strict';
import test from 'node:test';
import { NEUTRAL, sameSurface, surfaceFor } from './surface.ts';
import { PROJECT_THEMES } from '../motion/projectThemes.ts';

test('a case owns the ground, Selected Work owns only the accent', () => {
  const doces = surfaceFor({ route: 'case', slug: 'doces-da-pati' });
  assert.equal(doces.surface, '#F2E9DE');
  assert.equal(doces.ink, '#3B2318');
  assert.equal(doces.accent, '#7A4428');

  const works = surfaceFor({ route: 'home', accentOnly: 'doces-da-pati' });
  assert.equal(works.surface, NEUTRAL.surface, 'the home ground must not change');
  assert.equal(works.ink, NEUTRAL.ink);
  assert.equal(works.accent, '#F2E9DE');
});

test('everything else is neutral', () => {
  assert.ok(sameSurface(surfaceFor({ route: 'home' }), NEUTRAL));
  assert.ok(sameSurface(surfaceFor({ route: 'notFound' }), NEUTRAL));
  assert.ok(sameSurface(surfaceFor({ route: 'case' }), NEUTRAL), 'a case with no slug');
});

test('every theme pairs an ink that clears AA against its own surface', () => {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return (
      0.2126 * lin(((n >> 16) & 255) / 255) +
      0.7152 * lin(((n >> 8) & 255) / 255) +
      0.0722 * lin((n & 255) / 255)
    );
  };
  const ratio = (a, b) => (Math.max(L(a), L(b)) + 0.05) / (Math.min(L(a), L(b)) + 0.05);

  for (const [slug, theme] of Object.entries(PROJECT_THEMES)) {
    assert.ok(ratio(theme.ink, theme.surface) >= 4.5, `${slug} ink`);
    // The accent carries state, active chapter, focus ring, so it is text.
    assert.ok(ratio(theme.accent, theme.surface) >= 4.5, `${slug} accent`);
    assert.ok(ratio(theme.showcaseInk, theme.showcase) >= 4.5, `${slug} showcase`);
    assert.ok(ratio(theme.showcase, NEUTRAL.surface) >= 4.5, `${slug} home accent`);
  }
});

test('the support colour is marked decorative because it cannot carry text', () => {
  // Rosé measures 2.16:1 on the cream ground: below AA text (4.5) and below
  // the 3:1 floor for meaningful UI. The type says optional; this says why.
  const doces = PROJECT_THEMES['doces-da-pati'];
  assert.equal(doces.accentAlt, '#D98C8C');
  assert.notEqual(doces.accent, doces.accentAlt);
});

test('the three projects are three expressions of one system', () => {
  const layouts = Object.values(PROJECT_THEMES).map((t) => t.layout);
  assert.deepEqual(layouts, ['flow', 'editorial', 'organic']);
  const eases = new Set(Object.values(PROJECT_THEMES).map((t) => t.easing));
  assert.equal(eases.size, 3, 'each project has its own temperature of movement');
  const surfaces = Object.values(PROJECT_THEMES).map((t) => t.surface);
  assert.equal(surfaces.filter((s) => s === '#F2E9DE').length, 1, 'exactly one light case');
});
