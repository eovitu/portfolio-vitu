import { useLayoutEffect, useState, type RefObject } from 'react';
import { useMotionState } from '../components/motion/MotionDirector';
import { gsap } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';
import { MOTION_DURATION, MOTION_EASE, MOTION_STAGGER } from '../motion/tokens';
import { useGravityLetters } from './useGravityLetters';
import { useHeroExit } from './useHeroExit';
import { useSectionGravity } from './useSectionGravity';

/**
 * The homepage's motion, and the baton that keeps it single-authored.
 *
 * Three things want the hero: the entrance, the scroll exit, and the gravity
 * field. The entrance and the exit both write the outer `[data-hero-word]`
 * node, so they may never be live at the same time, this hook is where that is
 * enforced, by handing ownership over exactly once rather than by hoping their
 * ranges do not overlap.
 *
 *   entry layer clears  →  entrance (timed)  →  exit (scrubbed) + gravity
 *
 * If the reader scrolls before the entrance has finished, the entrance is sent
 * to its end and the baton passes immediately: a reader who is already moving
 * must never be animated against.
 */
export function useHomeMotion(heroRef: RefObject<HTMLElement>): void {
  const { mode, revealing, released } = useMotionState();
  const [entranceDone, setEntranceDone] = useState(false);

  // The same gravitational system every route uses. See `useSectionGravity`.
  useSectionGravity();

  /**
   * The pre-entrance state is written from JavaScript, never from CSS.
   *
   * If it lived in a stylesheet, a reader whose scripts failed would be left
   * with a permanently invisible heading. Written here, the worst case is a
   * heading that never animates, which is the correct failure.
   */
  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero || entranceDone) return;
    if (mode === 'static' || prefersReducedMotion()) {
      setEntranceDone(true);
      return;
    }

    const words = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-word]'));
    if (!words.length) {
      setEntranceDone(true);
      return;
    }

    if (!revealing) {
      gsap.set(words, { yPercent: 118, opacity: 0, willChange: 'transform' });
      return;
    }

    let tl: gsap.core.Timeline | null = null;
    let ctx: ReturnType<typeof gsap.context> | null = null;
    const settle = () => {
      // `ctx.revert()` returns the words to the pre-timeline state, which is
      // intentionally hidden below the mask. Clear that state before the
      // baton passes or the exit trigger will inherit `yPercent: 118`.
      ctx?.revert();
      gsap.set(words, { clearProps: 'transform,opacity,willChange' });
      setEntranceDone(true);
    };

    try {
      ctx = gsap.context(() => {
        tl = gsap.timeline({ onComplete: settle });
        tl.to(words, {
          yPercent: 0,
          opacity: 1,
          duration: MOTION_DURATION.slow,
          ease: MOTION_EASE.expel,
          stagger: MOTION_STAGGER.word,
        });
      }, hero);

      // A reader who has started scrolling has already left: end the entrance
      // and let the scrubbed exit take the node over.
      const onScroll = () => {
        if (window.scrollY > 4) tl?.progress(1);
      };
      window.addEventListener('scroll', onScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', onScroll);
        ctx?.revert();
      };
    } catch {
      // The heading is content, not decoration. If the timeline cannot be
      // built, the composition is simply present.
      gsap.set(words, { clearProps: 'all' });
      setEntranceDone(true);
      return;
    }
  }, [heroRef, mode, revealing, entranceDone]);

  // A release that arrives without the entrance ever completing (a failed
  // timeline, a throttled tab) still hands the baton on, nothing may stay
  // waiting on an animation that is not coming.
  useLayoutEffect(() => {
    if (released && !entranceDone && (mode === 'static' || prefersReducedMotion())) {
      setEntranceDone(true);
    }
  }, [released, entranceDone, mode]);

  useHeroExit(heroRef, entranceDone);
  useGravityLetters(heroRef, entranceDone);
}
