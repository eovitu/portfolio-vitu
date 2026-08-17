export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Synchronous read — safe to call during render on the client. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
