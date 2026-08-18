/**
 * Motion constants. Every duration / stagger / ease below is transcribed from
 * the approved handoff timeline so the rhythm of the prototype is preserved.
 */

export const EASE = 'expo.out';
export const EASE_SOFT = 'power3.out';
export const EASE_CSS = 'cubic-bezier(.16, 1, .3, 1)';

/** Hero entrance — absolute positions on the master timeline (seconds). */
export const HERO = {
  nav: { at: 0.15, duration: 1.1 },
  meta: { at: 0.2, duration: 1.1, stagger: 0.08 },
  canvas: { at: 0.1, duration: 1.6, ease: 'power2.out' },
  navItems: { at: 0.55, duration: 0.9, stagger: 0.07 },
  lines: { at: 1.45, duration: 1.2, stagger: 0.085 },
} as const;

/**
 * The singularity intro.
 *
 * Concept: the letters and the black hole are one phenomenon. On a first load
 * the name is *expelled* from the core; on a reload the name is first pulled
 * back *into* it, the core holds alone for a beat, then expels it again.
 *
 * `pull` / `spread` are the fraction of the distance to the core the letters
 * actually travel — at 1.0 they stack exactly on the singularity, which reads
 * as a collapse to a point rather than as matter being drawn in, so they stop
 * just short of it.
 */
export const INTRO = {
  absorb: {
    /**
     * The name is held legible for a beat before gravity claims it — without
     * that pause there is nothing to *watch* being pulled in.
     */
    at: 0.55,
    duration: 1.05,
    stagger: 0.052,
    ease: 'power3.in',
    pull: 0.9,
    scale: 0.26,
  },
  /**
   * How long the expulsion starts BEFORE the absorption has finished emptying
   * the screen.
   *
   * There used to be a `hold` here — a beat with the core alone. On paper it
   * was the drama of the swallow; on screen it was a dead black frame, because
   * by then every element was already at `opacity: 0`. The two phases now
   * overlap: the first matter is thrown clear while the last is still falling
   * in, so something is always in flight.
   */
  overlap: 0.52,
  /** The veil retracts for the intro and returns once control is handed back. */
  veil: { clear: 0.45, restore: 0.7 },
  expel: {
    duration: 1.55,
    stagger: 0.068,
    ease: 'expo.out',
    spread: 0.9,
    scale: 0.32,
    /** Letters arrive with a whisper of rotation, then settle square. */
    tilt: 5,
  },
  /**
   * The staged reload — ghosts of the previous screen falling into the core
   * while the camera travels back to the hero.
   *
   * HARD CEILING: `ceiling` seconds from the first useful frame to the end of
   * the expulsion. Past that the sequence stops being an transition and starts
   * being a cutscene the reader has to sit through on every refresh. When the
   * arithmetic does not fit, the expel stagger is compressed — no phase is
   * ever dropped.
   */
  reload: {
    ceiling: 3.2,
    /** Aim under the ceiling so a slow frame cannot push us over it. */
    target: 3.05,
    /** Camera: the travel from the old section back up to the hero. */
    travel: { at: 0, duration: 1.1, ease: 'power2.inOut' },
    /** Each ghost fragment's fall. Accelerating in, never easing out. */
    fall: {
      duration: 0.6,
      ease: 'power3.in',
      /** Total spread of the start times, farthest fragment first. */
      spread: 0.5,
      /** Sideways bow of the trajectory, as a fraction of the flight length. */
      curve: 0.28,
      scale: 0.12,
      spin: 26,
    },
    /** The core holds what it has taken before giving it back. */
    possession: 0.25,
    /**
     * The reload expulsion is its own, shorter beat than the first visit's.
     * A first visit has the whole stage to itself; here the sequence has
     * already spent a second travelling, and the reader is refreshing, not
     * arriving.
     */
    expel: { duration: 1.1, stagger: 0.05 },
  },
  /** Shape of the energy the core injects into the 3D on each phase. */
  signal: {
    absorb: { energy: 0.85, swell: -0.06, flare: 0.55 },
    expel: { energy: 1, swell: 0.09, flare: 1 },
    settle: 1.7,
  },
} as const;

/**
 * Scroll reveal presets — `data-reveal` kinds from the design source.
 *
 * `y: 0` is declared alongside every `yPercent` on purpose. GSAP writes a
 * percentage translate to the DOM in pixels; if the tween is ever re-parsed
 * (ScrollTrigger invalidates non-scrubbed tweens on refresh) those pixels come
 * back as `y`, and the element ends up permanently offset even though
 * `yPercent` reached 0. Pinning `y` keeps the two components unambiguous.
 */
/**
 * Reveal presets.
 *
 * `soft` used to be `{ y: 34, opacity: 0 }`. Opacity is gone from every
 * entrance on the site: a fade is the absence of a decision, and a mask reads
 * as one. What replaces it is a clip-path wipe opening from the edge that
 * faces the core, plus a short travel outward along that same vector — see
 * lib/revealVector for why the direction is derived rather than chosen.
 *
 * `line` and `slow` were already masks (a translate inside an overflow clip)
 * and are unchanged; they are what the rest of the site now matches.
 */
export const REVEAL = {
  line: {
    from: { yPercent: 115, y: 0 },
    to: { yPercent: 0, y: 0 },
    duration: 1.1,
    stagger: 0.07,
  },
  soft: {
    from: { yPercent: 0, y: 0 },
    to: { yPercent: 0, y: 0 },
    duration: 1.05,
    stagger: 0.075,
  },
  slow: {
    from: { yPercent: 120, y: 0 },
    to: { yPercent: 0, y: 0 },
    duration: 1.6,
    stagger: 0.14,
  },
} as const;

/**
 * Media entrance: the frame wipes open while the picture settles out of an
 * overscale. It is half of the "camera settling" feeling the reference has,
 * and it costs one transform and one clip-path.
 */
export const MEDIA_REVEAL = {
  scaleFrom: 1.07,
  duration: 1.5,
  ease: 'expo.out',
} as const;

/** How much slower the content inside a media frame moves than the frame. */
export const MEDIA_PARALLAX = 0.14;

export type RevealKind = keyof typeof REVEAL;

/** Project panel entrance inside the pinned horizontal chapter. */
export const PANEL = {
  /**
   * No opacity. The panel items sit inside overflow clips, so a translate is
   * already a mask — carrying a fade alongside it was the one place in the
   * chapter where an element appeared instead of arriving.
   */
  itemsFrom: { yPercent: 60, y: 0 },
  itemsTo: { yPercent: 0, y: 0 },
  itemsDuration: 0.5,
  itemsStagger: 0.05,
  /**
   * How long before a panel is centred its entrance begins, in panel-units
   * (1 unit === one full panel of travel).
   *
   * This MUST be >= 1: panel `i` starts entering the viewport exactly one unit
   * before it is centred. The prototype used 0.55, which is when its *text*
   * column arrives — so the panel's right half sat on screen as a large empty
   * black column for half a panel of scrolling. That is the "black gap where
   * PROJECT 03 should have been". At 1.0 the reveal starts the instant the
   * panel's leading edge appears, and finishes at ~0.3 units — well composed
   * before it reaches the centre.
   */
  leadIn: 1,
  mediaDuration: 0.55,
  mediaDelay: 0.08,
  /**
   * Overscale on entry, settling to 1. Was 1.16, which reads as a zoom effect;
   * the brief for this pass is a camera settling, and that lives at 1.06-1.08.
   */
  imageScale: 1.08,
  imageParallax: 4,
  /**
   * Counter-drift against the track, in percent of the element's own width.
   *
   * The numeral is scenery and moves least, so one is always leaving while the
   * next arrives; the title lags less, which reads as it holding position
   * while its own copy slides out from under it.
   */
  ghostDrift: 26,
  titleLag: 9,
} as const;

export const LENIS_OPTIONS = {
  duration: 1.15,
  wheelMultiplier: 1.05,
  touchMultiplier: 1.6,
} as const;

/** Scroll-velocity skew, clamped exactly as in the design source. */
/**
 * Scroll velocity as a global input.
 *
 * The old values (factor .045, clamp 3deg) were below the threshold of
 * perception — the effect existed in the code and not on the screen. These are
 * calibrated to be felt during a fast flick and to leave text readable: past
 * roughly 7deg the baselines of a paragraph stop lining up and the copy turns
 * into a smear, so the clamp is the legibility budget rather than a taste.
 *
 * `stretch` is the vertical scale that rides along with the skew: matter under
 * acceleration deforms, and shear alone reads as a slide.
 */
export const SKEW = {
  factor: 0.115,
  clamp: 6.5,
  duration: 0.62,
  stretch: 0.0011,
  stretchClamp: 0.06,
} as const;

export const CURSOR = { lerp: 0.16, size: 10, hoverScale: 3.4 } as const;
