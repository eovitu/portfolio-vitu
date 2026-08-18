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
 * while a guard is up is remembered and runs the moment the last guard
 * clears. Several requests during one guarded window collapse into a single
 * refresh, which is also what stops the cascade — a refresh changes layout,
 * which triggers the next refresh, which is what turns one jump into the
 * several the reader actually sees.
 */

import { ScrollTrigger } from './gsap';

/**
 * Named rather than counted. A guard is a *state* ("the WORK pin is engaged"),
 * not an event, and the same state can be asserted twice — ScrollTrigger fires
 * `onEnter` and `onEnterBack` for the same pin — so balancing increments would
 * be one missed callback away from a gate that never opens again.
 */
const guards = new Set<string>();

let pending = false;

/** Raise or clear a named guard. Idempotent in both directions. */
export function setRefreshGuard(name: string, active: boolean): void {
  if (active) {
    guards.add(name);
    return;
  }
  if (!guards.delete(name)) return;
  if (guards.size === 0 && pending) {
    pending = false;
    ScrollTrigger.refresh();
  }
}

/**
 * Ask for a refresh. Runs immediately when nothing is guarding, and is
 * deferred to the end of the guarded window otherwise.
 */
export function requestRefresh(): void {
  if (guards.size > 0) {
    pending = true;
    return;
  }
  ScrollTrigger.refresh();
}

/** True while at least one guard is up. Exposed for instrumentation. */
export function isRefreshGuarded(): boolean {
  return guards.size > 0;
}
