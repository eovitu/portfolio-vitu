import { useRef } from 'react';
import styled from 'styled-components';
import { useAnimationFrame } from '../../hooks/useSmoothScroll';
import { horizonProgress } from '../../lib/horizon';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Gravitational redshift.
 *
 * Light climbing out of a gravity well loses energy and shifts toward the red.
 * As the reader falls toward CONTACT the page's whites drift warm — the blue
 * end of everything on screen is progressively attenuated.
 *
 * Implemented as a single composited layer in `multiply`, for two reasons.
 *
 * First, cost: this is one blended layer, the same order of expense as the
 * grain, and it needs no filter on the document (a global `filter` would
 * promote and re-rasterise every section on every scroll frame).
 *
 * Second, and the reason it is `multiply` rather than anything else: multiply
 * against a backdrop of 0 is 0, for any source colour. The black point of the
 * object is arithmetically untouchable, exactly as with the grain. Multiplying
 * by pure white is the identity, so the top of the page is a genuine no-op and
 * the effect can only ever remove blue, never add light.
 *
 * Strength is deliberately below the threshold of recognition: at the bottom
 * the blue channel is down ~22/255 and green ~9/255. Side by side it is
 * visible; in motion it is felt as the page getting warmer without the reader
 * being able to name what changed.
 */
const Layer = styled.div`
  position: fixed;
  inset: 0;
  /* Below the grain (50) and every interactive layer; above the content. */
  z-index: 49;
  pointer-events: none;
  mix-blend-mode: multiply;
  background-color: rgb(255, 255, 255);

  ${({ theme }) => theme.media.reduce} {
    display: none;
  }
`;

/** Peak attenuation at the horizon, in 8-bit steps. */
const GREEN_DROP = 9;
const BLUE_DROP = 22;

export function Redshift() {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef(-1);
  const reduced = useReducedMotion();

  useAnimationFrame(() => {
    const el = ref.current;
    if (!el) return;
    const p = horizonProgress();
    /**
     * Quantised to 40 steps. Writing `background-color` invalidates the
     * layer, so a continuous value would repaint a full-screen surface every
     * frame to express a change no eye can resolve.
     */
    const step = Math.round(p * 40);
    if (step === last.current) return;
    last.current = step;
    const t = step / 40;
    el.style.backgroundColor = `rgb(255, ${255 - Math.round(GREEN_DROP * t)}, ${
      255 - Math.round(BLUE_DROP * t)
    })`;
  }, !reduced);

  if (reduced) return null;
  return <Layer ref={ref} data-redshift aria-hidden="true" />;
}
