import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { MEDIA_PARALLAX, MEDIA_REVEAL } from '../lib/motion';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';
import { useAnimationFrame } from '../components/providers/SmoothScrollProvider';
import { CLIP_OPEN, revealVector } from '../lib/revealVector';

/**
 * A media block as a window rather than a sticker.
 *
 * Two things happen. On entry the frame wipes open from the side facing the
 * core while the picture settles out of a slight overscale — the mask and the
 * scale share a duration so they read as one arrival. Then, for as long as the
 * block is on screen, the content inside moves slower than the frame that
 * holds it, which is what stops a picture reading as glued to the page.
 *
 * Scoped to elements the pinned WORK chapter does not own. That chapter
 * already animates its own plates from the scrubbed master timeline, and a
 * second writer on the same nodes is the transform collision this codebase has
 * paid for before.
 *
 * The parallax runs on the shared ticker, never on its own scroll listener,
 * and writes only when the value actually changed.
 */

const FRAME = '[data-media-frame]';
const INNER = '[data-media-inner]';

interface Tracked {
  frame: HTMLElement;
  inner: HTMLElement;
  last: number;
}

/** Module scope: written every frame, never allocated. */
const tracked: Tracked[] = [];

export function useMediaFrame(scopeRef: RefObject<HTMLElement>): void {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReducedMotion()) return;

    const frames = Array.from(scope.querySelectorAll<HTMLElement>(FRAME));
    if (!frames.length) return;

    const ctx = gsap.context(() => {
      frames.forEach((frame) => {
        const inner = frame.querySelector<HTMLElement>(INNER);
        if (!inner) return;

        const v = revealVector(frame);
        gsap.fromTo(
          frame,
          { clipPath: v.clipFrom },
          {
            clipPath: CLIP_OPEN,
            duration: MEDIA_REVEAL.duration,
            ease: MEDIA_REVEAL.ease,
            immediateRender: true,
            clearProps: 'clipPath',
            scrollTrigger: { trigger: frame, start: 'top 88%', once: true },
          },
        );
        gsap.fromTo(
          inner,
          { scale: MEDIA_REVEAL.scaleFrom },
          {
            scale: 1,
            duration: MEDIA_REVEAL.duration,
            ease: MEDIA_REVEAL.ease,
            immediateRender: true,
            scrollTrigger: { trigger: frame, start: 'top 88%', once: true },
          },
        );

        tracked.push({ frame, inner, last: NaN });
      });
    }, scope);

    return () => {
      ctx.revert();
      for (let i = tracked.length - 1; i >= 0; i--) {
        if (scope.contains(tracked[i].frame)) tracked.splice(i, 1);
      }
    };
  }, [scopeRef]);

  useAnimationFrame(() => {
    const vh = window.innerHeight;
    for (const t of tracked) {
      const r = t.frame.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      // -1 above the fold, +1 below it. The inner slides against that, so the
      // frame acts as an aperture the content drifts behind.
      const progress = (r.top + r.height / 2 - vh / 2) / vh;
      const shift = Math.round(progress * r.height * MEDIA_PARALLAX * 100) / 100;
      if (shift === t.last) continue;
      t.last = shift;
      t.inner.style.setProperty('--media-shift', `${shift}px`);
    }
  }, !prefersReducedMotion());
}
