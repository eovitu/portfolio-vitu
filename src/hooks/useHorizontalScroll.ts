import { useLayoutEffect, type RefObject } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { EASE, EASE_SOFT, PANEL } from '../lib/motion';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';
import { setTrackProgress } from '../lib/veil';

interface Options {
  wrapRef: RefObject<HTMLElement>;
  pinRef: RefObject<HTMLElement>;
  trackRef: RefObject<HTMLElement>;
  /** Desktop + motion allowed. When false the section is a plain vertical stack. */
  enabled: boolean;
  onProgress?: (index: number) => void;
}

/**
 * WORK — vertical scroll drives horizontal progression.
 *
 * ONE scrubbed master timeline owns the whole chapter: the track travel *and*
 * every panel entrance. Competing triggers inside a pinned container are what
 * produce the classic "jump / rewind / giant black gap" artefacts, so there is
 * deliberately only one ScrollTrigger here.
 *
 * The scroll distance is the *measured* overflow (`scrollWidth - pinWidth`),
 * recomputed on every refresh via `invalidateOnRefresh` + function-based `end`,
 * so no fixed width can desync the pin from the track on resize.
 */
export function useHorizontalScroll({
  wrapRef,
  pinRef,
  trackRef,
  enabled,
  onProgress,
}: Options): void {
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!wrap || !pin || !track) return;

    const panels = Array.from(track.querySelectorAll<HTMLElement>('[data-panel]'));
    if (!panels.length) return;

    const reduced = prefersReducedMotion();

    if (!enabled) {
      // Vertical fallback: each panel reveals on its own as it scrolls in.
      const ctx = gsap.context(() => {
        panels.forEach((panel) => {
          const items = panel.querySelectorAll<HTMLElement>('[data-p]');
          const media = panel.querySelector<HTMLElement>('[data-panel-media]');

          if (reduced) {
            // Reduced motion: no entrance at all, just the finished layout.
            gsap.set(items, PANEL.itemsTo);
            if (media) gsap.set(media, { clipPath: 'none' });
            return;
          }

          gsap.set(items, PANEL.itemsFrom);
          const tl = gsap.timeline({
            scrollTrigger: { trigger: panel, start: 'top 78%', once: true },
            defaults: { ease: EASE },
          });
          tl.to(items, { ...PANEL.itemsTo, duration: 1, stagger: 0.07 });
          if (media) {
            tl.fromTo(
              media,
              { clipPath: 'inset(0 0 100% 0)' },
              { clipPath: 'inset(0 0 0% 0)', duration: 1.1 },
              0.1,
            );
          }
        });
      }, wrap);
      return () => ctx.revert();
    }

    const ctx = gsap.context(() => {
      const n = panels.length;

      /**
       * Panels are sized to the section, not to `100vw` (scrollbar-safe) and
       * NOT to the pin: ScrollTrigger writes an inline width onto the pinned
       * element to hold the layout, so `pin.clientWidth` is frozen at its
       * first measurement and the track would never re-fit after a resize.
       * `wrap` is outside the pin-spacer and always reports the live width.
       */
      const viewport = () => wrap.clientWidth;

      const sizePanels = () => {
        const w = viewport();
        panels.forEach((p) => {
          p.style.flex = `0 0 ${w}px`;
        });
      };
      sizePanels();
      // Re-fit on every ScrollTrigger refresh *and* on an owned, debounced
      // resize handler. The first keeps the function-based `end` honest; the
      // second guarantees the panels are re-measured before that refresh runs,
      // which `refreshInit` alone does not do reliably once the pin is live.
      ScrollTrigger.addEventListener('refreshInit', sizePanels);

      let resizeTimer = 0;
      const onResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          sizePanels();
          ScrollTrigger.refresh();
        }, 150);
      };
      window.addEventListener('resize', onResize);

      /** The real horizontal overflow — never a hard-coded multiple of 100vw. */
      const distance = () => Math.max(0, track.scrollWidth - viewport());

      /** Last quantised motion-blur step, so the DOM is written only on change. */
      let lastBlur = -1;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin,
          pinSpacing: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            onProgress?.(Math.min(n - 1, Math.round(self.progress * (n - 1))));

            /**
             * Falling between orbits, not sliding between slides.
             *
             * A linear track translate reads as a carousel however it is
             * eased. What separates "the camera dropped" from "a panel slid"
             * is that a fall smears: speed produces blur and a slight
             * compression along the axis of travel, and both resolve as the
             * camera settles.
             *
             * Driven by the trigger's own velocity rather than by a second
             * timeline, so it cannot desynchronise from the travel it is
             * describing. Quantised, and written as an empty string at rest —
             * a standing `filter` would keep the track on its own composited
             * layer for the entire chapter and cost frames for nothing.
             */
            const v = Math.min(1, Math.abs(self.getVelocity()) / 2600);
            const step = Math.round(v * 12) / 12;
            if (step !== lastBlur) {
              lastBlur = step;
              // `filter` is a property nothing else writes, so it is safe to
              // set directly. The compression is handed to GSAP instead: the
              // track's `transform` already belongs to the travel tween, and
              // appending to it by hand is how transform collisions start.
              track.style.filter = step > 0.04 ? `blur(${(step * 3.4).toFixed(2)}px)` : '';
              gsap.set(track, { scaleX: step > 0.04 ? 1 + step * 0.012 : 1 });
            }
            // The object's recession through the three orbits rides this same
            // scrubbed timeline, so veil and panel cannot disagree about which
            // orbit is on screen.
            setTrackProgress(self.progress, true);
          },
          onLeave: () => setTrackProgress(1, false),
          onLeaveBack: () => setTrackProgress(0, false),
          onEnter: () => setTrackProgress(0, true),
          onEnterBack: () => setTrackProgress(1, true),
        },
      });

      // Track travel: duration `n - 1` so one timeline unit === one panel.
      tl.to(track, { x: () => -distance(), duration: n - 1 }, 0);

      panels.forEach((panel, i) => {
        const items = panel.querySelectorAll<HTMLElement>('[data-p]');
        const media = panel.querySelector<HTMLElement>('[data-panel-media]');
        const image = panel.querySelector<HTMLElement>('[data-panel-image]');
        const at = Math.max(0, i - PANEL.leadIn);

        gsap.set(items, PANEL.itemsFrom);

        if (i === 0) {
          // The first panel is already on screen when the pin engages, so its
          // entrance must NOT be scrubbed: tying it to the timeline would open
          // the chapter on a viewport of black until the reader scrolled a
          // quarter of the way through it. It plays once, just before the pin.
          const intro = gsap.timeline({
            scrollTrigger: { trigger: wrap, start: 'top 85%', once: true },
            defaults: { ease: EASE },
          });
          intro.to(items, { ...PANEL.itemsTo, duration: 1, stagger: 0.07 });
          if (media) {
            intro.fromTo(
              media,
              { clipPath: 'inset(0 0 100% 0)' },
              { clipPath: 'inset(0 0 0% 0)', duration: 1.1 },
              0.1,
            );
          }
          if (image) {
            intro.fromTo(
              image,
              { scale: PANEL.imageScale },
              { scale: 1, duration: 1.2, ease: EASE_SOFT },
              0.1,
            );
          }
        } else {
          tl.to(
            items,
            {
              ...PANEL.itemsTo,
              duration: PANEL.itemsDuration,
              stagger: PANEL.itemsStagger,
              ease: EASE,
            },
            at,
          );

          if (media) {
            tl.fromTo(
              media,
              { clipPath: 'inset(0 0 100% 0)' },
              { clipPath: 'inset(0 0 0% 0)', duration: PANEL.mediaDuration, ease: EASE },
              at + PANEL.mediaDelay,
            );
          }
          if (image) {
            tl.fromTo(
              image,
              { scale: PANEL.imageScale },
              { scale: 1, duration: 0.8, ease: EASE_SOFT },
              at + PANEL.mediaDelay,
            );
          }
        }

        // Subtle horizontal drift on the plate, for every panel.
        if (image) {
          tl.fromTo(
            image,
            { xPercent: PANEL.imageParallax },
            { xPercent: -PANEL.imageParallax, duration: 1 },
            Math.max(0, i - 0.5),
          );
        }
      });

      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener('resize', onResize);
        ScrollTrigger.removeEventListener('refreshInit', sizePanels);
      };
    }, wrap);

    return () => {
      ctx.revert();
      // Inline sizing is ours, not GSAP's — clear it so the vertical fallback
      // (or a re-mount) starts from the stylesheet's values.
      panels.forEach((p) => {
        p.style.flex = '';
      });
    };
  }, [wrapRef, pinRef, trackRef, enabled, onProgress]);
}
