import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { SKEW } from '../lib/motion';
import { useAnimationFrame } from '../components/providers/SmoothScrollProvider';
import { useReducedMotion } from '../hooks/useReducedMotion';

const SELECTOR = '[data-skew]';

/**
 * Scroll velocity → a barely-there skew on a handful of large headlines.
 * It is what makes fast scrolling feel physical. Velocity is derived from the
 * shared frame loop, so there is no extra scroll listener and no React state.
 */
export function useScrollSkew(): void {
  const setters = useRef<Array<(value: number) => void>>([]);
  const lastY = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    setters.current = targets.map((el) =>
      gsap.quickTo(el, 'skewY', { duration: SKEW.duration, ease: 'power3.out' }),
    );
    lastY.current = window.scrollY;
    return () => {
      gsap.set(targets, { skewY: 0 });
      setters.current = [];
    };
  }, [reduced]);

  useAnimationFrame(() => {
    const y = window.scrollY;
    const velocity = y - lastY.current;
    lastY.current = y;
    const value = gsap.utils.clamp(-SKEW.clamp, SKEW.clamp, velocity * SKEW.factor);
    setters.current.forEach((set) => set(value));
  }, !reduced);
}
