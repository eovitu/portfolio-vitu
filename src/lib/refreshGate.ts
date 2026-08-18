/**
 * One place that decides *when* the page is allowed to re-measure itself.
 *
 * `ScrollTrigger.refresh()` re-runs every trigger's `start`/`end`. For most of
 * the site that is free, because those are fixed offsets. The WORK chapter is
 * the exception: its `end` is a function of the track's measured overflow, so
 * a refresh recomputes the pin's total length. Do that while the reader is
 * *inside* the pin and the same `scrollY` maps to a different scrub progress
 * than it did on the previous frame — the panel jumps, and the document height
 * changes under `lib/horizon` at the same instant, so the HUD's distance
 * readout jumps with it.
 *
 * Several unrelated modules ask for a refresh (a debounced resize, sections
 * registering their own triggers on mount, web fonts settling), and none of
 * them has any way of knowing whether the reader is mid-chapter right now.
 * So the decision moves here.
 *
 * This is a gate, not a debounce. Nothing is dropped: a refresh requested
 * while a guard is up is remembered and runs once the guards are down *and*
 * the page has stopped moving — see the note on the release below, which is
 * where the first version of this gate still left the defect. Several requests during one guarded window collapse into a single
 * refresh, which is also what stops the cascade — a refresh changes layout,
 * which triggers the next refresh, which is what turns one jump into the
 * several the reader actually sees.
 */

import { ScrollTrigger } from './gsap';
import { recordRefresh } from './scrollDebug';

/**
 * Named rather than counted. A guard is a *state* ("the WORK pin is engaged"),
 * not an event, and the same state can be asserted twice — ScrollTrigger fires
 * `onEnter` and `onEnterBack` for the same pin — so balancing increments would
 * be one missed callback away from a gate that never opens again.
 */
const guards = new Set<string>();

let pending: false | string = false;

/**
 * The gate had a hole, and it was the release.
 *
 * A guard is cleared from `onLeave` — the frame the reader crosses out of the
 * WORK pin — and the held refresh used to run *right there*, synchronously,
 * inside ScrollTrigger's own callback, while the gesture was still in flight.
 * That is the same forbidden moment the gate exists to avoid, moved a few
 * pixels later: `invalidateOnRefresh` re-evaluates the pin's `end`, the pin
 * spacer is rewritten, the document's height changes, and `lib/horizon`
 * re-measures its extent on the very same `refresh` event. Progress is
 * `scrollY / extent`, so a denominator that moves mid-gesture makes the HUD's
 * distance read *further from* the horizon than it did a frame earlier, while
 * the reader has been scrolling steadily toward it.
 *
 * So a release is no longer an event, it is a condition: the page re-measures
 * itself when the reader has actually stopped moving. Scroll activity is
 * reported here once per frame by the scroll provider, and a held refresh
 * waits for a quiet window before it runs.
 */
const QUIET_MS = 220;

/** Timestamp of the last frame on which the page was observed moving. */
let lastMotionAt = 0;
let waiting = false;
/** Last position seen, so motion is detected without a scroll listener. */
let lastY = -1;

/**
 * Called once per frame by the scroll provider with the current position.
 *
 * The provider owns the only frame loop in the application, so this is the one
 * place that can see motion without installing a second listener.
 */
export function noteScrollPosition(y: number): void {
  if (y !== lastY) {
    lastY = y;
    lastMotionAt = performance.now();
  }
  if (waiting) tryRelease();
}

function tryRelease(): void {
  if (!pending || guards.size > 0) return;
  if (performance.now() - lastMotionAt < QUIET_MS) return;
  waiting = false;
  const by = pending;
  pending = false;
  recordRefresh(`released:${by}`, false, () => ScrollTrigger.refresh());
}

/** Raise or clear a named guard. Idempotent in both directions. */
export function setRefreshGuard(name: string, active: boolean): void {
  if (active) {
    guards.add(name);
    return;
  }
  if (!guards.delete(name)) return;
  if (guards.size === 0 && pending) {
    // Not now — the reader is mid-gesture, that is why the guard was up.
    waiting = true;
    tryRelease();
  }
}

/**
 * Ask for a refresh. Runs immediately when nothing is guarding *and* the page
 * is at rest; otherwise it is held until both are true. Nothing is dropped,
 * and several requests inside one window collapse into a single refresh.
 */
export function requestRefresh(by = 'unknown'): void {
  if (guards.size > 0 || performance.now() - lastMotionAt < QUIET_MS) {
    pending = by;
    waiting = true;
    return;
  }
  recordRefresh(by, false, () => ScrollTrigger.refresh());
}

/** True while at least one guard is up. Exposed for instrumentation. */
export function isRefreshGuarded(): boolean {
  return guards.size > 0;
}
