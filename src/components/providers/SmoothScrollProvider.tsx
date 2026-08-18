import Lenis from 'lenis';
import { measureHorizon, timeDilation, updateHorizon } from '../../lib/horizon';
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
  const frameCallbacks = useRef(new Set<FrameCallback>());
  const [smooth, setSmooth] = useState(false);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    let lastTime = 0;

    const tick = (time: number) => {
      const now = time * 1000;
      const delta = lastTime ? now - lastTime : 16.67;
      lastTime = now;

      /**
       * Time dilation.
       *
       * Close to a large mass, time runs slower for the distant observer. The
       * site makes that literally true: Lenis's easing duration is stretched
       * as the reader falls toward CONTACT, so the scroll grows heavy and
       * resistant rather than staying uniformly light.
       *
       * Written here, on the one tick that already exists, and only when the
       * value has actually moved — Lenis reads `options.duration` per frame,
       * so this is a property write rather than a re-instantiation.
       */
      updateHorizon();
      const lenis = lenisRef.current;
      if (lenis) {
        const d = timeDilation();

        /**
         * Two knobs, because only one of them is actually weight.
         *
         * Measured: stretching `duration` alone moved the page 2520px per
         * gesture at the top and 2453px at 71% down — statistically the same
         * distance. Duration governs how long the eased animation takes to
         * settle, not how far the gesture carries, so on its own it produces
         * latency, which reads as a laggy site rather than as gravity.
         *
         * Resistance is `wheelMultiplier`: dividing it means the same flick
         * buys less ground, so approaching the horizon genuinely costs more
         * input. Duration still stretches on top of it — together they are
         * heavy and slow to settle, which is what mass feels like.
         */
        const nextDuration = LENIS_OPTIONS.duration * d;
        if (
          Math.abs((lenis.options.duration ?? LENIS_OPTIONS.duration) - nextDuration) >
          0.001
        ) {
          lenis.options.duration = nextDuration;
        }
        const nextWheel = LENIS_OPTIONS.wheelMultiplier / d;
        if (
          Math.abs(
            (lenis.options.wheelMultiplier ?? LENIS_OPTIONS.wheelMultiplier) - nextWheel,
          ) > 0.001
        ) {
          lenis.options.wheelMultiplier = nextWheel;
          lenis.options.touchMultiplier = LENIS_OPTIONS.touchMultiplier / d;
        }
      }

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

    /**
     * The document's scrollable extent is re-measured only when the layout is
     * known to have settled — never per frame. ScrollTrigger's own `refresh`
     * event is the exact moment the pin spacers have their final height, which
     * is what the extent is mostly made of.
     */
    measureHorizon();
    ScrollTrigger.addEventListener('refresh', measureHorizon);
    window.addEventListener('resize', measureHorizon);

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      ScrollTrigger.removeEventListener('refresh', measureHorizon);
      window.removeEventListener('resize', measureHorizon);
      gsap.ticker.remove(tick);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      setSmooth(false);
    };
  }, []);

  const scrollTo = useCallback((target: string | HTMLElement | number, duration = 1.5) => {
    const lenis = lenisRef.current;
    if (lenis) {
      // duration 0 means "be there now" — used by scroll restoration, which
      // must not animate the reader across the page on load.
      if (duration === 0) lenis.scrollTo(target, { immediate: true });
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

  const stop = useCallback(() => lenisRef.current?.stop(), []);
  const start = useCallback(() => lenisRef.current?.start(), []);

  const onFrame = useCallback((cb: FrameCallback) => {
    frameCallbacks.current.add(cb);
    return () => {
      frameCallbacks.current.delete(cb);
    };
  }, []);

  const api = useMemo<SmoothScrollApi>(
    () => ({ scrollTo, stop, start, onFrame, smooth }),
    [scrollTo, stop, start, onFrame, smooth],
  );

  return (
    <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>
  );
}
