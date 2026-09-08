import styled from 'styled-components';

export const Page = styled.main`
  position: relative;
  z-index: 1;
  background: var(--surface);
  color: var(--ink);
  &[data-layout='editorial'] h1 {
    font-family: Georgia, serif;
    font-style: italic;
    font-weight: 400;
    letter-spacing: -0.07em;
  }
  &[data-layout='flow'] h1 {
    color: #e99569;
  }
  &[data-layout='organic'] h1 {
    color: #c5edad;
  }
`;

export const Hero = styled.header`
  /*
   * Sized by its content, not by the viewport.
   *
   * 82vh plus 150px of top padding plus the back link's own 110px margin
   * put roughly 190px of empty black between the fixed header and the first
   * word of the case, measured at 1440x900 before this was cut. The header
   * bar is 68px, so the top padding only needs to clear it and breathe.
   */
  display: grid;
  align-items: end;
  padding: 118px ${({ theme }) => theme.space.gutter} 62px;
  border-bottom: 1px solid var(--line);

  ${({ theme }) => theme.media.mobile} {
    padding: 104px 20px 38px;
  }
`;

export const Width = styled.div`
  width: min(100%, 1500px);
  margin: 0 auto;
`;

export const Back = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: clamp(28px, 4vh, 48px);
  color: var(--ink-muted);
  font: 400 11px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.14em;
  text-transform: uppercase;
  svg {
    width: 16px;
    height: 16px;
    stroke-width: 1.75;
  }
`;

export const Eyebrow = styled.p`
  margin: 0 0 22px;
  color: var(--accent);
  font: 400 12px/1.4 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.16em;
  text-transform: uppercase;
  span {
    display: inline-block;
    margin-left: 16px;
    padding: 6px 10px;
    border: 1px solid currentColor;
    border-radius: 100px;
  }
`;

export const Title = styled.h1`
  margin: 0;
  max-width: 12ch;
  font-size: clamp(64px, 12vw, 190px);
  line-height: 0.82;
  letter-spacing: -0.08em;
  font-weight: 500;
`;

export const Thesis = styled.div`
  margin-top: 54px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.6fr);
  gap: 42px;
  align-items: end;

  p {
    margin: 0;
    max-width: 56ch;
    color: var(--ink-muted);
    font-size: clamp(18px, 2vw, 28px);
    line-height: 1.45;
  }
  dl {
    margin: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
  dt {
    color: var(--ink-faint);
    font: 400 10px/1 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  dd {
    margin: 8px 0 0;
    color: var(--ink-muted);
    font-size: 14px;
    line-height: 1.4;
  }
  ${({ theme }) => theme.media.belowDesktop} {
    grid-template-columns: 1fr;
  }
`;

export const Media = styled.figure`
  position: relative;
  width: min(calc(100% - 64px), 1500px);
  margin: clamp(44px, 6vw, 90px) auto;
  aspect-ratio: 16 / 9;
  /*
   * No border. The film is already a screen recording inside a browser
   * inside a tablet mockup; a hairline around it reads as a fourth frame
   * nobody chose, which is exactly what makes a composition look accidental.
   */
  background: var(--panel);
  overflow: hidden;
  border-radius: 12px;
  [data-layout='editorial'] & {
    width: min(calc(100% - 80px), 1200px);
    rotate: -2deg;
    box-shadow: 18px 20px 0 #d98c8c;
    margin-bottom: 110px;
  }
  [data-layout='organic'] & {
    width: min(calc(100% - 64px), 1000px);
  }

  video,
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  img {
    position: absolute;
    inset: 0;
  }
  video {
    position: relative;
    z-index: 1;
  }
  ${({ theme }) => theme.media.mobile} {
    width: calc(100% - 40px);
  }
`;

/**
 * The film's own controls, floating inside the media rather than framing it.
 *
 * Transform and opacity only, and always reachable: the bar is visible on
 * hover, on focus within, and whenever the film is paused, so it never
 * becomes a control the reader has to discover.
 */
export const Controls = styled.div`
  --ink: #f2eee6;
  --ink-muted: #d9d4cd;
  --border: #8e8d88;
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: linear-gradient(to top, rgba(8, 8, 10, 0.86), rgba(8, 8, 10, 0));
  opacity: 0;
  transform: translate3d(0, 8px, 0);
  transition:
    opacity 260ms ease,
    transform 260ms cubic-bezier(0.16, 1, 0.36, 1);

  figure:hover &,
  figure:focus-within &,
  figure[data-playing='false'] & {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    opacity: 1;
    transform: none;
  }

  ${({ theme }) => theme.media.mobile} {
    gap: 10px;
    padding: 10px 12px;
  }
`;

export const ControlButton = styled.button`
  flex: none;
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border: 1px solid var(--border);
  background: rgba(8, 8, 10, 0.6);
  color: var(--ink);
  font: 400 10px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.14em;
  cursor: pointer;
  transition: border-color 180ms ease;

  &:hover,
  &:focus-visible {
    border-color: var(--ink);
  }
`;

export const Seek = styled.input`
  flex: 1 1 auto;
  min-width: 0;
  height: 44px;
  appearance: none;
  background: transparent;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: 2px;
    background: var(--border);
  }
  &::-moz-range-track {
    height: 2px;
    background: var(--border);
  }
  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    margin-top: -5px;
    border-radius: 50%;
    background: var(--ink);
  }
  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border: 0;
    border-radius: 50%;
    background: var(--ink);
  }
  &:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 4px;
  }
`;

export const Time = styled.span`
  flex: none;
  color: var(--ink-muted);
  font: 400 10px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;

  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

export const Body = styled.section`
  padding: clamp(90px, 12vw, 180px) ${({ theme }) => theme.space.gutter};
  ${({ theme }) => theme.media.mobile} {
    padding-inline: 20px;
  }
`;

export const Loading = styled.p`
  padding: 48px ${({ theme }) => theme.space.gutter};
  color: var(--ink-muted);
`;

export const ExternalActions = styled.div`
  width: min(100%, 1120px);
  margin: 32px auto 0;
  display: flex;
  gap: 24px;
  a {
    display: inline-flex;
    min-height: 48px;
    padding: 14px 22px;
    border: 1px solid currentColor;
    border-radius: 100px;
  }
  a:hover {
    background: var(--ink);
    color: var(--surface);
  }
`;

export const Sections = styled.div`
  width: min(100%, 1120px);
  margin: 0 auto;
  display: grid;
  [data-layout='editorial'] & {
    width: min(100%, 1280px);
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 40px;
    @media (max-width: 860px) {
      grid-template-columns: 1fr;
    }
  }
`;

export const Section = styled.section`
  display: grid;
  grid-template-columns: minmax(180px, 0.42fr) minmax(0, 1fr);
  gap: 36px;
  padding: clamp(42px, 7vw, 84px) 0;
  border-top: 1px solid var(--line);
  [data-layout='editorial'] & {
    display: block;
    h2 {
      font-family: Georgia, serif;
      font-size: 32px;
      letter-spacing: -0.03em;
      text-transform: none;
      font-style: italic;
      margin-bottom: 30px;
    }
    p {
      font-size: 21px;
      line-height: 1.55;
    }
  }

  h2 {
    margin: 0;
    font: 400 12px/1.4 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
  }
  p {
    margin: 0;
    max-width: 52ch;
    font-size: clamp(22px, 3vw, 38px);
    line-height: 1.32;
    letter-spacing: -0.025em;
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const Outcome = styled.div`
  width: min(100%, 1120px);
  margin: 48px auto 0;
  padding: clamp(36px, 6vw, 76px);
  /* The one inverted block on the page. Written from the surface tokens so it
     flips with the ground instead of being a hardcoded light panel that turns
     invisible on the cream case. */
  color: var(--surface);
  background: var(--ink);
  [data-layout='flow'] & {
    background: #e99569;
    color: #302218;
  }
  [data-layout='organic'] & {
    background: #c5edad;
    color: #193825;
    border-radius: 48px 48px 48px 0;
  }

  span {
    font: 400 11px/1 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  p {
    margin: 28px 0 0;
    max-width: 34ch;
    font-size: clamp(28px, 4vw, 58px);
    line-height: 1.08;
    letter-spacing: -0.04em;
  }
`;

export const Nav = styled.nav`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--line);

  a {
    min-height: 220px;
    padding: 34px ${({ theme }) => theme.space.gutter};
    display: grid;
    align-content: end;
    border-right: 1px solid var(--line);
    transition:
      background 220ms ease,
      color 220ms ease;
    &:hover {
      background: var(--ink);
      color: var(--surface);
    }
    &:hover small {
      color: inherit;
    }
  }
  small {
    color: var(--ink-faint);
    font: 400 10px/1 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  strong {
    margin-top: 16px;
    font-size: clamp(26px, 4vw, 58px);
    letter-spacing: -0.04em;
    font-weight: 500;
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
    a {
      min-height: 160px;
      padding-inline: 20px;
      border-bottom: 1px solid var(--line);
    }
  }
`;
