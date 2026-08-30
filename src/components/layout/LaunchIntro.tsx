import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Screen = styled.div<{ $leaving: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 24px ${({ theme }) => theme.space.gutter};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  pointer-events: none;
  opacity: ${({ $leaving }) => ($leaving ? 0 : 1)};
  transform: ${({ $leaving }) => ($leaving ? 'translateY(-2%)' : 'translateY(0)')};
  transition:
    opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);

  ${({ theme }) => theme.media.mobile} {
    padding: 20px;
  }

  ${({ theme }) => theme.media.reduce} {
    display: none;
  }
`;

const Mark = styled.div`
  align-self: center;
  display: grid;
  gap: 12px;
  max-width: 760px;
`;

const Name = styled.div`
  font-size: clamp(42px, 10vw, 148px);
  line-height: 0.88;
  letter-spacing: -0.055em;
  font-weight: 500;
`;

const Statement = styled.p`
  margin: 0;
  max-width: 34ch;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: clamp(15px, 1.5vw, 19px);
  line-height: 1.45;
`;

const Status = styled.div`
  display: grid;
  grid-template-columns: auto minmax(80px, 1fr) auto;
  gap: 14px;
  align-items: center;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.16em;
  color: ${({ theme }) => theme.colors.textFaint};

  &::before {
    content: '';
    height: 1px;
    background: ${({ theme }) => theme.colors.accent};
    transform-origin: left;
    animation: field-progress 1.1s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  @keyframes field-progress {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
`;

export function LaunchIntro({ ready }: { ready: boolean }) {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => setMounted(false), 600);
    return () => window.clearTimeout(timer);
  }, [ready]);

  if (!mounted) return null;

  return (
    <Screen
      $leaving={ready}
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <Mark aria-hidden="true">
        <Name>VICTOR HUGO</Name>
        <Statement>
          Backend systems, product thinking and interfaces built as one.
        </Statement>
      </Mark>
      <Status aria-hidden="true">
        <span>INITIALIZING FIELD</span>
        <span>V1</span>
      </Status>
    </Screen>
  );
}
