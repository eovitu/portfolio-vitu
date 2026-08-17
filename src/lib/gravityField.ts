/**
 * The gravitational field, in screen space.
 *
 * One source of truth for where the core is on screen and how strongly it
 * pulls at a given point — consumed by the letters, the cursor and the
 * starfield. Writing three independent proximity tests would guarantee they
 * disagree the moment the framing changes, which is exactly what the
 * direction rules out.
 *
 * The producer is the render rig (`three/Scene`), which already has the camera
 * and the object's world position; it projects once per frame and writes here.
 * Consumers only ever read.
 *
 * Nothing in this module allocates. `sample()` fills and returns a single
 * module-scope record, so a consumer running per frame on every letter costs
 * no garbage.
 */

export interface FieldSample {
  /** Unit vector from the sampled point toward the core. */
  ux: number;
  uy: number;
  /** Distance in CSS px. */
  dist: number;
  /**
   * Influence, 1 at the core and 0 at the edge of `radius`, eased so the
   * falloff is steep near the horizon and long in the tail — matter far out
   * should feel a trace, not a cliff.
   */
  strength: number;
}

const core = { x: 0, y: 0, visible: false };

/**
 * Radius of influence in CSS px. Sized to the hero lockup: at the shipped
 * framing the core sits around x 660 / y 470, and 620px reaches the far end of
 * "VICTOR" without touching the info grid below the rule.
 */
export const FIELD_RADIUS = 620;

/**
 * Global gate. The intro owns every transform on the letters until it
 * finishes; the field stays inert until then or it would fight the expulsion.
 * `three/Scene` keeps `coreVisible` honest, `setActive` is the intro's switch.
 */
const state = { active: false, energy: 0, pointerBoost: 0 };

/** Damped pointer position, written by the cursor consumer once per frame. */
const pointer = { x: -9999, y: -9999, inside: false };

const out: FieldSample = { ux: 0, uy: 0, dist: 0, strength: 0 };

/**
 * The core in world space, published alongside the screen projection.
 *
 * The starfield bends in the vertex shader and therefore needs the core in
 * view space, not screen space. Rather than let it re-derive the framing (and
 * drift from the other two consumers the first time the composition changes),
 * the same producer publishes both and the shader transforms this one itself.
 */
const coreWorld = { x: 0, y: 0, z: 0 };

export function setCoreWorld(x: number, y: number, z: number): void {
  coreWorld.x = x;
  coreWorld.y = y;
  coreWorld.z = z;
}

export function getCoreWorld(): { x: number; y: number; z: number } {
  return coreWorld;
}

export function setCoreScreen(x: number, y: number, visible: boolean): void {
  core.x = x;
  core.y = y;
  core.visible = visible;
}

export function getCore(): { x: number; y: number; visible: boolean } {
  return core;
}

export function setActive(active: boolean): void {
  state.active = active;
}

export function isActive(): boolean {
  return state.active && core.visible;
}

/** `heroSignal.energy`, forwarded so the field breathes with the object. */
export function setEnergy(energy: number): void {
  state.energy = energy;
}

export function setPointer(x: number, y: number, inside: boolean): void {
  pointer.x = x;
  pointer.y = y;
  pointer.inside = inside;
}

export function getPointer(): { x: number; y: number; inside: boolean } {
  return pointer;
}

/**
 * How hard the field is pulling right now, independent of position.
 *
 * A field that is merely a function of position renders once and then looks
 * painted on — the letters would be born crooked and stay crooked, and the eye
 * stops seeing it within seconds. So the global gain moves: it rises as the
 * pointer approaches the core, and rides the object's own pulse on top.
 */
export function gain(): number {
  if (!isActive()) return 0;
  let proximity = 0;
  if (pointer.inside) {
    const dx = core.x - pointer.x;
    const dy = core.y - pointer.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    proximity = Math.max(0, 1 - d / (FIELD_RADIUS * 1.35));
  }
  // Resting tension is deliberate: even untouched, matter near a horizon is
  // under strain. The pointer and the pulse modulate around it.
  return 0.42 + proximity * 0.72 + state.energy * 0.5;
}

/** Fills and returns the shared sample record. Never allocates. */
export function sample(x: number, y: number): FieldSample {
  const dx = core.x - x;
  const dy = core.y - y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1e-6;
  out.ux = dx / dist;
  out.uy = dy / dist;
  out.dist = dist;
  const t = Math.max(0, 1 - dist / FIELD_RADIUS);
  // Cubic falloff: near the horizon the gradient is violent, far out it is a
  // whisper. Linear would spread the effect evenly and read as a global skew.
  out.strength = t * t * t;
  return out;
}

/**
 * Standard damping for every consumer, so the letters, the cursor and the
 * stars all settle with the same weight. 0.035 is the prototype's figure and
 * the reference the direction asked to preserve — anything snappier reads as
 * a UI effect rather than as mass responding to a force.
 */
export const DAMPING = 0.035;

export function damp(current: number, target: number, rate = DAMPING): number {
  const next = current + (target - current) * rate;
  // Snap the tail to zero so a resting element reaches exact identity instead
  // of asymptotically approaching it and leaving a residual transform behind.
  return Math.abs(next - target) < 0.0004 ? target : next;
}
