import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';

const AMPLITUDE = 40; // yPercent at the extremes, as authored in the design source

/**
 * Scrubbed parallax for every `[data-parallax="<rate>"]` inside the scope.
 * A rate < 1 lags behind the scroll, > 1 leads it. Disabled under reduced
 * motion (the elements simply sit at their layout position).
 */
export function useParallax(scopeRef: RefObject<HTMLElement>): void {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const rate = parseFloat(el.dataset.parallax ?? '1');
        if (!Number.isFinite(rate)) return;
        gsap.fromTo(
          el,
          { yPercent: (1 - rate) * AMPLITUDE },
          {
            yPercent: (rate - 1) * AMPLITUDE,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, scope);

    return () => ctx.revert();
  }, [scopeRef]);
}
