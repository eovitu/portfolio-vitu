import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

/** Prose explaining a rejected option must not read as the option being taken. */
const code = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const stage = read('./SingularityStage.tsx');
const boundary = read('../../three/ModelBoundary.tsx');

/**
 * The spec's non-goals include "No WebGL requirement for reading, navigation,
 * or contact". Two failures can break that, and neither is visible to the
 * boundary inside the scene: `new THREE.WebGLRenderer()` throwing from the
 * layout effect that configures the R3F root, and the lazy 3D chunk failing to
 * load. Both land on the boundary around the canvas, so that boundary is a
 * contract, not a detail.
 */
test('guards the canvas so an unavailable webgl context cannot blank the page', () => {
  assert.match(stage, /<ModelBoundary[^>]*fallback=\{<StaticField/);
  // Around the Suspense, not inside it: a rejected lazy import throws during
  // render rather than suspending, so a boundary beneath Suspense never sees it.
  assert.match(
    stage,
    /<ModelBoundary[\s\S]*?<Suspense[\s\S]*?<SingularityCanvas \/>[\s\S]*?<\/Suspense>[\s\S]*?<\/ModelBoundary>/,
  );
});

test('renders a static field rather than requiring an asset that can also fail', () => {
  // A fallback that depends on a fetched poster carries the failure mode it
  // exists to cover. The field is CSS the document already holds.
  assert.match(stage, /const StaticField = styled\.div/);
  assert.doesNotMatch(code(stage), /poster/);
  // Static by construction, so reduced motion needs no branch of its own.
  assert.doesNotMatch(
    stage,
    /StaticField = styled\.div`[^`]*(transition|animation|transform)/,
  );
});

test('keeps one boundary class for both levels instead of a second copy', () => {
  assert.match(boundary, /class ModelBoundary/);
  assert.match(boundary, /static getDerivedStateFromError/);
  // Catches a throw from a child's render *and* from its lifecycle.
  assert.match(boundary, /componentDidCatch/);
  assert.match(read('../../three/Scene.tsx'), /<ModelBoundary/);
});

test('leaves the persistent scene identity and the veil untouched', () => {
  // Task 4's marker: route swaps must not remount the renderer.
  assert.match(stage, /data-scene-instance/);
  assert.match(stage, /veilValue\(\)/);
});
