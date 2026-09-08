import { useEffect, useState, type RefObject } from 'react';
import { useAnimationFrame } from '../components/providers/SmoothScrollProvider';
import { useMediaQuery } from './useMediaQuery';
import { useReducedMotion } from './useReducedMotion';
import {
  DAMPING,
  damp,
  gain,
  getPointer,
  isActive,
  sample,
  setActive,
  setPointer,
} from '../lib/gravityField';
import { sceneMode } from '../three/scenePolicy';

/**
 * The glyphs as matter.
 *
 * Writes only to `[data-hero-glyph]`, the inner wrapper. The outer
 * `[data-hero-word]` belongs to the entrance and the exit, and the two never
 * meet: one node, one author, which is what makes a stranded transform
 * impossible rather than merely unlikely.
 *
 * Everything is damped toward a target rather than set outright, because the
 * field is meant to read as mass under strain and mass does not snap. The rate
 * is the shared `DAMPING`, so glyphs settle with the same weight as the rest of
 * the field's consumers.
 *
 * This hook is also the field's producer. `lib/gravityField` needs someone to
 * say when it is live and where the pointer is; both used to come from the
 * intro and the custom cursor, and both were removed as dead weight. Ownership
 * lives here now, with the only consumer that is left.
 */

interface Glyph {
  el: HTMLElement;
  /** Cached centre in CSS px, re-measured on resize, never per frame. */
  cx: number;
  cy: number;
  /**
   * Relative mass, from the glyph's rendered area.
   *
   * Positional distortion alone does not read as "in space": a shape that
   * tracks the pointer exactly reads as a UI effect however far it moves. What
   * communicates mass is lag, the glyph arriving late and settling. Wider
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
}

/** Module-scope scratch: this runs per glyph per frame and must not allocate. */
const glyphs: Glyph[] = [];

/** Peak displacement in px for a glyph sitting exactly at the core. */
const PULL_PX = 30;
/** Peak lean in degrees. Negative so a glyph left of the core tips right. */
const LEAN_DEG = -8;
/** Peak stretch. Kept small, legibility of the heading is not negotiable. */
const STRETCH = 0.11;
/** How far a glyph is thrown by a fast pointer sweep, per px of movement. */
const DRIFT_POINTER = 0.5;
/** Same, for the page scrolling under it. */
const DRIFT_SCROLL = 0.85;

/** Module scope: read every frame, must not allocate. */
const lastPointer = { x: 0, y: 0 };
const lastScrollY = { v: 0 };

/**
 * A moderate pointer response is a fine-pointer affordance. Touch gets the
 * cheaper non-pointer treatment: the glyphs simply sit where they are laid out.
 */
const FINE_POINTER = '(hover: hover) and (pointer: fine)';

/** Probed once. Creating a context is cheap enough at mount, not per call. */
let webglSupport: boolean | null = null;

function supportsWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    webglSupport = !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

function isFullScene(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection;
  return (
    sceneMode({
      webgl: supportsWebGL(),
      coarse: window.matchMedia?.('(pointer: coarse)').matches ?? false,
      width: window.innerWidth,
      saveData: connection?.saveData ?? false,
    }) === 'full'
  );
}

export function useGravityLetters(
  scopeRef: RefObject<HTMLElement>,
  enabled: boolean,
): void {
  const reduced = useReducedMotion();
  const fine = useMediaQuery(FINE_POINTER);
  const [heroVisible, setHeroVisible] = useState(false);
  const [full, setFull] = useState(() =>
    typeof window === 'undefined' ? false : isFullScene(),
  );

  // The hero leaving the viewport is the cheapest possible reason to stop:
  // there is nothing to attract once the composition is behind the reader.
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(scope);
    return () => observer.disconnect();
  }, [scopeRef]);

  useEffect(() => {
    const onResize = () => setFull(isFullScene());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /** Every condition must hold. Any one of them failing costs nothing. */
  const live = enabled && !reduced && fine && heroVisible && full;

  useEffect(() => {
    const scope = scopeRef.current;
    if (!live || !scope) return;

    const measure = () => {
      glyphs.length = 0;
      const nodes = scope.querySelectorAll<HTMLElement>('[data-hero-glyph]');
      for (const el of nodes) {
        // Measured with the field at rest, so the cached centre is the
        // element's true layout position and not a mid-tween one.
        el.style.transform = '';
        const rect = el.getBoundingClientRect();
        glyphs.push({
          el,
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2,
          // Normalised against a nominal glyph box so the constant above is
          // independent of the viewport's fluid type scale.
          mass: Math.max(0.55, Math.min(1.8, (rect.width * rect.height) / 14000)),
          tx: 0,
          ty: 0,
          rot: 0,
          scale: 1,
          dx: 0,
          dy: 0,
        });
        // Temporary, and released together with the field below.
        el.style.willChange = 'transform';
      }
    };

    measure();
    if (!glyphs.length) return;

    const onPointerMove = (event: PointerEvent) => {
      setPointer(event.clientX, event.clientY, true);
    };
    const onPointerLeave = () => {
      const pointer = getPointer();
      setPointer(pointer.x, pointer.y, false);
    };

    window.addEventListener('resize', measure);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);

    // The field is inert until someone claims it. This hook is that someone.
    setActive(true);

    return () => {
      setActive(false);
      setPointer(-9999, -9999, false);
      window.removeEventListener('resize', measure);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      for (const glyph of glyphs) {
        glyph.el.style.transform = '';
        glyph.el.style.willChange = '';
      }
      glyphs.length = 0;
    };
  }, [live, scopeRef]);

  useAnimationFrame(() => {
    if (!glyphs.length) return;
    const g0 = isActive() ? gain() : 0;

    /**
     * Velocities of the two things the reader actually drives. The glyphs lag
     * behind both, which is the whole effect: it is the gap between the gesture
     * and the response that reads as floating mass.
     */
    const pointer = getPointer();
    const pvx = pointer.x - lastPointer.x;
    const pvy = pointer.y - lastPointer.y;
    lastPointer.x = pointer.x;
    lastPointer.y = pointer.y;
    const svy = window.scrollY - lastScrollY.v;
    lastScrollY.v = window.scrollY;

    for (const glyph of glyphs) {
      let targetX = 0;
      let targetY = 0;
      let targetRot = 0;
      let targetScale = 1;

      if (g0 > 0) {
        const field = sample(glyph.cx, glyph.cy);
        const pull = field.strength * g0;
        targetX = field.ux * pull * PULL_PX;
        targetY = field.uy * pull * PULL_PX;
        targetRot = field.ux * pull * LEAN_DEG;
        targetScale = 1 + pull * STRETCH;
      }

      /**
       * Inertia is integrated on its own channel and then added to the field's
       * pull, the two compose, they do not replace each other. The field says
       * where the glyph is drawn; the inertia says how late it gets there.
       *
       * Heavier glyphs are impulsed harder and released more slowly, so the
       * line breaks into a spread of arrival times instead of shifting as one
       * block. `DAMPING / mass` is what makes a wide letter feel wide.
       */
      const rate = DAMPING / glyph.mass;
      glyph.dx += (-pvx * DRIFT_POINTER * glyph.mass - glyph.dx) * rate;
      glyph.dy +=
        (-(pvy * DRIFT_POINTER + svy * DRIFT_SCROLL) * glyph.mass - glyph.dy) * rate;
      if (Math.abs(glyph.dx) < 0.01) glyph.dx = 0;
      if (Math.abs(glyph.dy) < 0.01) glyph.dy = 0;

      glyph.tx = damp(glyph.tx, targetX + glyph.dx, rate);
      glyph.ty = damp(glyph.ty, targetY + glyph.dy, rate);
      glyph.rot = damp(glyph.rot, targetRot, rate);
      glyph.scale = damp(glyph.scale, targetScale, rate);

      // Exact identity when at rest, so a settled glyph carries no transform
      // at all rather than a permanent near-zero matrix.
      if (
        glyph.tx === 0 &&
        glyph.ty === 0 &&
        glyph.rot === 0 &&
        glyph.scale === 1 &&
        glyph.dx === 0 &&
        glyph.dy === 0
      ) {
        if (glyph.el.style.transform) glyph.el.style.transform = '';
        continue;
      }

      glyph.el.style.transform =
        `translate(${glyph.tx.toFixed(2)}px, ${glyph.ty.toFixed(2)}px)` +
        ` rotate(${glyph.rot.toFixed(3)}deg)` +
        ` scale(${glyph.scale.toFixed(4)})`;
    }
  }, live);
}
