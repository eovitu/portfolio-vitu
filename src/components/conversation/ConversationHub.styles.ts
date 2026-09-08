import { motion } from 'motion/react';
import styled from 'styled-components';

export const Trigger = styled.button`
  min-height: 48px;
  padding: 12px 18px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--ink);
  font: 400 11px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.16em;
  text-transform: uppercase;
  touch-action: manipulation;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  svg {
    width: 15px;
    height: 15px;
    stroke-width: 1.75;
  }
  transition:
    color 180ms ease,
    border-color 180ms ease,
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1);

  &:hover,
  &:focus-visible {
    color: var(--accent);
    border-color: var(--accent);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }

  &:active {
    transform: translateY(0) scale(0.97);
  }
`;

export const Layer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 140;
`;

export const Backdrop = styled(motion.button)`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: rgba(3, 3, 5, 0.78);
  cursor: default;
`;

export const Panel = styled(motion.aside)`
  position: absolute;
  inset: 0 0 0 auto;
  width: min(540px, 42vw);
  height: 100dvh;
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr) auto;
  overflow: hidden;
  color: var(--ink);
  background: var(--panel);
  border-left: 1px solid var(--border);
  box-shadow: -32px 0 90px rgba(0, 0, 0, 0.32);

  ${({ theme }) => theme.media.belowDesktop} {
    width: min(620px, 82vw);
  }

  ${({ theme }) => theme.media.mobile} {
    width: 100%;
    border-left: 0;
  }
`;

export const Top = styled.header`
  min-height: 70px;
  padding: max(16px, env(safe-area-inset-top)) 24px 14px;
  display: flex;
  align-items: center;
  gap: 18px;
  border-bottom: 1px solid var(--line);
  font: 400 10px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.18em;
  text-transform: uppercase;

  > span {
    color: var(--accent);
  }

  ${({ theme }) => theme.media.mobile} {
    padding-inline: max(18px, env(safe-area-inset-left));

    > span {
      margin-left: auto;
    }
  }
`;

export const Close = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 44px;
  margin-left: auto;
  padding: 8px 0 8px 14px;
  border: 0;
  background: transparent;
  color: var(--ink-muted);
  font: inherit;
  letter-spacing: inherit;
  text-transform: uppercase;
  touch-action: manipulation;
  svg {
    width: 15px;
    height: 15px;
    stroke-width: 1.75;
  }
  transition:
    color 160ms ease,
    transform 160ms cubic-bezier(0.22, 1, 0.36, 1);

  &:hover,
  &:focus-visible {
    color: var(--ink);
    transform: translateX(-3px);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }

  ${({ theme }) => theme.media.mobile} {
    order: -1;
    margin: 0;
    padding: 8px 14px 8px 0;
  }
`;

export const Intro = styled.div`
  padding: clamp(26px, 5vh, 48px) 24px 24px;
  border-bottom: 1px solid var(--line);

  h2 {
    max-width: 16ch;
    margin: 0;
    font-size: clamp(24px, 2.3vw, 36px);
    line-height: 1.08;
    letter-spacing: -0.04em;
    font-weight: 500;
    text-wrap: balance;
  }

  p {
    max-width: 42ch;
    margin: 18px 0 0;
    color: var(--ink-muted);
    line-height: 1.55;
  }
`;

export const Prompts = styled.div`
  display: grid;
  padding-inline: 24px;
  border-bottom: 1px solid var(--line);

  button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 50px;
    padding: 14px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    border: 0;
    border-bottom: 1px solid var(--line);
    background: transparent;
    color: var(--ink-muted);
    text-align: left;
    font: 400 10px/1.45 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.12em;
    text-transform: uppercase;
    touch-action: manipulation;
    svg {
      width: 15px;
      height: 15px;
      stroke-width: 1.75;
    }
    transition:
      color 160ms ease,
      padding-left 200ms cubic-bezier(0.22, 1, 0.36, 1);

    svg {
      width: 15px;
      height: 15px;
      flex: 0 0 auto;
      stroke-width: 1.75;
      color: var(--accent);
    }

    &:last-child {
      border-bottom: 0;
    }

    &:hover,
    &:focus-visible {
      padding-left: 8px;
      color: var(--ink);
    }

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: -2px;
    }

    &:disabled {
      cursor: wait;
      opacity: 0.5;
    }
  }
`;

export const Transcript = styled.div`
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 24px;
  display: grid;
  align-content: start;
  gap: 22px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
`;

export const Empty = styled.p`
  margin: 0;
  color: var(--ink-faint);
  font: 400 10px/1.7 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export const Message = styled(motion.article)<{ $visitor: boolean }>`
  width: min(92%, 430px);
  margin-left: ${({ $visitor }) => ($visitor ? 'auto' : '0')};
  padding: 0 0 0 14px;
  border-left: 1px solid
    ${({ $visitor }) => ($visitor ? 'var(--ink-faint)' : 'var(--accent)')};

  small {
    display: block;
    margin-bottom: 8px;
    color: ${({ $visitor }) => ($visitor ? 'var(--ink-faint)' : 'var(--accent)')};
    font: 400 9px/1 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    color: ${({ $visitor }) => ($visitor ? 'var(--ink)' : 'var(--ink-muted)')};
    line-height: 1.58;
    overflow-wrap: anywhere;
  }
`;

export const Typing = styled(motion.div)`
  color: var(--accent);
  font: 400 10px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.2em;
`;

export const Composer = styled.form`
  padding: 16px 24px max(18px, env(safe-area-inset-bottom));
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  border-top: 1px solid var(--line);
  background: var(--panel);

  &:focus-within {
    border-top-color: color-mix(in srgb, var(--accent) 55%, var(--surface));
  }

  input {
    min-width: 0;
    min-height: 44px;
    padding: 10px 0;
    border: 0;
    background: transparent;
    color: var(--ink);
    font: 400 11px/1.4 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.08em;

    &::placeholder {
      color: var(--ink-faint);
    }

    &:focus-visible {
      outline: 0;
    }

    ${({ theme }) => theme.media.mobile} {
      font-size: 16px;
    }
  }

  button {
    min-height: 44px;
    padding: 10px 0 10px 12px;
    border: 0;
    background: transparent;
    color: var(--accent);
    font: 400 10px/1 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.12em;
    text-transform: uppercase;
    touch-action: manipulation;

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 4px;
    }

    &:disabled {
      color: var(--ink-faint);
    }
  }
`;

export const Meta = styled.p`
  grid-column: 1 / -1;
  margin: 0;
  color: var(--ink-faint);
  font: 400 9px/1.4 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.12em;

  a {
    color: var(--ink-muted);
  }
`;

export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
