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

  useEffect(() => {
    const reduce = prefersReducedMotion();
    let lastTime = 0;

    const tick = (time: number) => {
      const now = time * 1000;
      const delta = lastTime ? now - lastTime : 16.67;
      lastTime = now;

      const lenis = lenisRef.current;
      frameCallbacks.current.forEach((cb) => cb(now, delta));
      lenis?.raf(now);
    };

    if (!reduce) {
      const lenis = new Lenis({
        duration: LENIS_OPTIONS.duration,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: LENIS_OPTIONS.wheelMultiplier,
        touchMultiplier: LENIS_OPTIONS.touchMultiplier,
      });
      lenisRef.current = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      setSmooth(true);
    }

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      lockCount.current = 0;
      setSmooth(false);
    };
  }, []);

  const scrollTo = useCallback((target: string | HTMLElement | number, duration = 1.5) => {
    const lenis = lenisRef.current;
    if (lenis) {
      // duration 0 means "be there now" — used by scroll restoration, which
      // must not animate the reader across the page on load.
      if (duration === 0) {
        lenis.resize();
        lenis.scrollTo(target, { immediate: true, force: true });
      }
      else lenis.scrollTo(target, { duration });
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
