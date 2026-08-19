import styled, { keyframes } from 'styled-components';
import { EASE_CSS } from '../../lib/motion';

export const Root = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.z.chat};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  transition: visibility 0s linear ${({ $open }) => ($open ? '0s' : '.8s')};
`;

export const Backdrop = styled.div<{ $open: boolean }>`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.colors.backdrop};
  backdrop-filter: blur(3px);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition: opacity 0.6s ${EASE_CSS};
`;

export const Panel = styled.aside<{ $open: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: min(460px, 100%);
  background: ${({ theme }) => theme.colors.bgElevated};
  border-left: 1px solid ${({ theme }) => theme.colors.line};
  display: flex;
  flex-direction: column;
  transform: translateX(${({ $open }) => ($open ? '0' : '101%')});
  transition: transform 0.8s ${EASE_CSS};

  ${({ theme }) => theme.media.reduce} {
    transition: none;
  }
`;

export const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.2em;
  color: ${({ theme }) => theme.colors.textFaint};

  h2 {
    margin: 0;
    font: inherit;
  }
`;

export const Close = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.textDim};
  font: inherit;
  letter-spacing: 0.2em;
  cursor: pointer;
  padding: 4px;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const Body = styled.div`
  padding: 32px 24px;
  display: grid;
  gap: 26px;
  align-content: start;
  overflow-y: auto;
  flex: 1;
  overscroll-behavior: contain;
`;

export const Intro = styled.p`
  margin: 0;
  font-size: 24px;
  line-height: 1.25;
  letter-spacing: -0.02em;
  font-weight: 300;
`;

export const Prompts = styled.div`
  display: grid;
  gap: 1px;
  background: ${({ theme }) => theme.colors.line};
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
`;

export const Prompt = styled.button`
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 0;
  text-align: left;
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.mono};
  letter-spacing: 0.1em;
  padding: 18px 4px;
  cursor: pointer;
  transition:
    color 0.3s ease,
    padding 0.35s ${EASE_CSS};

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.text};
    padding-left: 12px;
  }
`;

export const Note = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  line-height: 1.7;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.textGhost};
`;

export const Thread = styled.div`
  display: grid;
  gap: 20px;
`;

/**
 * Each new message arrives instead of appearing — a short fade-and-rise, run
 * as a plain CSS animation rather than GSAP: it fires once per mount with no
 * scroll/frame coupling to coordinate, so the ticker would be overkill.
 * `theme.media.reduce` (GlobalStyle) already floors every animation-duration
 * under prefers-reduced-motion, so no extra gating is needed here.
 */
const messageIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Message = styled.div<{ $from: 'user' | 'bot' }>`
  display: grid;
  gap: 8px;
  animation: ${messageIn} 0.4s ${EASE_CSS} both;

  small {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: ${({ theme }) => theme.type.monoSm};
    letter-spacing: 0.2em;
    color: ${({ theme, $from }) =>
      $from === 'user' ? theme.colors.textGhost : theme.colors.textDim};
  }

  p {
    margin: 0;
    font-size: ${({ $from }) => ($from === 'user' ? '15px' : '17px')};
    line-height: 1.6;
    color: ${({ theme, $from }) =>
      $from === 'user' ? theme.colors.textDim : theme.colors.text};
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
`;

/** The pending "···" — breathing rather than static, so waiting reads as the
 *  other side typing instead of the thread being stalled. */
export const Typing = styled.p`
  animation: ${pulse} 1.1s ease-in-out infinite;
`;

export const Form = styled.form`
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  padding: 18px 24px;
  display: flex;
  gap: 14px;
  align-items: center;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.mono};
  letter-spacing: 0.12em;

  > span {
    color: ${({ theme }) => theme.colors.text};
  }

  input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: 0;
    color: ${({ theme }) => theme.colors.text};
    font: inherit;
    letter-spacing: inherit;
    text-transform: uppercase;
    padding: 4px 0;

    &::placeholder {
      color: ${({ theme }) => theme.colors.textGhost};
    }
    &:focus {
      outline: none;
    }
  }
`;
