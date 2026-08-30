import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('keeps stage updates in the frame driver instead of scene consumers', () => {
  const scene = readFileSync(new URL('./Scene.tsx', import.meta.url), 'utf8');
  const canvas = readFileSync(new URL('./SingularityCanvas.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(scene, /\bupdateStage\s*\(/);
  assert.equal(canvas.match(/\bupdateStage\s*\(/g)?.length, 1);
});
