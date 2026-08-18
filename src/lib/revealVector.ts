import { getCore } from './gravityField';

/**
 * Where a revealed element enters from.
 *
 * Nothing on this site fades in. Fade is what you get when nobody chose a
 * direction; a mask reads as intent. And the direction is not styling either —
 * matter arrives from the singularity, so every element enters travelling away
 * from the core's projected position.
 *
 * `gravityField` already publishes that position every frame, for the letters,
 * the cursor and the starfield. This is a fourth reader of the same number
 * rather than a second opinion about where the object is. In sections the
 * object has left, the projection is still being written — presence changes
 * the veil and the scale, not whether the core has coordinates — so the vector
 * stays meaningful even where the object is invisible.
 */

export interface RevealVector {
  /** Unit vector pointing from the element toward the core. */
  ux: number;
  uy: number;
  /** Distance in CSS px, used to order the stagger. */
  dist: number;
  /** `clip-path` value that hides the element, opening from the core side. */
  clipFrom: string;
}

const CLIP_OPEN = 'inset(0% 0% 0% 0%)';

/** Reused: this runs per element on every ScrollTrigger fire. */
const out: RevealVector = { ux: 0, uy: 0, dist: 0, clipFrom: CLIP_OPEN };

export function revealVector(el: HTMLElement): RevealVector {
  const r = el.getBoundingClientRect();
  const core = getCore();
  const dx = core.x - (r.left + r.width / 2);
  const dy = core.y - (r.top + r.height / 2);
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  out.ux = dx / dist;
  out.uy = dy / dist;
  out.dist = dist;

  /**
   * The mask opens from the edge facing the core, so the element looks like it
   * is being drawn out of the object rather than wiped by an arbitrary rule.
   * Only the dominant axis is used: a diagonal inset reveals as a shrinking
   * rectangle, which reads as a box animating rather than as matter arriving.
   */
  if (Math.abs(dx) > Math.abs(dy)) {
    out.clipFrom = dx > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)';
  } else {
    out.clipFrom = dy > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)';
  }
  return out;
}

export { CLIP_OPEN };

/** How far an element is displaced toward the core before it travels out. */
export const REVEAL_TRAVEL_PX = 30;
