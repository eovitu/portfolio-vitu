import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 110;
  display: none;
  transform: scaleY(0);
  transform-origin: 50% 100%;
  background:
    radial-gradient(circle at var(--transition-x, 50%) var(--transition-y, 50%), #000 0 14%, transparent 48%),
    #08080a;
  pointer-events: none;
  will-change: transform;
`;

export const Core = styled.div`
  position: absolute;
  left: var(--transition-x, 50%);
  top: var(--transition-y, 50%);
  width: min(34vw, 420px);
  aspect-ratio: 1;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: #000;
  box-shadow:
    0 0 0 1px rgba(214, 159, 81, 0.32),
    0 0 90px rgba(214, 159, 81, 0.18);
`;
