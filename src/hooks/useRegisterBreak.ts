import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { requestRefresh } from '../lib/refreshGate';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';

/**
 * The register break, as an event rather than as a gradient.
 *
 * ABOUT is the one place the site inverts — near-black to bone — and a soft
 * colour ramp across the boundary read as two pages glued together. What makes
 * it an occurrence is that the dark is *consumed*: a curtain of page black
 * sits over the light section and is eaten away from the leading edge as the
 * reader arrives, with a slanted edge so it sweeps rather than slides.
 *
 * Scrubbed, not played, which is what makes it work in both directions for
 * free: scrolling back up re-forms the curtain over the paper.
 *
 * Driven by transform only, never by clip-path. The first pass animated a
 * polygon and it cost real frames: clip-path is not a compositor property, so
 * scrubbing it repainted two 46vh sheets on every scroll frame — measured, the
 * p95 frame interval doubled and DPR 2 dropped 20 frames over a five-second
 * scroll. A translated block with a static skew reads the same and stays on
 * the compositor.
 *
 * The skew is what makes it a sweep instead of a shutter: the sheet's edge is
 * permanently diagonal, so the light arrives across the frame.
 */
export function useRegisterBreak(
  sectionRef: RefObject<HTMLElement>,
  topRef: RefObject<HTMLElement>,
  bottomRef: RefObject<HTMLElement>,
): void {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (!section || !top || !bottom) return;

    if (prefersReducedMotion()) {
      // No sweep: the sections simply meet. The inversion still happens, it
      // just is not animated.
      gsap.set([top, bottom], { autoAlpha: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      /**
       * Entering: the curtain covers the top of the section and retreats
       * upward. The two right-hand vertices lead the two left-hand ones, so
       * the edge is diagonal and the light arrives across the frame instead of
       * as a horizontal line dropping.
       */
      gsap.fromTo(
        top,
        // The shear is carried in both keyframes rather than in the
        // stylesheet: GSAP writes the whole transform, so a CSS skew would be
        // overwritten the moment yPercent is animated.
        { yPercent: 0, skewY: -2.4 },
        {
          yPercent: -112,
          skewY: -2.4,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'top 34%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );

      // Leaving: the dark re-forms, sliding back up over the paper.
      gsap.fromTo(
        bottom,
        { yPercent: 112, skewY: 2.4 },
        {
          yPercent: 0,
          skewY: 2.4,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'bottom 92%',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, section);

    // Through the gate, never directly: this fires on mount, and ABOUT mounts
    // while the reader may already be inside the WORK pin — refreshing there
    // re-measures the pin's length under a live scrub. See lib/refreshGate.
    requestRefresh('about:register-break');
    return () => ctx.revert();
  }, [sectionRef, topRef, bottomRef]);
}
