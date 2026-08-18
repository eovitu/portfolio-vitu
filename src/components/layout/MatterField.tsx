import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createField, type Field, type FieldKind } from '../../lib/matterField';
import { useAnimationFrame } from '../providers/SmoothScrollProvider';
import { prefersReducedMotion } from '../../lib/prefersReducedMotion';

/**
 * The plate's body.
 *
 * `image-rendering` is left at its default so the browser interpolates the
 * upscale — that blur is what turns a 110x140 buffer into plasma. The canvas
 * sits under the plate's tint and grain layers, which stay in CSS.
 */
const Surface = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
`;

/**
 * Redraw rate.
 *
 * The field advances at 0.09x real time, so at 12fps consecutive frames differ
 * by well under a quantisation step of the ramp — the motion is continuous to
 * the eye and costs a fifth of what a per-frame redraw would. The site's whole
 * budget is one shared frame loop, and this is the only thing in it that
 * touches per-pixel work on the CPU.
 */
const INTERVAL_MS = 84;

/** Off-screen plates are not drawn at all: in the pinned chapter two of the
 *  three panels are always outside the viewport. */
const MARGIN = 240;

/**
 * @param budget pixels of work per redraw. The default suits a plate; a
 * full-bleed surface is scaled up five to six times more, and past that ratio
 * the interpolation stops reading as matter and starts reading as a blurred
 * photograph — so the interludes pay for more samples.
 */
export function MatterField({ kind, budget }: { kind: FieldKind; budget?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<Field | null>(null);
  const nextRef = useRef(0);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const field = createField(canvas, kind, budget);
    if (!field) return;
    fieldRef.current = field;

    const fit = () => {
      const r = canvas.getBoundingClientRect();
      field.fit(r.width > 0 && r.height > 0 ? r.width / r.height : 0.78);
      field.draw(0);
    };
    fit();

    /* The plate's aspect ratio is a CSS variable of the orbit and of the
       breakpoint, so it changes on resize and nowhere else. */
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      fieldRef.current = null;
    };
  }, [kind, budget]);

  useAnimationFrame((time) => {
    const field = fieldRef.current;
    const canvas = canvasRef.current;
    if (!field || !canvas) return;
    const ms = time * 1000;
    if (ms < nextRef.current) return;

    const r = canvas.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    if (r.bottom < -MARGIN || r.top > vh + MARGIN) return;
    if (r.right < -MARGIN || r.left > vw + MARGIN) return;

    nextRef.current = ms + INTERVAL_MS;
    field.draw(time);
  }, !reduced);

  return <Surface ref={canvasRef} aria-hidden="true" />;
}
