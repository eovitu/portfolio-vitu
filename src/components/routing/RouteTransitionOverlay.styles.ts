import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 110;
  display: none;
  transform: scaleY(0);
  transform-origin: 50% 100%;
  background: radial-gradient(
    circle at var(--transition-x, 50%) var(--transition-y, 50%),
    rgba(0, 0, 0, 0.98) 0 9%,
    rgba(8, 8, 10, 0.78) 18%,
    transparent 48%
  );
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
  will-change: transform, box-shadow;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: -9%;
    border: 1px solid rgba(214, 159, 81, 0.46);
    border-radius: 50%;
    opacity: 0;
    animation: route-ring 1.1s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }

  &::after {
    inset: -19%;
    animation-delay: 180ms;
    border-color: rgba(233, 231, 226, 0.2);
  }

  @keyframes route-ring {
    0% {
      transform: scale(0.78);
      opacity: 0;
    }
    18% {
      opacity: 0.78;
    }
    100% {
      transform: scale(1.12);
      opacity: 0;
    }
  }
`;

export const Label = styled.span`
  position: absolute;
  left: 50%;
  top: calc(50% + min(20vw, 250px));
  transform: translateX(-50%);
  color: rgba(233, 231, 226, 0.72);
  font: 400 10px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.22em;
  text-transform: uppercase;
  animation: route-label 700ms ease both;

  ${({ theme }) => theme.media.mobile} {
    top: calc(50% + 142px);
    font-size: 9px;
    letter-spacing: 0.16em;
  }

  @keyframes route-label {
    from {
      opacity: 0;
      letter-spacing: 0.42em;
    }
    to {
      opacity: 1;
      letter-spacing: 0.22em;
    }
  }
`;
