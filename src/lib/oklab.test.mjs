import assert from 'node:assert/strict';
import test from 'node:test';
import { hexToOklab, mixOklab, oklabToSrgb } from './oklab.ts';

const out = { L: 0, a: 0, b: 0 };
const rgb = [0, 0, 0];
const at = (from, to, t) => {
  mixOklab(hexToOklab(from), hexToOklab(to), t, out);
  return oklabToSrgb(out, rgb).map((v) => Math.round(v * 255));
};
const chroma = ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b);

test('round-trips a colour through Oklab', () => {
  for (const hex of ['#E07A45', '#7A4428', '#4FD48A', '#ffffff']) {
    const [r, g, b] = at(hex, hex, 0);
    const n = parseInt(hex.slice(1), 16);
    assert.ok(Math.abs(r - ((n >> 16) & 255)) <= 1, `${hex} red`);
    assert.ok(Math.abs(g - ((n >> 8) & 255)) <= 1, `${hex} green`);
    assert.ok(Math.abs(b - (n & 255)) <= 1, `${hex} blue`);
  }
});

test('the midpoint between two accents never passes through mud', () => {
  // This is the whole reason the interpolation is not done in sRGB: the
  // straight line from terracotta to green in RGB runs close to the grey
  // axis, and the disc visibly dies on the way across.
  const mid = at('#E07A45', '#4FD48A', 0.5);
  const naive = [
    Math.round((0xe0 + 0x4f) / 2),
    Math.round((0x7a + 0xd4) / 2),
    Math.round((0x45 + 0x8a) / 2),
  ];
  assert.ok(
    chroma(mid) > chroma(naive),
    `oklab midpoint ${mid} should stay more saturated than the sRGB midpoint ${naive}`,
  );
});

test('lightness is carried across the mix rather than collapsing', () => {
  const ends = [hexToOklab('#E07A45').L, hexToOklab('#4FD48A').L];
  mixOklab(hexToOklab('#E07A45'), hexToOklab('#4FD48A'), 0.5, out);
  assert.ok(out.L >= Math.min(...ends) - 1e-6 && out.L <= Math.max(...ends) + 1e-6);
});

test('writes into the caller buffer and allocates nothing', () => {
  const buffer = [0, 0, 0];
  const returned = oklabToSrgb(hexToOklab('#4FD48A'), buffer);
  assert.equal(returned, buffer);
  const target = { L: 0, a: 0, b: 0 };
  assert.equal(mixOklab(hexToOklab('#000000'), hexToOklab('#ffffff'), 0.5, target), target);
});
