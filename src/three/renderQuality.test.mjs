import assert from 'node:assert/strict';
import test from 'node:test';
import { detectTier, QUALITY } from './renderQuality.ts';

test('uses the low tier for constrained and touch-first devices', () => {
  assert.equal(
    detectTier({ width: 390, coarsePointer: true, cores: 8, memoryGb: 8 }),
    'low',
  );
  assert.equal(
    detectTier({ width: 1440, coarsePointer: false, cores: 4, memoryGb: 16 }),
    'low',
  );
});

test('reserves high quality for capable wide-screen devices', () => {
  assert.equal(
    detectTier({ width: 1024, coarsePointer: false, cores: 8, memoryGb: 8 }),
    'balanced',
  );
  assert.equal(
    detectTier({ width: 1440, coarsePointer: false, cores: 12, memoryGb: 16 }),
    'high',
  );
});

test('keeps the mobile pixel and model budgets below desktop', () => {
  assert.ok(QUALITY.low.dpr[1] < QUALITY.high.dpr[1]);
  assert.ok(QUALITY.low.targetSize < QUALITY.high.targetSize);
});
