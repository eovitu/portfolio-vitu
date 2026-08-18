import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAnimationFrame } from '../../hooks/useSmoothScroll';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { marquee } from '../../lib/content';

/**
 * A band of text crossing a section boundary.
 *
 * Base speed is slow and constant, so the page is never completely still; the
 * scroll then adds to it and sets its sign, which is what makes the band feel
 * coupled to the reader rather than decorative. It decays back to the base
 * drift when the scroll stops.
 *
 * Cheap by construction: the phrase is rendered twice, and the offset is taken
 * modulo the width of one copy, so the loop is seamless without ever measuring
 * layout per frame. The width is read once on mount and on resize.
 */

const Band = styled.div`
  position: relative;
  overflow: hidden;
  padding: 26px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  /* The band is a boundary object: it must not inherit a section's world. */
  background: ${({ theme }) => theme.colors.bg};
  user-select: none;
`;

const Rail = styled.div`
  display: flex;
  width: max-content;
  will-change: transform;
`;

const Phrase = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 34px;
  padding-right: 34px;
  white-space: nowrap;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: clamp(13px, 1.5vw, 20px);
  letter-spacing: 0.28em;
  color: ${({ theme }) => theme.colors.textGhost};

  b {
    font-weight: inherit;
    color: var(--accent);
  }
`;

/** Constant drift in px per frame, before the scroll contributes anything. */
const BASE = -0.32;
/** How much of the scroll delta is handed to the band. */
const SCROLL_GAIN = 0.55;
/** How fast the scroll contribution decays once the reader stops. */
const DECAY = 0.94;

export function Marquee() {
  const rail = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLSpanElement>(null);
  const offset = useRef(0);
  const span = useRef(0);
  const boost = useRef(0);
  const lastY = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const measure = () => {
      span.current = copy.current?.offsetWidth ?? 0;
    };
    measure();
    lastY.current = window.scrollY;
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [reduced]);

  useAnimationFrame(() => {
    const el = rail.current;
    if (!el || !span.current) return;

    const y = window.scrollY;
    const delta = y - lastY.current;
    lastY.current = y;

    // The scroll sets both magnitude and direction; the base drift keeps the
    // band alive when the page is still.
    if (delta !== 0) boost.current = delta * SCROLL_GAIN;
    else boost.current *= DECAY;
    if (Math.abs(boost.current) < 0.01) boost.current = 0;

    offset.current += BASE - boost.current;
    // Modulo one copy: the second copy is always covering the seam.
    if (offset.current <= -span.current) offset.current += span.current;
    if (offset.current > 0) offset.current -= span.current;

    el.style.transform = `translate3d(${offset.current.toFixed(2)}px, 0, 0)`;
  }, !reduced);

  const items = marquee.items.map((item, i) => (
    <span key={i}>{item.accent ? <b>{item.text}</b> : item.text}</span>
  ));

  return (
    <Band data-marquee aria-hidden="true">
      <Rail ref={rail}>
        <Phrase ref={copy}>{items}</Phrase>
        <Phrase>{items}</Phrase>
      </Rail>
    </Band>
  );
}
