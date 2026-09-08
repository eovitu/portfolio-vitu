import { useLayoutEffect, useRef } from 'react';
import { useRouteTransition } from '../components/routing/RouteTransitionProvider';
import { gsap } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';
import { coreOrigin, GRAVITY_SECTIONS, offsetToCore } from '../lib/warpTargets';
import { scheduleScrollRefresh } from '../motion/scrollMeasure';

/**
 * Give the whole page one gravitational field, on every route.
 *
 * The footer used to be the only composition that knew about the singularity,
 * which made a route change feel like a collection of unrelated fades. The
 * route content owns this timeline instead: each top-level composition marked
 * `[data-gravity-section]` gets a vector to the same core and leaves in a
 * short, readable cascade.
 *
 * Home and case studies both call it, so there is exactly one gravitational
 * system and no route leaves in a generic fade. They never run at the same
 * time: `AnimatePresence mode="wait"` keeps one scene mounted at a time, which
 * is also why querying the document rather than a scope is safe here.
 *
 * It is also the natural owner of the post-swap re-measure. This timeline is
 * the last authored motion of an entrance and it clears its own transforms
 * before finishing, so the frame right after it is the first moment the
 * document is both complete and untransformed, the only honest moment to ask
 * ScrollTrigger to measure again.
 */
export function useSectionGravity(): void {
  const { phase } = useRouteTransition();
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const mountedRef = useRef(false);

  useLayoutEffect(() => {
    const isFirstRender = !mountedRef.current;
    mountedRef.current = true;

    // A scene mounted while the route machine is swapping is a destination
    // waiting behind the black hole. It must eject on `revealing`, never get
    // swallowed as if it were the outgoing page.
    if (isFirstRender && phase !== 'revealing') return;
    if (phase !== 'occluding' && phase !== 'revealing') return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>(GRAVITY_SECTIONS));

    // Nothing to animate, but the document still changed under ScrollTrigger.
    if (prefersReducedMotion() || !sections.length) {
      if (phase === 'revealing') scheduleScrollRefresh();
      return;
    }

    timelineRef.current?.kill();
    const origin = coreOrigin();
    const vectors = sections.map((section) => offsetToCore(section, origin, 1));
    const xToCore = (index: number) => vectors[index]?.x ?? 0;
    const yToCore = (index: number) => vectors[index]?.y ?? 0;
    const entering = phase === 'revealing';

    gsap.set(sections, {
      transformOrigin: 'center center',
      willChange: 'transform, opacity',
    });

    const timeline = gsap.timeline({
      onComplete: () => {
        if (timelineRef.current !== timeline) return;
        gsap.set(sections, { clearProps: 'transform,opacity,willChange' });
        timelineRef.current = null;
        // Transforms are gone: the layout under the triggers is finally the
        // one the reader will scroll through.
        if (entering) scheduleScrollRefresh();
      },
    });

    if (phase === 'occluding') {
      sections.forEach((section, index) => {
        const at = index * 0.045;
        timeline
          .to(
            section,
            {
              x: xToCore(index),
              y: yToCore(index),
              scale: 0.06,
              opacity: 1,
              duration: 0.46,
              ease: 'power3.in',
            },
            at,
          )
          .to(
            section,
            {
              scale: 0,
              opacity: 0,
              duration: 0.1,
              ease: 'power4.in',
            },
            at + 0.44,
          );
      });
    }

    if (entering) {
      gsap.set(sections, {
        x: xToCore,
        y: yToCore,
        scale: 0,
        opacity: 0,
      });
      sections.forEach((section, index) => {
        const at = index * 0.055;
        timeline
          .to(section, { scale: 0.08, opacity: 1, duration: 0.1, ease: 'power2.out' }, at)
          .to(
            section,
            {
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.62,
              ease: 'expo.out',
            },
            at + 0.05,
          );
      });
    }

    timelineRef.current = timeline;
  }, [phase]);

  /**
   * The scene leaves before its own timeline can finish clearing up.
   *
   * `AnimatePresence` unmounts this subtree the moment the exit is over, so
   * the teardown, not the timeline, is the last thing that runs. Killing it
   * here is what keeps a half-played transform from being inherited by the
   * next mount of the same markup.
   */
  useLayoutEffect(() => {
    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, []);
}
