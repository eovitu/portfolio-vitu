/**
 * Distance to the horizon, as one number the whole site agrees on.
 *
 * The HUD, the scroll's time dilation and the global redshift are three
 * expressions of the same physical claim — the reader is falling toward
 * something — so they read one source rather than each deriving progress from
 * scroll on its own and drifting apart by a frame or a rounding.
 *
 * `progress` is 0 at the top of the document and 1 at the end of CONTACT.
 */

const state = { progress: 0, dilation: 1 };

/**
 * How much slower time runs at the bottom, as a multiplier on Lenis's
 * duration. The direction's ceiling is ~2.5x: past that the page stops reading
 * as heavy and starts reading as broken.
 */
export const DILATION_MAX = 2.35;

/** Smooth, so the weight arrives gradually instead of stepping. */
const ease = (t: number) => t * t * (3 - 2 * t);

export function updateHorizon(): void {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  state.progress = p;
  /**
   * Deliberately weighted to the last third. A linear ramp makes the whole
   * page feel sluggish, which reads as a bad scroll implementation rather than
   * as gravity; concentrating it near the horizon means the reader only feels
   * the drag where the site is claiming it should exist.
   */
  state.dilation = 1 + ease(Math.max(0, (p - 0.35) / 0.65)) * (DILATION_MAX - 1);
}

export function horizonProgress(): number {
  return state.progress;
}

/** 1 at the top, up to DILATION_MAX at the horizon. */
export function timeDilation(): number {
  return state.dilation;
}

/** Distance readout in Schwarzschild radii, shared with the HUD. */
export const START_RS = 12;

export function horizonRs(): number {
  return START_RS * (1 - state.progress);
}
