import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { MOTION_DURATION, MOTION_EASE } from '../motion/tokens';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';
import { isReloadNavigation } from '../lib/reloadSnapshot';

/**
 * A section-scoped alternative to the singularity swallow, for the sections
 * that never travel into the core.
 *
 * On a reload, the hero and the contact CTA are what fall into the black
 * hole; everything else on the page would otherwise just sit there static and
 * break the illusion that the whole page is part of one event. Work, Profile
 * and About get a cheaper trick instead: a plate of the section's own
 * background colour covers it before the first paint, then lifts. The reader
 * never sees the real content pop in, only the section's own colour clearing
 * off it.
 *
 * First visit is untouched, there is nothing to hide from and these sections
 * already have their own scroll-triggered reveal.
 */
export function useReloadColorReveal(
  sectionRef: RefObject<HTMLElement | null>,
  color: string,
): void {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion() || !isReloadNavigation()) return;

    const veil = document.createElement('div');
    veil.setAttribute('data-reload-veil', '');
    veil.style.position = 'absolute';
    veil.style.inset = '0';
    veil.style.zIndex = '6';
    veil.style.pointerEvents = 'none';
    veil.style.background = color;
    section.appendChild(veil);

    const tween = gsap.to(veil, {
      opacity: 0,
      duration: MOTION_DURATION.slow,
      delay: MOTION_DURATION.entryGather * 0.55,
      ease: MOTION_EASE.standard,
      onComplete: () => veil.remove(),
    });

    return () => {
      tween.kill();
      veil.remove();
    };
  }, [sectionRef, color]);
}
