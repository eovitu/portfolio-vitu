import { useEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { requestRefresh } from '../lib/refreshGate';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';
import { WARP, dropNested } from '../lib/warpTargets';

/**
 * The collapse — CONTACT being consumed.
 *
 * As the reader reaches the bottom, everything in the section is drawn toward
 * the object and swallowed, until only the event horizon and one escaping
 * signal remain: the email address. That last element is the point of the
 * section, so it is the one thing gravity does not get.
 *
 * This reuses the Phase B warp vocabulary rather than inventing a second
 * suction system: the same `[data-warp]` selector and the same `dropNested`
 * rule that stops a parent and its child both being swallowed. An element that
 * is absorbable on reload is absorbable here by construction — there is one
 * answer to "what can be consumed", not two that drift apart.
 *
 * It is scrubbed, not played: the reader controls the collapse with the
 * scroll, which is what makes the heavier scroll of the time dilation read as
 * resistance rather than as lag.
 */
export function useCollapse(
  sectionRef: RefObject<HTMLElement>,
  surviveSelector: string,
): void {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const survivor = section.querySelector<HTMLElement>(surviveSelector);
      const targets = dropNested(
        Array.from(section.querySelectorAll<HTMLElement>(WARP)),
      ).filter(
        (el) =>
          el !== survivor && !survivor?.contains(el) && !el.contains(survivor as Node),
      );
      if (!targets.length) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 40%',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      targets.forEach((el, i) => {
        /**
         * Each element falls toward the horizon from where it happens to be,
         * so the convergence is real rather than a uniform slide. Depth is
         * staggered by index: the further down the section an element sits,
         * the later it goes, which reads as the collapse propagating.
         */
        tl.to(
          el,
          {
            xPercent: () => {
              const r = el.getBoundingClientRect();
              return (
                ((window.innerWidth / 2 - (r.left + r.width / 2)) / Math.max(1, r.width)) *
                100
              );
            },
            yPercent: () => {
              const r = el.getBoundingClientRect();
              return (
                ((window.innerHeight - (r.top + r.height / 2)) / Math.max(1, r.height)) *
                100
              );
            },
            scale: 0.04,
            opacity: 0,
            ease: 'power2.in',
          },
          i * 0.06,
        );
      });

      if (survivor) {
        /**
         * The one signal that escapes. It is not merely left alone — it is
         * pulled at and holds, which is what makes it read as escaping rather
         * than as forgotten.
         */
        tl.fromTo(
          survivor,
          { scale: 1, y: 0 },
          { scale: 1.06, y: -18, ease: 'power1.out' },
          0,
        );
      }
    }, section);

    // Deferred while the WORK pin is engaged — see lib/refreshGate.
    requestRefresh();
    return () => ctx.revert();
  }, [sectionRef, surviveSelector]);
}
