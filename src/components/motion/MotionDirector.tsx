/* eslint-disable react-refresh/only-export-components -- the context hook intentionally ships with its provider */
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
import { gsap } from '../../lib/gsap';
import { SKEW } from '../../lib/motion';
import { prefersReducedMotion } from '../../lib/prefersReducedMotion';
import { sceneSignals } from '../../motion/sceneSignals';
import {
  currentVisitStorage,
  readVisitSeen,
  visitMode,
  type VisitMode,
} from '../../motion/visitState';
import { useRouteTransition } from '../routing/RouteTransitionProvider';
import { useAnimationFrame } from '../providers/SmoothScrollProvider';
import { EntrySequence } from './EntrySequence';

/**
 * The Motion Director.
 *
 * It owns page-level choreography — never component content. Concretely: which
 * entry the reader gets, the entry layer's lifecycle, the hand-off that lets
 * the hero take over, and the one scroll-velocity sample the whole site shares.
 *
 * It creates no frame loop of its own. Everything advances from the single
 * Lenis → GSAP ticker exposed by `SmoothScrollProvider`, and continuous values
 * are written into the mutable signal store rather than into React state, so
 * the frame path neither re-renders nor allocates.
 *
 * The velocity sampler used to be `hooks/useScrollSkew`. It was folded in here
 * because this component has to sample the same number anyway to feed the
 * scene, and two samplers of one value is how they drift apart.
 */

interface MotionState {
  /** Frozen at mount: the entry a reader gets does not change under them. */
  mode: VisitMode;
  /**
   * The expulsion has begun. This is the hero's cue — its entrance runs
   * against the entry layer clearing, not after it, so the composition is
   * arrived at rather than cut to.
   */
  revealing: boolean;
  /** True once the entry layer is gone and the interface is fully released. */
  released: boolean;
}

const MotionContext = createContext<MotionState>({
  mode: 'static',
  revealing: true,
  released: true,
});

export function useMotionState(): MotionState {
  return useContext(MotionContext);
}

export function MotionDirector({ children }: { children: ReactNode }) {
  const { route } = useRouteTransition();
  const [mode] = useState<VisitMode>(() =>
    visitMode({
      seen: readVisitSeen(currentVisitStorage()),
      reduced: prefersReducedMotion(),
    }),
  );
  const [revealing, setRevealing] = useState(false);
  const [released, setReleased] = useState(false);
  const onReveal = useCallback(() => setRevealing(true), []);
  const onRelease = useCallback(() => setReleased(true), []);

  const reduced = mode === 'static';
  const skewSetters = useRef<Array<(value: number) => void>>([]);
  const lastScrollY = useRef(0);

  /**
   * Scroll-linked tension on the headlines that opt in with `data-skew`.
   *
   * Re-bound per route because the elements themselves are replaced when the
   * route content swaps, and a `quickTo` setter pointing at a detached node is
   * a silent no-op rather than an error.
   */
  useEffect(() => {
    if (reduced) return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-skew]'));
    skewSetters.current = targets.map((el) =>
      gsap.quickTo(el, 'skewY', { duration: SKEW.duration, ease: 'power3.out' }),
    );
    lastScrollY.current = window.scrollY;
    return () => {
      gsap.set(targets, { skewY: 0, clearProps: 'transform' });
      skewSetters.current = [];
    };
  }, [reduced, route]);

  useAnimationFrame(() => {
    const y = window.scrollY;
    const velocity = y - lastScrollY.current;
    lastScrollY.current = y;
    // Written in place on the shared record: no object literal per frame.
    sceneSignals.velocity = velocity;

    const skew = gsap.utils.clamp(-SKEW.clamp, SKEW.clamp, velocity * SKEW.factor);
    const setters = skewSetters.current;
    for (let index = 0; index < setters.length; index += 1) setters[index](skew);
  }, !reduced);

  const value = useMemo<MotionState>(
    () => ({ mode, revealing, released }),
    [mode, revealing, released],
  );

  return (
    <MotionContext.Provider value={value}>
      {children}
      {!released && <EntrySequence mode={mode} onReveal={onReveal} onRelease={onRelease} />}
    </MotionContext.Provider>
  );
}
