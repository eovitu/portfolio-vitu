/**
 * One-way channel between the hero intro timeline (DOM/GSAP) and the 3D scene.
 *
 * It is a plain mutable object on purpose: GSAP tweens its numbers and the
 * render loop reads them each frame. No React state, no re-renders, no events
 * — the two systems stay decoupled and nothing is allocated per frame.
 */
export interface HeroSignal {
  /** 0 → 1 burst of angular energy (spin + disc acceleration). */
  energy: number;
  /** Extra uniform scale added to the model, e.g. the gravity swell. */
  swell: number;
  /** Core light gain, used to flare the singularity on absorb/expel. */
  flare: number;
}

export const heroSignal: HeroSignal = {
  energy: 0,
  swell: 0,
  flare: 0,
};

/** Restore the rest state (used when the intro is skipped or reverted). */
export function resetHeroSignal(): void {
  heroSignal.energy = 0;
  heroSignal.swell = 0;
  heroSignal.flare = 0;
}
