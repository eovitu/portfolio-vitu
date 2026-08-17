import { useEffect, useRef } from 'react';
import { useAnimationFrame } from '../components/providers/SmoothScrollProvider';
import { useReducedMotion } from './useReducedMotion';
import { DAMPING, damp, gain, getPointer, isActive, sample } from '../lib/gravityField';

/**
 * The letters as matter — first consumer of `lib/gravityField`.
 *
 * Writes only to `[data-glyph]`, the inner wrapper the intro and the warp
 * never touch. See `Hero.styles.LetterGlyph` for why the channels are split at
 * the DOM instead of composed on one node.
 *
 * Everything here is damped toward a target rather than set outright: the
 * field is meant to read as mass under strain, and mass does not snap. The
 * rate is the shared `DAMPING` so the letters settle with the same weight as
 * the cursor and the dust.
 */

interface Glyph {
  el: HTMLElement;
  /** Cached centre in CSS px — re-measured on resize, never per frame. */
  cx: number;
  cy: number;
  /**
   * Relative mass, from the glyph's rendered area.
   *
   * Positional distortion alone does not read as "in space" — a shape that
   * tracks the pointer exactly reads as a UI effect however far it moves. What
   * communicates mass is lag: the letter arriving late and settling. Wider
   * glyphs get more of it, so a `W` visibly trails an `I` and the line stops
   * moving as one rigid object.
   */
  mass: number;
  /** Damped state. */
  tx: number;
  ty: number;
  rot: number;
  scale: number;
  /** Inertial drift, integrated separately from the field's pull. */
  dx: number;
  dy: number;
  /**
   * The toy's state machine.
   *
   * `idle` — the field and the inertia own it.
   * `drag` — the reader has hold of it; nothing else writes it.
   * `falling` — released, being consumed by the object.
   * `returning` — reconstituted at its origin, fading back in.
   *
   * It lives here, in the same record the field uses, for the same reason the
   * field lives on `[data-glyph]` at all: this node has exactly one writer. A
   * separate drag hook would be a second system writing the same transform,
   * which is how the stranded-transform bugs started.
   */
  mode: 'idle' | 'drag' | 'falling' | 'returning';
  /** Progress through `falling` / `returning`, 0 → 1. */
  phase: number;
}

/** Module-scope scratch: this runs per glyph per frame and must not allocate. */
const glyphs: Glyph[] = [];

/** Peak displacement in px for a glyph sitting exactly at the core. */
const PULL_PX = 30;
/** Peak lean in degrees. Negative so a glyph left of the core tips right. */
const LEAN_DEG = -8;
/** Peak stretch. Kept small — legibility of the name is not negotiable. */
const STRETCH = 0.11;
/** How far a glyph is thrown by a fast pointer sweep, per px of movement. */
const DRIFT_POINTER = 0.5;
/** Same, for the page scrolling under it. */
const DRIFT_SCROLL = 0.85;

/** Module scope: read every frame, must not allocate. */
const lastPointer = { x: 0, y: 0 };
const lastScrollY = { v: 0 };

/** The letter currently held, and where the grab started. */
const dragging: {
  g: Glyph | null;
  originX: number;
  originY: number;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
} = { g: null, originX: 0, originY: 0, baseX: 0, baseY: 0, x: 0, y: 0 };

/** Seconds-ish per frame step for the consume / reconstitute phases. */
const FALL_RATE = 0.028;
const RETURN_RATE = 0.02;

export function useGravityLetters(enabled: boolean): void {
  const reduced = useReducedMotion();
  const measured = useRef(false);

  useEffect(() => {
    if (!enabled || reduced) return;

    const measure = () => {
      glyphs.length = 0;
      const nodes = document.querySelectorAll<HTMLElement>('[data-letter] [data-glyph]');
      for (const el of nodes) {
        // Measured with the field at rest, so the cached centre is the
        // element's true layout position and not a mid-tween one.
        el.style.transform = '';
        const r = el.getBoundingClientRect();
        glyphs.push({
          el,
          cx: r.left + r.width / 2,
          cy: r.top + r.height / 2,
          // Normalised against a nominal glyph box so the constant below is
          // independent of the viewport's fluid type scale.
          mass: Math.max(0.55, Math.min(1.8, (r.width * r.height) / 14000)),
          tx: 0,
          ty: 0,
          rot: 0,
          scale: 1,
          dx: 0,
          dy: 0,
          mode: 'idle',
          phase: 0,
        });
      }
      measured.current = glyphs.length > 0;
    };

    measure();
    window.addEventListener('resize', measure);

    /**
     * The toy: a letter can be pulled out of the word.
     *
     * Nothing announces it. Released, the letter is taken by the object,
     * consumed, and reconstituted where it started — matter going through and
     * coming out the other side.
     *
     * Only live once the field is active, which is after the intro's `land`:
     * the intro owns these nodes until then and has priority.
     */
    const onDown = (e: PointerEvent) => {
      if (!isActive()) return;
      const el = (e.target as HTMLElement | null)?.closest?.('[data-glyph]');
      if (!el) return;
      const g = glyphs.find((c) => c.el === el);
      if (!g || g.mode !== 'idle') return;
      // Without this the browser starts a text selection and the letter
      // "sticks" to the cursor as a drag image instead of moving.
      e.preventDefault();
      g.mode = 'drag';
      g.phase = 0;
      dragging.g = g;
      dragging.originX = e.clientX;
      dragging.originY = e.clientY;
      dragging.baseX = g.tx;
      dragging.baseY = g.ty;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };

    const onUp = () => {
      const g = dragging.g;
      if (!g) return;
      dragging.g = null;
      // Released into the field: from here the object has it.
      g.mode = 'falling';
      g.phase = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging.g) return;
      dragging.x = e.clientX;
      dragging.y = e.clientY;
    };

    document.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    return () => {
      window.removeEventListener('resize', measure);
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      for (const g of glyphs) {
        g.el.style.transform = '';
        g.el.style.opacity = '';
      }
      dragging.g = null;
      glyphs.length = 0;
      measured.current = false;
    };
  }, [enabled, reduced]);

  useAnimationFrame(() => {
    if (!measured.current) return;
    const g0 = isActive() ? gain() : 0;

    /**
     * Velocities of the two things the reader actually drives. The letters lag
     * behind both, which is the whole effect: it is the gap between the
     * gesture and the response that reads as floating mass.
     */
    const p = getPointer();
    const pvx = p.x - lastPointer.x;
    const pvy = p.y - lastPointer.y;
    lastPointer.x = p.x;
    lastPointer.y = p.y;
    const svy = window.scrollY - lastScrollY.v;
    lastScrollY.v = window.scrollY;

    for (const g of glyphs) {
      /**
       * The toy's three non-idle states short-circuit the field entirely.
       * While a letter is held, falling or coming back, it has exactly one
       * author — mixing the field's pull into a released letter made the
       * consume read as a glitch rather than as gravity taking it.
       */
      if (g.mode === 'drag') {
        g.tx = dragging.baseX + (dragging.x - dragging.originX);
        g.ty = dragging.baseY + (dragging.y - dragging.originY);
        g.el.style.opacity = '';
        g.el.style.transform = `translate(${g.tx.toFixed(2)}px, ${g.ty.toFixed(2)}px) scale(1.06)`;
        continue;
      }

      if (g.mode === 'falling') {
        g.phase = Math.min(1, g.phase + FALL_RATE);
        const core = sample(g.cx + g.tx, g.cy + g.ty);
        const t = g.phase * g.phase; // accelerating inward
        g.tx += core.ux * core.dist * t * 0.16;
        g.ty += core.uy * core.dist * t * 0.16;
        const s = Math.max(0.02, 1 - g.phase);
        g.el.style.opacity = String(Math.max(0, 1 - g.phase * 1.15));
        g.el.style.transform = `translate(${g.tx.toFixed(2)}px, ${g.ty.toFixed(2)}px) scale(${s.toFixed(3)})`;
        if (g.phase >= 1) {
          // Consumed. It comes back where it belongs, not where it fell.
          g.mode = 'returning';
          g.phase = 0;
          g.tx = 0;
          g.ty = 0;
          g.dx = 0;
          g.dy = 0;
        }
        continue;
      }

      if (g.mode === 'returning') {
        g.phase = Math.min(1, g.phase + RETURN_RATE);
        const s = 0.6 + 0.4 * g.phase;
        g.el.style.opacity = String(g.phase);
        g.el.style.transform = `translate(0px, 0px) scale(${s.toFixed(3)})`;
        if (g.phase >= 1) {
          g.mode = 'idle';
          g.el.style.opacity = '';
        }
        continue;
      }

      let targetX = 0;
      let targetY = 0;
      let targetRot = 0;
      let targetScale = 1;

      if (g0 > 0) {
        const s = sample(g.cx, g.cy);
        const pull = s.strength * g0;
        targetX = s.ux * pull * PULL_PX;
        targetY = s.uy * pull * PULL_PX;
        targetRot = s.ux * pull * LEAN_DEG;
        targetScale = 1 + pull * STRETCH;
      }

      /**
       * Inertia, integrated on its own channel and then added to the field's
       * pull — the two compose, they do not replace each other. The field says
       * where the letter is drawn; the inertia says how late it gets there.
       *
       * Heavier glyphs are impulsed harder and released more slowly, so the
       * line breaks up into a spread of arrival times instead of shifting as
       * one block. `DAMPING / mass` is what makes a wide letter feel wide.
       */
      const rate = DAMPING / g.mass;
      g.dx += (-pvx * DRIFT_POINTER * g.mass - g.dx) * rate;
      g.dy += (-(pvy * DRIFT_POINTER + svy * DRIFT_SCROLL) * g.mass - g.dy) * rate;
      if (Math.abs(g.dx) < 0.01) g.dx = 0;
      if (Math.abs(g.dy) < 0.01) g.dy = 0;

      g.tx = damp(g.tx, targetX + g.dx, rate);
      g.ty = damp(g.ty, targetY + g.dy, rate);
      g.rot = damp(g.rot, targetRot, rate);
      g.scale = damp(g.scale, targetScale, rate);

      // Exact identity when at rest, so the intro audit's stranded-transform
      // sweep stays honest instead of reporting a permanent near-zero matrix.
      if (
        g.tx === 0 &&
        g.ty === 0 &&
        g.rot === 0 &&
        g.scale === 1 &&
        g.dx === 0 &&
        g.dy === 0
      ) {
        if (g.el.style.transform) g.el.style.transform = '';
        continue;
      }

      g.el.style.transform =
        `translate(${g.tx.toFixed(2)}px, ${g.ty.toFixed(2)}px)` +
        ` rotate(${g.rot.toFixed(3)}deg)` +
        ` scale(${g.scale.toFixed(4)})`;
    }
  }, enabled && !reduced);
}
