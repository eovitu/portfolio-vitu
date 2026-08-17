/**
 * The veil between the singularity and the copy.
 *
 * Its resting value is a pure function of scroll — but the intro has to be able
 * to override it: on a reload from an inner section the veil is already deep,
 * and the absorb phase would then play against a nearly black screen instead of
 * against the object doing the swallowing.
 *
 * The override is a plain number on a shared object so GSAP can tween it like
 * any other property. `-1` means "no override, follow the scroll".
 */

import { stageVeil } from './stagePresence';

/**
 * How dark the veil gets once the hero is behind the reader.
 *
 * Raised from the handoff's 0.62. At that value the object was still fully
 * legible behind body copy — measured on screen it sat at full scale in the
 * centre of the SKILLS list and behind the WORK panels, competing with the
 * titles rather than receding. 0.62 was tuned when the object was smaller and
 * off to one side; the hero recomposition moved it toward the middle of the
 * frame, and the veil had to follow.
 */
export const VEIL_MAX = 0.88;

export const veil = { override: -1 };

/**
 * Extra depth contributed by the WORK chapter, 0 → 1 across the track.
 *
 * The object is supposed to recede as the reader moves outward through the
 * three orbits. Before this it did the opposite: the scroll term plateaus at
 * `VEIL_MAX` as soon as the hero is behind, so the object sat at identical,
 * full presence behind all three panels — which made it *more* prominent
 * against project 03's near-empty field than it was in the hero it belongs to.
 *
 * Written by `useHorizontalScroll` from the same scrubbed timeline that moves
 * the track, so veil and panel can never disagree about which orbit is on
 * screen.
 */
const track = { progress: 0, active: false };

export function setTrackProgress(progress: number, active: boolean): void {
  track.progress = progress;
  track.active = active;
}

/** How much deeper the veil goes by the far orbit. */
export const VEIL_ORBIT_RANGE = 0.26;

/**
 * Resting opacity for the current scroll position.
 *
 * Delegates to `lib/stagePresence`, which owns where the object is allowed to
 * be section by section. This used to be a pure function of scroll depth, and
 * that is precisely why every section below the hero shared one backdrop: a
 * monotonic curve cannot say "gone in SKILLS, back in CONTACT".
 */
export function veilForScroll(): number {
  return stageVeil();
}

/** What the veil should actually paint this frame. */
export function veilValue(): number {
  return veil.override >= 0 ? veil.override : veilForScroll();
}
