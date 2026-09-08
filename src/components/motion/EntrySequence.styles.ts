import styled from 'styled-components';

/**
 * The entry layer sits above the route overlay (110) and below the skip link
 * (120): it is decoration, and a keyboard reader must never be locked behind
 * decoration. `pointer-events: none` for the same reason, the interface under
 * it stays clickable for the whole sequence, so a slow entry can never become
 * a blocked page.
 */
export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 115;
  pointer-events: none;
  background: ${({ theme }) => theme.colors.bg};
  /* Temporary by construction: the element is removed on release, which is
     also how this layer hint gets released. */
  will-change: opacity;
`;

/**
 * The fragments start off-composition and travel inward. Clipping them here
 * keeps that travel from ever widening the document, `scrollWidth` must stay
 * within `innerWidth` at every viewport.
 */
export const Field = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
`;

export const Fragment = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 3px;
  height: 3px;
  margin: -1.5px 0 0 -1.5px;
  border-radius: 50%;
  background: var(--accent-muted);
  opacity: 0;
`;

/** The core: an absorbing void with the accent only at its rim. */
export const Core = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(26vw, 300px);
  aspect-ratio: 1;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  background: ${({ theme }) => theme.colors.bg};
  box-shadow:
    0 0 0 1px rgba(214, 159, 81, 0.32),
    0 0 90px rgba(214, 159, 81, 0.18);
`;

/** The disc receiving energy, read edge-on as a single band of light. */
export const Flare = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(72vw, 940px);
  height: 2px;
  transform: translate(-50%, -50%) scaleX(0);
  background: linear-gradient(
    90deg,
    transparent,
    var(--accent-bright) 45%,
    var(--accent-bright) 55%,
    transparent
  );
  opacity: 0;
`;
