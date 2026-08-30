import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { PANEL } from './motion.ts';
import { CONTACT_MAX_PRESENCE } from './stagePresence.ts';
import { breakpoints } from '../styles/theme.ts';

const workStyles = readFileSync(
  new URL('../components/sections/Work/Work.styles.ts', import.meta.url),
  'utf8',
);
const contact = readFileSync(
  new URL('../components/sections/Contact/Contact.tsx', import.meta.url),
  'utf8',
);

test('keeps the horizontal chapter compact and out of narrow layouts', () => {
  assert.ok(PANEL.scrollRatio <= 0.65);
  assert.ok(breakpoints.desktop >= 1180);
});

test('keeps project headings readable instead of intentionally cropping them', () => {
  assert.doesNotMatch(workStyles, /11\.8vw|208px/);
  assert.match(workStyles, /clamp\(48px, 7vw, 132px\)/);
});

test('gives the closing collapse enough travel without overscaling WebGL', () => {
  assert.match(contact, /min-height:\s*150vh/);
  assert.match(contact, /transform-origin:\s*left center/);
  assert.ok(CONTACT_MAX_PRESENCE <= 1.12);
});
