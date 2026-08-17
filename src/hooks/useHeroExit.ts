import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';

/**
 * Hero exit: the copy lifts away and fades while the singularity — which now
 * lives on its own fixed layer — stays on screen behind the rest of the page.
 */
export function useHeroExit(sectionRef: RefObject<HTMLElement>): void {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to('[data-hero-fade]', {
        y: -140,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom 55%',
          scrub: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, [sectionRef]);
}
