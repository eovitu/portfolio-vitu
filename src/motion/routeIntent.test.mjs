import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isEligibleInternalClick,
  shouldFallbackToDocumentNavigation,
  scrollTargetFor,
} from './routeIntent.ts';

test('defines deterministic scroll targets for route relationships', () => {
  assert.deepEqual(
    scrollTargetFor({ from: { kind: 'home' }, to: { kind: 'case', slug: 'helppet' } }),
    { kind: 'top' },
  );
  assert.deepEqual(
    scrollTargetFor({
      from: { kind: 'case', slug: 'helppet' },
      to: { kind: 'case', slug: 'emprega-co' },
    }),
    { kind: 'top' },
  );
  assert.deepEqual(
    scrollTargetFor({
      from: { kind: 'case', slug: 'doces-da-pati' },
      to: { kind: 'home' },
      projectSlug: 'doces-da-pati',
    }),
    { kind: 'selector', value: '[data-project="doces-da-pati"]' },
  );
  assert.deepEqual(
    scrollTargetFor({ from: { kind: 'home' }, to: { kind: 'home' }, hash: '#about' }),
    { kind: 'selector', value: '#about' },
  );
});

test('intercepts only ordinary same-origin primary clicks', () => {
  const event = {
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
  };
  const anchor = {
    href: 'https://devitu.vercel.app/work/helppet',
    target: '',
    download: '',
    origin: 'https://devitu.vercel.app',
  };

  assert.equal(isEligibleInternalClick(event, anchor, 'https://devitu.vercel.app'), true);
  assert.equal(
    isEligibleInternalClick({ ...event, ctrlKey: true }, anchor, anchor.origin),
    false,
  );
  assert.equal(
    isEligibleInternalClick({ ...event, button: 1 }, anchor, anchor.origin),
    false,
  );
  assert.equal(
    isEligibleInternalClick(
      event,
      { ...anchor, origin: 'https://example.com' },
      anchor.origin,
    ),
    false,
  );
  assert.equal(
    isEligibleInternalClick(event, { ...anchor, target: '_blank' }, anchor.origin),
    false,
  );
});

test('accepts only finite saved history positions', () => {
  assert.deepEqual(
    scrollTargetFor({
      from: { kind: 'case', slug: 'helppet' },
      to: { kind: 'home' },
      cause: 'popstate',
      savedScrollY: 840,
    }),
    { kind: 'saved', value: 840 },
  );
  assert.notEqual(
    scrollTargetFor({
      from: { kind: 'case', slug: 'helppet' },
      to: { kind: 'home' },
      cause: 'popstate',
      savedScrollY: Number.NaN,
    }).kind,
    'saved',
  );
});

test('falls back to document navigation after a real transition failure', () => {
  assert.equal(shouldFallbackToDocumentNavigation('link', undefined), true);
  assert.equal(shouldFallbackToDocumentNavigation('link', 'transition timeout'), true);
  assert.equal(shouldFallbackToDocumentNavigation('link', 'superseded'), false);
  assert.equal(shouldFallbackToDocumentNavigation('popstate', undefined), false);
});
