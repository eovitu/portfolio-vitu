import { useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { createField, type Field, type FieldKind } from '../../lib/matterField';
import { prefersReducedMotion } from '../../lib/prefersReducedMotion';

/**
 * A generated surface, drawn once and kept alive by the compositor.
 *
 * The first version redrew the field on the shared ticker at 12fps. It looked
 * right and it cost the page its frame budget: with five surfaces on the
 * document, scrolling measured 7.9ms median / 23.8ms p95 with 49 frames over
 * 20ms, against a 5.6 / 8.0 baseline. Per-pixel work on the CPU and a texture
 * upload cannot share a frame with a scrubbed timeline, however cheap each
 * one looks in isolation.
 *
 * So the noise is computed exactly once per surface, and the motion is bought
 * from the compositor instead: two plates of the same field at different
 * scales, drifting against each other on transform-only keyframes. What that
 * loses is turbulence evolving in place. What it keeps — and what actually
 * reads at this speed — is matter slowly turning over, which is the only thing
 * the eye was picking up at 0.09x time anyway.
 *
 * `image-rendering` is left at its default so the browser interpolates the
 * upscale; that blur is what turns a 200x260 buffer into plasma.
 */

const drift = keyframes`
  from { transform: scale(1.14) translate3d(-2.2%, -1.4%, 0) rotate(0.4deg); }
  to   { transform: scale(1.22) translate3d(2.4%, 2%, 0) rotate(-0.5deg); }
`;

const counterDrift = keyframes`
  from { transform: scale(1.34) translate3d(2.6%, 1.8%, 0) rotate(-0.6deg); }
  to   { transform: scale(1.2) translate3d(-2.8%, -2.2%, 0) rotate(0.5deg); }
`;

const animated = css<{ $seconds: number; $counter?: boolean }>`
  animation: ${({ $counter }) => ($counter ? counterDrift : drift)}
    ${({ $seconds }) => $seconds}s ease-in-out infinite alternate;
  will-change: transform;

  ${({ theme }) => theme.media.reduce} {
    animation: none;
    transform: scale(1.14);
  }
`;

const Surface = styled.canvas<{ $seconds: number; $counter?: boolean; $blend?: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  ${animated}
  ${({ $blend }) =>
    $blend &&
    css`
      /* Plain alpha, not a blend mode. Screen read slightly richer and put a
         full-viewport non-opaque compositing pass in the scroll path; the two
         plates already separate through their opposed drift. */
      opacity: 0.46;
    `}
`;

const Holder = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;

  /* A surface that is nowhere near the viewport is not worth a compositor
     layer being kept warm. The flag is set by an observer, never per frame. */
  &[data-idle='true'] canvas {
    animation-play-state: paused;
    will-change: auto;
  }
`;

interface Props {
  kind: FieldKind;
  /**
   * Pixels of work for the single draw. The default suits a plate; a
   * full-bleed surface is scaled up five times more, and past that ratio the
   * interpolation stops reading as matter and starts reading as a blurred
   * photograph — so the interludes pay for more samples. It is paid once.
   */
  budget?: number;
  /**
   * Two plates instead of one. Reserved for the full-bleed screens: at that
   * size a single drifting plate reads as a slow pan, and the second one
   * turning the other way is what makes the surface look like it has depth.
   */
  layered?: boolean;
}

function useDrawnField(
  ref: React.RefObject<HTMLCanvasElement>,
  kind: FieldKind,
  budget: number | undefined,
  seed: number,
): void {
  const fieldRef = useRef<Field | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const field = createField(canvas, kind, budget, seed);
    if (!field) return;
    fieldRef.current = field;

    const paint = () => {
      const r = canvas.getBoundingClientRect();
      field.fit(r.width > 0 && r.height > 0 ? r.width / r.height : 0.78);
      /* One draw. The phase is a constant per plate rather than a clock: two
         plates of the same noise at the same phase would be one image. */
      field.draw(seed * 37);
    };
    paint();

    /* The only thing that can invalidate the buffer is the surface changing
       proportion, which happens on resize and nowhere else. */
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      fieldRef.current = null;
    };
  }, [ref, kind, budget, seed]);
}

export function MatterField({ kind, budget, layered = false }: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLCanvasElement>(null);
  const second = useRef<HTMLCanvasElement>(null);
  const reduced = prefersReducedMotion();

  useDrawnField(first, kind, budget, 0);
  useDrawnField(second, kind, layered ? budget : undefined, layered ? 3 : 0);

  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    el.dataset.idle = 'true';
    const io = new IntersectionObserver(
      ([entry]) => {
        el.dataset.idle = String(!entry.isIntersecting);
      },
      { rootMargin: '160px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Holder ref={holder} aria-hidden="true">
      <Surface ref={first} $seconds={reduced ? 0 : 46} />
      {layered && <Surface ref={second} $seconds={reduced ? 0 : 61} $counter $blend />}
    </Holder>
  );
}
