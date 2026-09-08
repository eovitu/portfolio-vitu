import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { getCore } from '../lib/gravityField';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';
import { MOTION_EASE, MOTION_STAGGER } from '../motion/tokens';
import { heroSignal, resetHeroSignal } from '../three/heroSignal';

/**
 * The hero leaving.
 *
 * The words are not lifted away as a block: each one is drawn toward the core's
 * measured screen position, so the copy reads as matter being taken rather than
 * as a page scrolling. The supporting column travels on its own, slower channel
 * so the two do not read as one rigid slab.
 *
 * This writes the outer `[data-hero-word]` node, and it is the only thing that
 * does once the entrance has handed over, `hooks/useHomeMotion` owns that
 * hand-off and is this hook's only caller. The inner `[data-hero-glyph]` belongs
 * to the gravity field and is never touched here.
 *
 * Scroll distance is untouched: no pin, no spacer, no wheel resistance. The
 * section occupies exactly the height it occupied before, and the timeline is
 * scrubbed by the reader's own scrolling.
 */

/** How far toward the core a word travels across the full exit, 0 → 1. */
const COMPRESSION = 0.42;

export function useHeroExit(sectionRef: RefObject<HTMLElement>, enabled: boolean): void {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !enabled || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Queried from the section rather than through scoped selector text: the
      // scope is then a property of this code instead of a property of how
      // GSAP happens to resolve strings, and a later route that reuses these
      // attribute names cannot be picked up by the homepage's exit.
      const words = Array.from(section.querySelectorAll<HTMLElement>('[data-hero-word]'));
      const aside = Array.from(section.querySelectorAll<HTMLElement>('[data-hero-fade]'));
      if (!words.length) return;

      /**
       * Where the words are pulled to, and how far each one has to travel.
       *
       * Measured on refresh rather than per frame, and always from the rest
       * state: measuring a mid-scrub element would compound the offset it has
       * already been given. The scene publishes the core's screen position each
       * frame; when there is no scene, the composition's own focal point, the
       * centre of the hero's radial gradient, stands in for it, so the exit
       * still converges somewhere deliberate instead of collapsing to a corner.
       */
      const deltas: Array<{ x: number; y: number }> = [];
      const measure = () => {
        gsap.set(words, { x: 0, y: 0, scale: 1, opacity: 1 });
        const core = getCore();
        const rect = section.getBoundingClientRect();
        const targetX = core.visible ? core.x : rect.left + rect.width * 0.68;
        const targetY = core.visible ? core.y : rect.top + rect.height * 0.48;

        deltas.length = 0;
        for (const word of words) {
          const box = word.getBoundingClientRect();
          deltas.push({
            x: (targetX - (box.left + box.width / 2)) * COMPRESSION,
            y: (targetY - (box.top + box.height / 2)) * COMPRESSION,
          });
        }
      };

      measure();

      gsap.to(words, {
        x: (index: number) => deltas[index]?.x ?? 0,
        y: (index: number) => deltas[index]?.y ?? 0,
        scale: 0.82,
        opacity: 0,
        ease: MOTION_EASE.scrub,
        stagger: MOTION_STAGGER.word * 0.5,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom 55%',
          scrub: true,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
          // A temporary layer, held only while the exit is actually in range.
          onToggle: (self) => {
            gsap.set(words, { willChange: self.isActive ? 'transform' : 'auto' });
          },
          /**
           * The scene answers the compression. `heroSignal` is composed with
           * `max()` by the render loop, so writing it here neither fights the
           * route transition director's own signals nor allocates.
           */
          onUpdate: (self) => {
            heroSignal.energy = self.progress * 0.6;
            heroSignal.flare = self.progress * 0.35;
          },
        },
      });

      if (aside.length) {
        gsap.to(aside, {
          y: -120,
          opacity: 0,
          ease: MOTION_EASE.scrub,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom 60%',
            scrub: true,
          },
        });
      }
    }, section);

    return () => {
      ctx.revert();
      resetHeroSignal();
    };
  }, [sectionRef, enabled]);
}
