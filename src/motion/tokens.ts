/**
 * The timing palette, transcribed from the approved spec.
 *
 * One vocabulary for every authored motion on the site, named by intent rather
 * than by number: a reader changing "how fast the hero settles" should not have
 * to know that 1.5 was also the number three unrelated tweens happened to use.
 *
 * Durations are seconds because GSAP is the consumer. The one exception carries
 * an `Ms` suffix: `entryFailsafeMs` is handed to `setTimeout`, and converting it
 * at every call site is how a fail-safe silently becomes 2.2 milliseconds.
 */

export const MOTION_DURATION = {
  /** 120-180 ms — press, release, focus. Below the threshold of feeling slow. */
  quick: 0.15,
  /** 280-450 ms — the ordinary on-screen change. */
  standard: 0.36,
  /** 650-1100 ms — a composed move that the reader is meant to watch. */
  slow: 0.88,

  /**
   * First entry, 1200-1800 ms, split into the two phases the spec describes:
   * matter gathering, then the expulsion that hands the screen over.
   */
  entryGather: 0.9,
  entryRelease: 0.5,
  /** Repeat entry, 250-450 ms: a pulse, not a sequence. */
  entryRepeat: 0.35,
  /**
   * The absolute ceiling on the entry, in milliseconds.
   *
   * Not a target and not a budget: a hard stop. WebGL failing, the lazy chunk
   * never resolving, a throttled background tab, a thrown effect — past this
   * point the interface is released regardless of what did or did not become
   * ready, because a reader must never be held behind a loader that is waiting
   * for something that is not coming.
   */
  entryFailsafeMs: 2200,

  /** Home to case, 900-1200 ms. Consumed by the Route Transition Director. */
  routeHomeToCase: 1.05,
  /** Case to case, 650-900 ms: shorter, the reader is already inside. */
  routeCaseToCase: 0.78,
} as const;

export const MOTION_EASE = {
  /** The main on-screen curve: fast departure, long settle. */
  standard: 'power3.out',
  /** Attraction accelerates inward — gravity does not ease out. */
  attract: 'power3.in',
  /** Expulsion decelerates outward. */
  expel: 'expo.out',
  /** Scrubbed motion is linear: the scroll is the easing. */
  scrub: 'none',
} as const;

export const MOTION_STAGGER = {
  /** Glyph-level: tight enough to read as one word arriving. */
  glyph: 0.028,
  /** Word and line level. */
  word: 0.07,
  /** Independent blocks — navigation items, actions. */
  block: 0.06,
} as const;
