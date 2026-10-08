import Lenis from 'lenis';
/* eslint-disable react-refresh/only-export-components -- context hooks intentionally share the provider module */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/prefersReducedMotion';
import { LENIS_OPTIONS } from '../../lib/motion';
import {
  crossedBoundary,
  canReleaseBoundary,
  GESTURE_GAP_MS,
  colorBoundaryTargets,
} from '../../motion/scrollSettle';
import { resolveChapterBoundary } from '../../motion/chapterTarget';
import { observeScrollGeometry } from '../../motion/scrollGeometry';

/**
 * THE frame loop of the application.
 *
 *   Lenis → GSAP ticker → ScrollTrigger → animations → (R3F advance)
 *
 * Exactly one Lenis instance, exactly one requestAnimationFrame (GSAP's
 * ticker), exactly one scroll listener. Anything that needs a per-frame
 * callback subscribes here instead of starting its own loop.
 */

type FrameCallback = (time: number, deltaMs: number) => void;

interface SmoothScrollApi {
  /** Scroll to an element or offset, respecting Lenis (never window.scrollTo). */
  scrollTo: (target: string | HTMLElement | number, duration?: number) => void;
  /** Jump without interpolation. Used after an occluded route swap. */
  scrollToImmediate: (target: string | HTMLElement | number) => void;
  /** Lock the page scroll (used by the chat panel) without layout shift. */
  stop: () => void;
  start: () => void;
  /** Subscribe to the single shared frame loop. Returns an unsubscribe fn. */
  onFrame: (cb: FrameCallback) => () => void;
  /** True once Lenis is running (false under reduced motion). */
  smooth: boolean;
}

const noop = () => {};

const SmoothScrollContext = createContext<SmoothScrollApi>({
  scrollTo: noop,
  scrollToImmediate: noop,
  stop: noop,
  start: noop,
  onFrame: () => noop,
  smooth: false,
});

export function useSmoothScroll(): SmoothScrollApi {
  return useContext(SmoothScrollContext);
}

/** Subscribe a callback to the shared frame loop for the component's lifetime. */
export function useAnimationFrame(cb: FrameCallback, enabled = true): void {
  const { onFrame } = useSmoothScroll();
  const ref = useRef(cb);
  ref.current = cb;

  useEffect(() => {
    if (!enabled) return;
    return onFrame((t, dt) => ref.current(t, dt));
  }, [onFrame, enabled]);
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const lockCount = useRef(0);
  const frameCallbacks = useRef(new Set<FrameCallback>());
  const [smooth, setSmooth] = useState(false);
  const settleSuppressedUntil = useRef(0);
  const cancelSettle = useRef<(() => void) | null>(null);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    let lastTime = 0;
    let cleanupSettle: (() => void) | undefined;

    const tick = (time: number) => {
      const now = time * 1000;
      const delta = lastTime ? now - lastTime : 16.67;
      lastTime = now;

      const lenis = lenisRef.current;
      frameCallbacks.current.forEach((cb) => cb(now, delta));
      lenis?.raf(now);
    };

    if (!reduce) {
      let heldBoundary: number | null = null;
      let heldAt = 0;
      let lastWheel = -Infinity;
      let wheelActive = false;
      let previousScroll = window.scrollY;
      const blocked = () =>
        prefersReducedMotion() ||
        lockCount.current > 0 ||
        performance.now() < settleSuppressedUntil.current ||
        !!document.documentElement.dataset.transitionPhase ||
        !!document.querySelector('[role="dialog"][aria-modal="true"], dialog[open]');
      const lenis = new Lenis({
        virtualScroll: ({ event }) => {
          if (event.type === 'touchmove') {
            if (blocked()) {
              heldBoundary = null;
              wheelActive = false;
              return true;
            }
            if (heldBoundary !== null) {
              event.preventDefault();
              return false;
            }
            return true;
          }
          if (event.type !== 'wheel') return true;
          // Trackpad pinch arrives as ctrl-wheel; let Lenis preserve native zoom.
          if (event.ctrlKey) {
            heldBoundary = null;
            wheelActive = false;
            lastWheel = -Infinity;
            return true;
          }
          const now = performance.now();
          const newGesture = now - lastWheel >= GESTURE_GAP_MS;
          lastWheel = now;
          if (blocked()) {
            heldBoundary = null;
            wheelActive = false;
            return true;
          }
          wheelActive = true;
          if (heldBoundary === null) return true;
          if (canReleaseBoundary({ now, heldAt, newGesture })) {
            heldBoundary = null;
            return true;
          }
          event.preventDefault();
          return false;
        },
        duration: LENIS_OPTIONS.duration,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: LENIS_OPTIONS.wheelMultiplier,
        touchMultiplier: LENIS_OPTIONS.touchMultiplier,
      });
      lenisRef.current = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      const cancel = () => {
        heldBoundary = null;
        wheelActive = false;
        lastWheel = -Infinity;
        previousScroll = lenis.scroll;
      };
      const cleanupGeometry = observeScrollGeometry(cancel);
      cancelSettle.current = cancel;
      const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      reducedQuery.addEventListener('change', cancel);
      const click = (event: Event) => {
        cancel();
        if ((event.target as Element | null)?.closest('a, button, input, textarea, select'))
          settleSuppressedUntil.current = performance.now() + 2000;
      };
      const layoutTop = (element: HTMLElement) => {
        let top = 0;
        for (
          let node: HTMLElement | null = element;
          node;
          node = node.offsetParent as HTMLElement | null
        )
          top += node.offsetTop;
        return top;
      };
      let previousLimit = lenis.limit;
      let previousViewportHeight = window.innerHeight;
      const observeBoundary = () => {
        const current = lenis.scroll;
        // Lenis can emit its resize scroll before our window/observer callback.
        if (
          previousLimit !== lenis.limit ||
          previousViewportHeight !== window.innerHeight
        ) {
          previousLimit = lenis.limit;
          previousViewportHeight = window.innerHeight;
          cancel();
        }
        if (heldBoundary !== null && !blocked() && Math.abs(current - heldBoundary) > 0.5) {
          lenis.scrollTo(heldBoundary, { immediate: true });
          return;
        }
        if (!wheelActive || blocked() || heldBoundary !== null) {
          previousScroll = current;
          return;
        }
        const edges = Array.from(
          document.querySelectorAll<HTMLElement>('[data-scroll-boundary]'),
        ).flatMap((element) => [
          layoutTop(element),
          layoutTop(element) + element.offsetHeight,
        ]);
        const stickyEdges: number[] = [];
        document
          .querySelectorAll<HTMLElement>('[data-theater-chapter]')
          .forEach((chapter) => {
            const run = chapter.closest<HTMLElement>('[data-theater-run]');
            if (run?.dataset.enhanced === 'true') {
              const chapters = run.querySelectorAll('[data-theater-chapter]');
              if (chapter === chapters[0]) edges.push(layoutTop(run));
              else stickyEdges.push(resolveChapterBoundary(chapter));
              // The last color leaves the sticky stage at bottom-bottom.
              if (chapter === chapters[chapters.length - 1])
                edges.push(layoutTop(run) + run.offsetHeight);
            } else {
              edges.push(layoutTop(chapter), layoutTop(chapter) + chapter.offsetHeight);
            }
          });
        const targets = colorBoundaryTargets({
          edges,
          stickyEdges,
          forward: current > previousScroll,
          viewportHeight: window.innerHeight,
          maxScroll: lenis.limit,
        });
        const target = crossedBoundary({
          from: previousScroll,
          to: current,
          targets,
          reduced: false,
          blocked: false,
        });
        previousScroll = current;
        if (target === null) return;
        heldBoundary = target;
        heldAt = performance.now();
        previousScroll = target;
        lenis.scrollTo(target, { immediate: true });
      };
      lenis.on('scroll', observeBoundary);
      window.addEventListener('keydown', cancel);
      const touchStart = () => {
        if (
          heldBoundary !== null &&
          !canReleaseBoundary({ now: performance.now(), heldAt, newGesture: true })
        )
          return;
        cancel();
        wheelActive = true;
      };
      window.addEventListener('touchstart', touchStart, { passive: true });
      const pointerDown = (event: PointerEvent) => {
        if (event.pointerType !== 'touch') cancel();
      };
      window.addEventListener('pointerdown', pointerDown, { passive: true });
      window.addEventListener('click', click, true);
      cleanupSettle = () => {
        cleanupGeometry();
        cancelSettle.current = null;
        reducedQuery.removeEventListener('change', cancel);
        lenis.off('scroll', observeBoundary);
        window.removeEventListener('keydown', cancel);
        window.removeEventListener('touchstart', touchStart);
        window.removeEventListener('pointerdown', pointerDown);
        window.removeEventListener('click', click, true);
      };
      setSmooth(true);
    }

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      cleanupSettle?.();
      gsap.ticker.remove(tick);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      lockCount.current = 0;
      setSmooth(false);
    };
  }, []);

  const scrollTo = useCallback((target: string | HTMLElement | number, duration = 1.5) => {
    cancelSettle.current?.();
    settleSuppressedUntil.current =
      performance.now() + Math.max(2000, duration * 1000 + 400);
    const element =
      typeof target === 'string'
        ? document.querySelector<HTMLElement>(target)
        : typeof target === 'number'
          ? null
          : target;
    if (element) {
      // Route entrance transforms change visual rectangles, not document flow.
      // Measure layout offsets so a case-to-section link lands at the same point
      // before and after that entrance settles.
      let top = 0;
      let node: HTMLElement | null = element;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      target = Math.max(
        0,
        top - (parseFloat(getComputedStyle(element).scrollMarginTop) || 0),
      );
    }
    const lenis = lenisRef.current;
    if (lenis) {
      // duration 0 means "be there now", used by scroll restoration, which
      // must not animate the reader across the page on load.
      if (duration === 0) {
        lenis.resize();
        lenis.scrollTo(target, { immediate: true, force: true });
      } else {
        // A menu link fires before the dialog effect releases its scroll lock.
        // Explicit navigation must survive that same-event handoff.
        lenis.resize();
        lenis.scrollTo(target, { duration, force: true });
      }
      return;
    }
    // Reduced motion: no Lenis instance exists, so nothing can be fought with.
    if (typeof target === 'number') {
      window.scrollTo(0, target);
      return;
    }
    const el =
      typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    el?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, []);

  const scrollToImmediate = useCallback(
    (target: string | HTMLElement | number) => scrollTo(target, 0),
    [scrollTo],
  );

  const stop = useCallback(() => {
    cancelSettle.current?.();
    lockCount.current += 1;
    if (lockCount.current === 1) lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (lockCount.current === 0) return;
    lockCount.current -= 1;
    if (lockCount.current === 0) lenisRef.current?.start();
  }, []);

  const onFrame = useCallback((cb: FrameCallback) => {
    frameCallbacks.current.add(cb);
    return () => {
      frameCallbacks.current.delete(cb);
    };
  }, []);

  const api = useMemo<SmoothScrollApi>(
    () => ({ scrollTo, scrollToImmediate, stop, start, onFrame, smooth }),
    [scrollTo, scrollToImmediate, stop, start, onFrame, smooth],
  );

  return (
    <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>
  );
}
