import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useAnimationFrame } from '../providers/SmoothScrollProvider';
import { veilValue } from '../../lib/veil';
import { ModelBoundary } from '../../three/ModelBoundary';

// The 3D bundle is the heaviest asset on the page — keep it out of the
// critical path so the typography paints first.
const SingularityCanvas = lazy(() => import('../../three/SingularityCanvas'));

/**
 * The singularity is a fixed layer behind the whole document, not a child of
 * the hero.
 *
 * It has to outlive the first fold: the object stays on screen while the
 * reader moves through WORK, ABOUT, SKILLS and CONTACT, and the intro can pull
 * text into it from any section. A layer inside the hero would be scrolled
 * away — and clipped by the hero's own `overflow: hidden`.
 *
 * `pointer-events: none` so it never intercepts a click, and `z-index: 0`
 * with the content at `z-index: 1` so it always sits behind the copy.
 */
const Layer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 1;
  background:
    radial-gradient(circle at 51% 48%, rgba(214, 159, 81, 0.14), transparent 16%),
    radial-gradient(ellipse at 51% 51%, rgba(233, 231, 226, 0.08), transparent 30%);

  > div {
    position: absolute;
    inset: 0;
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }
`;

/**
 * A veil between the object and the copy.
 *
 * The singularity stays on screen for the whole page, which would otherwise
 * put a bright accretion disc directly behind body text. Rather than move or
 * shrink the object — the composition has to stay fixed — the veil deepens as
 * the reader leaves the hero, so the object recedes without going anywhere.
 */
const Veil = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: ${({ theme }) => theme.colors.bg};
  opacity: 0;
`;

/**
 * What the singularity looks like when there is no singularity.
 *
 * The spec makes WebGL a progressive enhancement, so the scene failing has to
 * be a composition rather than an absence. This is the light the `Layer`
 * already paints, held a little more present: the field the page shows during
 * the ~900 ms before the 3D chunk hydrates, kept permanently instead of being
 * replaced. The failure therefore has no cut — it is the page arriving and
 * then stopping where it was.
 *
 * Deliberately not the first project's poster. That asset is a 1440x900
 * screenshot of a web application, already on screen inside Selected Work;
 * stretched fixed behind every route it would compete with body copy, which is
 * the exact problem `lib/veil` exists to solve. It stays a light field.
 *
 * Static by construction — no transform, no transition — so reduced motion and
 * the `sceneMode('poster')` path need no separate branch here.
 */
const StaticField = styled.div`
  background:
    radial-gradient(circle at 51% 48%, rgba(214, 159, 81, 0.2), transparent 22%),
    radial-gradient(ellipse at 51% 51%, rgba(233, 231, 226, 0.1), transparent 38%);
`;

let sceneInstanceCount = 0;

export function SingularityStage() {
  const [hydrate, setHydrate] = useState(false);
  const veil = useRef<HTMLDivElement>(null);
  const last = useRef(-1);
  const instanceId = useRef<string | null>(null);
  if (!instanceId.current) instanceId.current = `singularity-${++sceneInstanceCount}`;

  useEffect(() => {
    const idle = window.requestIdleCallback?.(() => setHydrate(true), { timeout: 900 });
    const timer = window.setTimeout(() => setHydrate(true), 900);
    return () => {
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      window.clearTimeout(timer);
    };
  }, []);

  useAnimationFrame(() => {
    const el = veil.current;
    if (!el) return;
    // Scroll drives it, except while the intro holds an override (lib/veil).
    const value = veilValue();
    if (value === last.current) return;
    last.current = value;
    el.style.opacity = String(value);
  });

  return (
    <>
      <Layer
        data-gl
        data-scene-instance={import.meta.env.DEV ? instanceId.current : undefined}
        aria-hidden="true"
      >
        {hydrate && (
          // Outside the Suspense on purpose: a rejected lazy import throws
          // during render rather than suspending, so only a boundary above it
          // ever sees the chunk failing to load.
          <ModelBoundary label="scene" fallback={<StaticField data-scene-fallback />}>
            <Suspense fallback={null}>
              <SingularityCanvas />
            </Suspense>
          </ModelBoundary>
        )}
      </Layer>
      <Veil ref={veil} data-veil aria-hidden="true" />
    </>
  );
}
