import styled from 'styled-components';

/** The page swaps only behind a completely opaque curtain. */
export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 110;
  display: none;
  opacity: 0;
  background: #000;
  pointer-events: auto;
  will-change: opacity;
`;
