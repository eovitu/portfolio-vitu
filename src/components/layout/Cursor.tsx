import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAnimationFrame } from '../../hooks/useSmoothScroll';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { CURSOR, EASE_CSS } from '../../lib/motion';
import { gain, isActive, sample, setPointer } from '../../lib/gravityField';

/** Trail node positions. Module scope — written every frame, never allocated. */
const trailPos = Array.from({ length: 5 }, () => ({ x: -9999, y: -9999 }));

/** Peak attraction in px for a cursor sitting on the horizon. */
const ATTRACT_PX = 34;
/** Peak elongation along the axis pointing at the core. */
const STRETCH = 0.55;
/**
 * Screen radius of the event horizon in CSS px, measured off the shipped hero
 * framing. Inside it the cursor is consumed.
 */
const HORIZON_PX = 96;

const Dot = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: ${CURSOR.size}px;
  height: ${CURSOR.size}px;
  margin: ${-CURSOR.size / 2}px 0 0 ${-CURSOR.size / 2}px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  background: transparent;
  z-index: ${({ theme }) => theme.z.cursor};
  pointer-events: none;
  opacity: 0;
  will-change: transform;
  transition:
    opacity 0.4s ease,
    background-color 0.35s ease,
    scale 0.45s ${EASE_CSS};

  &[data-hovering='true'] {
    scale: ${CURSOR.hoverScale};
    background: ${({ theme }) => theme.colors.accent};
    opacity: 0.16;
  }
`;

/**
 * The trail — the cursor's own light being bent.
 *
 * Near the horizon the cursor stops being a point and starts leaving a wake:
 * a short chain of nodes, each lagging further behind the last, curving as
 * they are pulled toward the core. Away from the object the whole chain
 * collapses onto the cursor and fades out, so it costs nothing visually or
 * mentally anywhere else on the page.
 *
 * Rendered as a fixed number of nodes rather than as a canvas stroke: five
 * elements are cheaper than a per-frame path repaint, and they inherit the
 * same compositor treatment the cursor already gets.
 */
const TRAIL_LENGTH = 5;

const Trail = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 4px;
  height: 4px;
  margin: -2px 0 0 -2px;
  border-radius: 50%;
  background: var(--accent);
  z-index: ${({ theme }) => theme.z.cursor};
  pointer-events: none;
  opacity: 0;
  will-change: transform, opacity;
`;

const INTERACTIVE = 'a, button, [role="button"], input, textarea';

/**
 * Custom cursor — desktop pointer devices only, and never under reduced
 * motion. Position is lerped on the shared frame loop; the DOM node is moved
 * with a transform, never with React state.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });
  /** Whether the pointer is over the document at all. */
  const inside = useRef(false);
  /**
   * Visibility owed to presence, kept separate from visibility owed to the
   * field. The frame loop multiplies the two — writing opacity from both the
   * event handlers and the loop would have them overwrite each other.
   */
  const baseAlpha = useRef(0);
  const trail = useRef<(HTMLDivElement | null)[]>([]);
  const enabled = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reduced = useReducedMotion();
  const active = enabled && !reduced;

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      inside.current = true;
      baseAlpha.current = 1;
    };
    const onOver = (e: PointerEvent) => {
      const hit = (e.target as HTMLElement | null)?.closest?.(INTERACTIVE);
      el.dataset.hovering = hit ? 'true' : 'false';
    };
    const onLeave = () => {
      inside.current = false;
      baseAlpha.current = 0;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [active]);

  useAnimationFrame((_time, deltaMs) => {
    const el = ref.current;
    if (!el) return;
    /**
     * Frame-rate independent, not per-frame.
     *
     * `p += (target - p) * k` once per frame converges in a number of *frames*,
     * so the cursor's weight is really a function of how fast the page happens
     * to be running. On a long frame the cursor barely moves, and the reader
     * watches it crawl toward the pointer instead of arriving — which reads as
     * the cursor drifting on its own, most visibly in SKILLS, the one section
     * where the pointer is held still over a target and actually looked at.
     *
     * The same smoothing expressed against elapsed time converges in a fixed
     * amount of *time* instead. At 60fps this is arithmetically the shipped
     * feel; below it the cursor stays with the pointer rather than lagging
     * proportionally to the frame cost.
     */
    const k = 1 - Math.pow(1 - CURSOR.lerp, Math.min(4, deltaMs / (1000 / 60)));
    position.current.x += (target.current.x - position.current.x) * k;
    position.current.y += (target.current.y - position.current.y) * k;

    const px = position.current.x;
    const py = position.current.y;
    // Second consumer of the field. It also publishes the damped pointer, so
    // the letters and the dust modulate off the same position the reader sees
    // rather than off the raw event stream.
    setPointer(px, py, inside.current);

    let x = px;
    let y = py;
    let angle = 0;
    let stretch = 0;
    let alpha = 1;

    if (isActive()) {
      const s = sample(px, py);
      const pull = s.strength * gain();
      // Attracted: the cursor is drawn off its true position toward the core,
      // hardest at the horizon and negligible at the rim of influence.
      x += s.ux * pull * ATTRACT_PX;
      y += s.uy * pull * ATTRACT_PX;
      angle = Math.atan2(s.uy, s.ux);
      stretch = pull * STRETCH;

      /**
       * Swallowed, then re-emerging.
       *
       * No teleport and no state machine: opacity is simply a function of how
       * far inside the horizon the cursor is, reaching zero at the core. A
       * reader crossing the object therefore sees it consumed on the way in
       * and reconstituted on the way out, because the distance falls and then
       * rises on its own. State would only have added a way to get stuck
       * invisible if a pointer event were missed mid-crossing.
       */
      if (s.dist < HORIZON_PX) alpha = Math.max(0, s.dist / HORIZON_PX);
    }

    /**
     * The wake. Each node chases the one before it at a progressively slower
     * rate, so the chain stretches out with speed and curves as the field
     * drags it. It only becomes visible inside the field's influence — a
     * permanent trail would be a mouse gimmick rather than a statement about
     * light near a mass.
     */
    for (let i = 0; i < trail.current.length; i++) {
      const node = trail.current[i];
      if (!node) continue;
      const lead = i === 0 ? { x, y } : trailPos[i - 1];
      const p = trailPos[i];
      // Same time-based correction as the cursor itself, so the wake keeps its
      // shape at any frame rate instead of collapsing onto the dot on a slow
      // frame and stringing out on a fast one.
      const rate = 1 - Math.pow(1 - (0.34 - i * 0.045), Math.min(4, deltaMs / (1000 / 60)));
      p.x += (lead.x - p.x) * rate;
      p.y += (lead.y - p.y) * rate;

      let a = 0;
      if (isActive()) {
        const s = sample(p.x, p.y);
        // Fades in with proximity, and each node further back is fainter.
        a = s.strength * gain() * (1 - i / TRAIL_LENGTH) * 0.5 * baseAlpha.current;
        if (s.dist < HORIZON_PX) a *= Math.max(0, s.dist / HORIZON_PX);
      }
      node.style.opacity = a < 0.004 ? '0' : a.toFixed(3);
      node.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
    }

    el.style.opacity =
      el.dataset.hovering === 'true'
        ? String(0.16 * alpha)
        : String(alpha * baseAlpha.current);
    el.style.transform =
      `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)` +
      ` rotate(${angle.toFixed(3)}rad)` +
      ` scale(${(1 + stretch).toFixed(4)}, ${(1 - stretch * 0.55).toFixed(4)})`;
  }, active);

  if (!active) return null;
  return (
    <>
      {Array.from({ length: TRAIL_LENGTH }, (_, i) => (
        <Trail
          key={i}
          aria-hidden="true"
          ref={(node) => {
            trail.current[i] = node;
          }}
        />
      ))}
      <Dot ref={ref} aria-hidden="true" data-hovering="false" />
    </>
  );
}
