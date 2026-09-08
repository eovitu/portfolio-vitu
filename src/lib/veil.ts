/**
 * The veil between the singularity and the copy.
 *
 * Its resting value is a pure function of scroll, but the intro has to be able
 * to override it: on a reload from an inner section the veil is already deep,
 * and the absorb phase would then play against a nearly black screen instead of
 * against the object doing the swallowing.
 *
 * The override is a plain number on a shared object so GSAP can tween it like
 * any other property. `-1` means "no override, follow the scroll".
 */

import { stageVeil } from './stagePresence';

export const veil = { override: -1 };

/**
 * Resting opacity for the current scroll position.
 *
 * Delegates to `lib/stagePresence`, which owns where the object is allowed to
 * be section by section. This used to be a pure function of scroll depth, and
 * that is precisely why every section below the hero shared one backdrop: a
 * monotonic curve cannot say "gone in SKILLS, back in CONTACT". Selected
 * Work's theater does not write this value; `stagePresence` is the sole
 * section-level authority.
 */
function veilForScroll(): number {
  return stageVeil();
}

/** What the veil should actually paint this frame. */
export function veilValue(): number {
  return veil.override >= 0 ? veil.override : veilForScroll();
}
