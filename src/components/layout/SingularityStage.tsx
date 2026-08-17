import { Suspense, lazy, useRef } from 'react';
import styled from 'styled-components';
import { useAnimationFrame } from '../providers/SmoothScrollProvider';
import { veilValue } from '../../lib/veil';

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
  opacity: 0;

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

export function SingularityStage() {
  const veil = useRef<HTMLDivElement>(null);
  const last = useRef(-1);

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
      <Layer data-gl aria-hidden="true">
        <Suspense fallback={null}>
          <SingularityCanvas />
        </Suspense>
      </Layer>
      <Veil ref={veil} data-veil aria-hidden="true" />
    </>
  );
}
