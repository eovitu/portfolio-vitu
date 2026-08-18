import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { SKEW } from '../lib/motion';
import { useAnimationFrame } from '../hooks/useSmoothScroll';
import { useReducedMotion } from '../hooks/useReducedMotion';

const SELECTOR = '[data-skew]';

/**
 * Scroll velocity as a global input.
 *
 * Matter under acceleration deforms, so fast scrolling shears and stretches
 * the large type and it settles when the reader stops. The previous values
 * were below the threshold of perception — the effect was in the code and not
 * on the screen.
 *
 * The clamp is a legibility budget rather than a taste: past roughly 7 degrees
 * the baselines of a paragraph stop lining up and the copy smears. Headlines
 * only carry `[data-skew]` for the same reason.
 *
 * Deliberately not applied to the hero glyphs. Those already have a writer —
 * the gravity field owns `[data-glyph]` — and this is the same disjoint-channel
 * discipline: two systems never share a node.
 *
 * Velocity comes from the shared frame loop, so there is no extra scroll
 * listener and no React state.
 */
export function useScrollSkew(): void {
  const skewTo = useRef<Array<(value: number) => void>>([]);
  const scaleTo = useRef<Array<(value: number) => void>>([]);
  const lastY = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    skewTo.current = targets.map((el) =>
      gsap.quickTo(el, 'skewY', { duration: SKEW.duration, ease: 'power3.out' }),
    );
    // Shear alone reads as a slide. The vertical stretch is what makes it read
    // as the element resisting the movement it is being dragged through.
    scaleTo.current = targets.map((el) =>
      gsap.quickTo(el, 'scaleY', { duration: SKEW.duration, ease: 'power3.out' }),
    );
    lastY.current = window.scrollY;
    return () => {
      gsap.set(targets, { skewY: 0, scaleY: 1 });
      skewTo.current = [];
      scaleTo.current = [];
    };
  }, [reduced]);

  useAnimationFrame(() => {
    const y = window.scrollY;
    const velocity = y - lastY.current;
    lastY.current = y;
    const skew = gsap.utils.clamp(-SKEW.clamp, SKEW.clamp, velocity * SKEW.factor);
    // Always a stretch, never a squash: sign is dropped so scrolling up and
    // scrolling down both elongate rather than one of them compressing.
    const stretch =
      1 + gsap.utils.clamp(0, SKEW.stretchClamp, Math.abs(velocity) * SKEW.stretch);
    for (let i = 0; i < skewTo.current.length; i++) {
      skewTo.current[i](skew);
      scaleTo.current[i](stretch);
    }
  }, !reduced);
}
