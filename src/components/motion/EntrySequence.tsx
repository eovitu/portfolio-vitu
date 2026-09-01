import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { MOTION_DURATION, MOTION_EASE, MOTION_STAGGER } from '../../motion/tokens';
import { markVisitSeen, type VisitMode } from '../../motion/visitState';
import { heroSignal, resetHeroSignal } from '../../three/heroSignal';
import * as S from './EntrySequence.styles';

/**
 * The entry layer.
 *
 * It is painted *over* HTML that has already rendered — the heading, the
 * navigation and the project list are in the document and readable from the
 * first paint, and this layer is only the composition that hands the screen
 * over. Nothing here is a prerequisite for the page being correct: if every
 * animation in this file failed to run, the reader would still have the
 * finished page underneath.
 *
 * The lifecycle is bounded three independent ways and the first to fire wins:
 * the scene's canvas appearing, a project poster decoding, or the absolute
 * fail-safe. Everything funnels through one `finish()`.
 *
 * `finish(notify)` takes a flag rather than existing twice. Success, failure
 * and timeout all release *and* tell the director; a React unmount only tears
 * down, because an unmounted overlay is already not holding the interface and
 * because StrictMode's development double-invoke would otherwise consume the
 * entry before the reader ever saw it.
 */

interface Props {
  mode: VisitMode;
  onRelease: () => void;
}

const FRAGMENT_COUNT = 14;

/**
 * Deterministic positions on a golden-angle spiral, as a fraction of the
 * viewport's short side — deterministic rather than random so a re-render or a
 * resize can never produce two different fields.
 */
const FRAGMENTS = Array.from({ length: FRAGMENT_COUNT }, (_, index) => {
  const angle = index * 2.39996;
  const radius = 0.2 + (index / FRAGMENT_COUNT) * 0.32;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
});

export function EntrySequence({ mode, onRelease }: Props) {
  const overlay = useRef<HTMLDivElement>(null);
  const onReleaseRef = useRef(onRelease);
  onReleaseRef.current = onRelease;

  useLayoutEffect(() => {
    let settled = false;
    let ctx: ReturnType<typeof gsap.context> | null = null;
    let observer: MutationObserver | null = null;
    const timers: number[] = [];
    const detach: Array<() => void> = [];

    const finish = (notify: boolean) => {
      if (settled) return;
      settled = true;
      for (const timer of timers) window.clearTimeout(timer);
      timers.length = 0;
      observer?.disconnect();
      observer = null;
      for (const off of detach) off();
      detach.length = 0;
      ctx?.revert();
      ctx = null;
      resetHeroSignal();
      if (notify) {
        markVisitSeen();
        onReleaseRef.current();
      }
    };

    /** Success, failure and timeout all land here. */
    const release = () => finish(true);

    // Reduced motion receives the finished composition, not a faster
    // animation. Nothing is rendered, so there is nothing to fade out and the
    // release happens before the browser paints.
    if (mode === 'static') {
      release();
      return;
    }

    // The absolute ceiling, deliberately independent of the timeline, the
    // observers and the readiness race, because its whole job is to survive
    // their failure.
    timers.push(window.setTimeout(release, MOTION_DURATION.entryFailsafeMs));

    try {
      ctx = gsap.context(() => {
        const root = overlay.current;
        if (!root) return;

        const fragments = Array.from(
          root.querySelectorAll<HTMLElement>('[data-entry-fragment]'),
        );
        const core = root.querySelector<HTMLElement>('[data-entry-core]');
        const flare = root.querySelector<HTMLElement>('[data-entry-flare]');
        // Outside this component's DOM, so these are held by reference rather
        // than by selector. Their hidden state is set here and never in CSS:
        // with JavaScript disabled the navigation must simply be visible.
        const nav = document.querySelector<HTMLElement>('[data-nav]');
        const navItems = Array.from(
          document.querySelectorAll<HTMLElement>('[data-nav-item]'),
        );

        if (mode === 'repeat') {
          gsap.set(core, { scale: 0.4, opacity: 1 });
          gsap
            .timeline({ onComplete: release })
            .to(core, {
              scale: 1.6,
              opacity: 0,
              duration: MOTION_DURATION.entryRepeat,
              ease: MOTION_EASE.expel,
            })
            .to(
              root,
              {
                opacity: 0,
                duration: MOTION_DURATION.entryRepeat * 0.8,
                ease: MOTION_EASE.standard,
              },
              0,
            )
            .to(
              heroSignal,
              {
                flare: 0.6,
                energy: 0.5,
                duration: MOTION_DURATION.entryRepeat,
                ease: MOTION_EASE.expel,
              },
              0,
            );
          return;
        }

        // --- first visit --------------------------------------------------
        const reach = Math.min(window.innerWidth, window.innerHeight);
        gsap.set(fragments, {
          x: (index: number) => FRAGMENTS[index].x * reach,
          y: (index: number) => FRAGMENTS[index].y * reach,
          opacity: 0,
        });
        gsap.set(core, { scale: 0, opacity: 1 });
        gsap.set(flare, { scaleX: 0, opacity: 0 });
        if (nav) gsap.set(nav, { opacity: 0 });
        if (navItems.length) gsap.set(navItems, { y: -8, opacity: 0 });

        let gathered = false;
        let ready = false;
        let expelling = false;

        /** Phase B — expulsion reveals the interface, then settles onto it. */
        const expel = () => {
          if (expelling || settled) return;
          expelling = true;
          const tl = gsap.timeline({ onComplete: release });
          tl.to(
            flare,
            {
              scaleX: 1.7,
              opacity: 0,
              duration: MOTION_DURATION.entryRelease,
              ease: MOTION_EASE.expel,
            },
            0,
          )
            .to(
              core,
              {
                scale: 2.4,
                opacity: 0,
                duration: MOTION_DURATION.entryRelease,
                ease: MOTION_EASE.expel,
              },
              0,
            )
            .to(fragments, { opacity: 0, duration: MOTION_DURATION.quick }, 0)
            .to(
              heroSignal,
              {
                energy: 1,
                flare: 1,
                swell: 0.09,
                duration: MOTION_DURATION.entryRelease * 0.45,
                ease: MOTION_EASE.expel,
              },
              0,
            )
            // The layer clears into the composition that is already underneath
            // it, so the hand-off has no cut: nothing moves into place, the
            // cover simply stops being there.
            .to(
              root,
              {
                opacity: 0,
                duration: MOTION_DURATION.entryRelease * 0.8,
                ease: MOTION_EASE.standard,
              },
              0.05,
            );
          if (nav) {
            tl.to(
              nav,
              {
                opacity: 1,
                duration: MOTION_DURATION.standard,
                ease: MOTION_EASE.standard,
              },
              0.1,
            );
          }
          if (navItems.length) {
            tl.to(
              navItems,
              {
                y: 0,
                opacity: 1,
                duration: MOTION_DURATION.standard,
                ease: MOTION_EASE.standard,
                stagger: MOTION_STAGGER.block,
              },
              0.14,
            );
          }
        };

        const markReady = () => {
          if (ready) return;
          ready = true;
          if (gathered) expel();
        };

        /** Phase A — empty field, fragments, convergence, core, disc flare. */
        gsap
          .timeline({
            onComplete: () => {
              gathered = true;
              if (ready) expel();
            },
          })
          .to(fragments, {
            opacity: 1,
            duration: MOTION_DURATION.quick,
            stagger: MOTION_STAGGER.glyph,
          })
          .to(
            fragments,
            {
              x: 0,
              y: 0,
              scale: 0.35,
              duration: MOTION_DURATION.entryGather * 0.72,
              ease: MOTION_EASE.attract,
              stagger: MOTION_STAGGER.glyph,
            },
            MOTION_DURATION.quick * 0.6,
          )
          .to(
            core,
            {
              scale: 1,
              duration: MOTION_DURATION.entryGather * 0.5,
              ease: MOTION_EASE.standard,
            },
            MOTION_DURATION.entryGather * 0.34,
          )
          .to(
            flare,
            {
              scaleX: 1,
              opacity: 1,
              duration: MOTION_DURATION.entryGather * 0.42,
              ease: MOTION_EASE.expel,
            },
            MOTION_DURATION.entryGather * 0.55,
          )
          .to(
            heroSignal,
            {
              energy: 0.85,
              flare: 0.55,
              duration: MOTION_DURATION.entryGather,
              ease: MOTION_EASE.attract,
            },
            0,
          );

        // --- readiness: the first of three, never all three ----------------

        // 1. The scene: the renderer's canvas appearing inside the stage layer.
        const stage = document.querySelector('[data-gl]');
        if (stage) {
          if (stage.querySelector('canvas')) markReady();
          else {
            observer = new MutationObserver(() => {
              if (stage.querySelector('canvas')) markReady();
            });
            observer.observe(stage, { childList: true, subtree: true });
          }
        }

        // 2. A poster: the static representation the page can settle onto even
        //    when WebGL never arrives at all.
        const poster = document.querySelector<HTMLImageElement>('[data-project-poster]');
        if (poster) {
          if (poster.complete) markReady();
          else {
            poster.addEventListener('load', markReady, { once: true });
            poster.addEventListener('error', markReady, { once: true });
            detach.push(() => {
              poster.removeEventListener('load', markReady);
              poster.removeEventListener('error', markReady);
            });
          }
        }

        // 3. The deadline, placed so the expulsion still fits inside the
        //    absolute fail-safe instead of being cut off by it.
        timers.push(
          window.setTimeout(
            markReady,
            MOTION_DURATION.entryFailsafeMs - MOTION_DURATION.entryRelease * 1000,
          ),
        );
      }, overlay);
    } catch {
      // A thrown timeline is precisely the case the reader must not pay for.
      release();
    }

    return () => finish(false);
  }, [mode]);

  if (mode === 'static') return null;

  return (
    <S.Overlay ref={overlay} aria-hidden="true" data-entry-overlay>
      <S.Field>
        {FRAGMENTS.map((_, index) => (
          <S.Fragment key={index} data-entry-fragment />
        ))}
        <S.Flare data-entry-flare />
        <S.Core data-entry-core />
      </S.Field>
    </S.Overlay>
  );
}
