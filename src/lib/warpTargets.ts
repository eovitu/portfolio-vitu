/**
 * Shared geometry for everything the singularity can swallow.
 *
 * Two systems need the exact same answers: the snapshot taken on `pagehide`
 * (which decides what the next load has to reconstruct) and the intro timeline
 * (which decides what the real DOM does). Keeping the predicates in one place
 * is what makes the ghosts line up with the content they are impersonating.
 */

import { CAMERA, QUALITY, detectTier } from '../three/renderQuality';

/** Elements the singularity can swallow. Marked in the section markup. */
export const WARP = '[data-warp]';

/**
 * Drop any target that lives inside another target.
 *
 * Both would be given their own vector to the core, and the transforms
 * compose — the child would leave at roughly twice the distance and miss the
 * core entirely. The outermost marked block wins.
 */
export function dropNested(els: HTMLElement[]): HTMLElement[] {
  return els.filter((el) => !els.some((other) => other !== el && other.contains(el)));
}

/**
 * Only what the reader can actually see counts.
 *
 * Both axes matter: inside the pinned WORK chapter the panels are laid out on
 * a horizontal track, so a panel can be perfectly on-screen vertically while
 * sitting a full viewport to the left or right.
 */
export function isOnScreen(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return false;
  return (
    r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth
  );
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Where the singularity sits on screen, in pixels.
 *
 * The canvas is a fixed full-viewport layer, so the core is the viewport
 * centre shifted by the model's world-space framing offset — converted with
 * the camera's own frustum maths rather than a guessed pixel value.
 */
export function coreOrigin(): Point {
  const { frame } = QUALITY[detectTier()];
  const frustumHeight = 2 * CAMERA.distance * Math.tan((CAMERA.fov * Math.PI) / 360);
  const perUnit = window.innerHeight / frustumHeight;
  return {
    x: window.innerWidth / 2 + frame.x * perUnit,
    y: window.innerHeight / 2 - frame.y * perUnit,
  };
}

/** Vector from an element's centre to the core, scaled by `reach`. */
export function offsetToCore(el: HTMLElement, origin: Point, reach: number): Point {
  const rect = el.getBoundingClientRect();
  return {
    x: (origin.x - (rect.left + rect.width / 2)) * reach,
    y: (origin.y - (rect.top + rect.height / 2)) * reach,
  };
}
