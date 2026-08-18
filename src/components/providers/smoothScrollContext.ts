import { createContext } from 'react';

/**
 * The context and its shape, kept apart from the component that provides it.
 *
 * Fast Refresh can only swap a module when everything it exports is a
 * component. `SmoothScrollProvider.tsx` exported the provider *and* two hooks,
 * so every edit to the provider invalidated the hooks' identity and forced a
 * full reload — which on this site means re-running the whole intro
 * choreography to see a one-line change. The lint warning was reporting a real
 * cost, not a style preference.
 *
 * Splitting on the context rather than on the hooks is what keeps the cycle
 * out: the provider and the hooks both depend on this module, and neither
 * depends on the other.
 */

export type FrameCallback = (time: number, deltaMs: number) => void;

export interface SmoothScrollApi {
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

export const SmoothScrollContext = createContext<SmoothScrollApi>({
  scrollTo: noop,
  stop: noop,
  start: noop,
  onFrame: () => noop,
  smooth: false,
});
