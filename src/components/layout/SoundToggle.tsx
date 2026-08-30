import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAnimationFrame } from '../../hooks/useSmoothScroll';
import { horizonProgress } from '../../lib/horizon';
import { disposeAudio, readStoredPreference, setHorizon, setSound } from '../../lib/audio';

/**
 * Sound, off by default.
 *
 * Deliberately small and unlabelled beyond its accessible name: the sound is
 * an option, not a feature the page argues for. The preference lives in
 * `sessionStorage`, so it survives the staged reload but never follows the
 * reader into a new visit — an unexpected drone on a cold load is the exact
 * failure this control exists to prevent.
 */
const Button = styled.button`
  position: fixed;
  left: 22px;
  bottom: 20px;
  z-index: ${({ theme }) => theme.z.progress};
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  padding: 6px;
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 9px;
  letter-spacing: 0.24em;
  color: ${({ theme }) => theme.colors.textTrace};
  transition: color 0.3s ease;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &[aria-pressed='true'] {
    color: var(--accent);
  }

  ${({ theme }) => theme.media.mobile} {
    display: none;
  }

  ${({ theme }) => theme.media.touch} {
    display: none;
  }

  ${({ theme }) => theme.media.landscapeMobile} {
    display: none;
  }
`;

/** Three bars; they only animate while the sound is actually on. */
const Bars = styled.span`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 10px;

  i {
    width: 2px;
    height: 3px;
    background: currentColor;
  }

  [aria-pressed='true'] & i {
    animation: bar 1.1s ease-in-out infinite;
  }

  [aria-pressed='true'] & i:nth-child(2) {
    animation-delay: 0.18s;
  }

  [aria-pressed='true'] & i:nth-child(3) {
    animation-delay: 0.36s;
  }

  @keyframes bar {
    0%,
    100% {
      height: 3px;
    }
    50% {
      height: 10px;
    }
  }

  ${({ theme }) => theme.media.reduce} {
    i {
      animation: none !important;
    }
  }
`;

export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    // Read the stored preference but never act on it: the AudioContext is only
    // ever created from a real gesture, so a stored "on" shows the control in
    // its on state and waits for the reader to confirm by clicking.
    if (readStoredPreference()) setOn(false);
    // This control owns the engine's whole lifetime — it is the only thing
    // that can build one — so it is also what releases it. Without this the
    // AudioContext outlives the tree on unmount and on every hot reload,
    // and browsers cap how many a page may hold open.
    return () => disposeAudio();
  }, []);

  useAnimationFrame(() => {
    if (on) setHorizon(horizonProgress());
  }, on);

  return (
    <Button
      type="button"
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      onClick={() => {
        const next = !on;
        setOn(next);
        setSound(next);
      }}
    >
      <Bars aria-hidden="true">
        <i />
        <i />
        <i />
      </Bars>
      {on ? 'SOUND' : 'MUTED'}
    </Button>
  );
}
