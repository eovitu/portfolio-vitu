import styled from 'styled-components';

export const Hero = styled.section`
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  align-items: end;
  padding: 180px ${({ theme }) => theme.space.gutter} 54px;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: radial-gradient(
      ellipse at 78% 35%,
      transparent 0 18%,
      rgba(8, 8, 10, 0.5) 39%,
      #08080a 70%
    );
    pointer-events: none;
  }

  ${({ theme }) => theme.media.mobile} {
    padding: 118px 20px 34px;
    &::after {
      background: radial-gradient(
        ellipse at 62% 50%,
        rgba(8, 8, 10, 0.6),
        rgba(8, 8, 10, 0.8) 45%,
        #08080a 75%
      );
    }
  }
`;

export const HeroNote = styled.a`
  position: absolute;
  right: ${({ theme }) => theme.space.gutter};
  top: 140px;
  display: grid;
  gap: 8px;
  text-align: right;
  font-size: 22px;
  letter-spacing: -0.04em;
  span {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 5px;
    color: #b7b7ae;
    font-size: 13px;
    letter-spacing: 0;
    svg {
      width: 14px;
      height: 14px;
      stroke-width: 1.75;
    }
  }
  &:hover span {
    color: #d7ef92;
  }
  @media (max-width: 700px) {
    display: none;
  }
`;

export const HeroGrid = styled.div`
  width: min(100%, 1500px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.55fr);
  gap: clamp(24px, 3vw, 60px);
  align-items: end;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

export const Kicker = styled.p`
  margin: 0 0 24px;
  color: ${({ theme }) => theme.colors.accent};
  font: 400 12px/1.4 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

export const HeroTitle = styled.h1`
  margin: 0;
  max-width: none;
  font-size: clamp(68px, 11.8vw, 190px);
  line-height: 0.91;
  letter-spacing: -0.075em;
  font-weight: 500;
  @media (max-width: 900px) {
    font-size: clamp(64px, 13.4vw, 122px);
  }
`;

export const HeroLines = styled.span`
  display: block;
`;

/**
 * The outer transform channel.
 *
 * Entrance and exit write here, and nothing else ever does. The inner glyph
 * carries the gravity field on its own node, so the two forces compose through
 * the DOM instead of fighting over one matrix. Splitting them here rather than
 * multiplying them in JavaScript is what keeps a stranded transform impossible:
 * each node has exactly one author.
 */
export const HeroWord = styled.span`
  display: block;
  transform-origin: 0% 50%;
  white-space: nowrap;
  &:nth-child(2) {
    color: #ff9b6a;
  }
  &:nth-child(3) {
    color: #d7ef92;
    font-style: italic;
    padding-right: 0.1em;
  }
`;

/** The inner transform channel: `hooks/useGravityLetters` and no one else. */
export const HeroGlyph = styled.span`
  display: inline-block;
  white-space: pre;
  &[data-space] {
    width: 0.28em;
    letter-spacing: 0;
  }
`;

export const HeroAside = styled.div`
  display: grid;
  gap: 28px;
  padding-bottom: 8px;
  position: relative;
  > svg {
    color: #d7ef92;
    stroke-width: 1.75;
  }
`;

export const HeroCopy = styled.p`
  margin: 0;
  max-width: 36ch;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: clamp(17px, 1.4vw, 21px);
  line-height: 1.45;
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

export const Action = styled.a<{ $primary?: boolean }>`
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 100px;
  border: 1px solid
    ${({ $primary }) => ($primary ? 'var(--button-fill, #d7ef92)' : 'currentColor')};
  background: ${({ $primary }) => ($primary ? 'var(--button-fill, #d7ef92)' : 'transparent')};
  color: ${({ $primary }) => ($primary ? 'var(--button-ink, #172014)' : 'var(--local-ink, #e9e7e2)')};
  font: 400 11px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.13em;
  text-transform: uppercase;
  transition:
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
    background 180ms ease,
    color 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;

  svg {
    width: 16px;
    height: 16px;
    margin-left: 10px;
    transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  &:hover {
    transform: translateY(-3px);
    color: ${({ $primary }) => ($primary ? 'var(--button-ink, #172014)' : 'var(--local-ink, #e9e7e2)')};
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.22);
  }

  &:hover svg {
    transform: translate(3px, -3px);
  }
  &:active {
    transform: translateY(-1px) scale(0.98);
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.18);
  }
`;

export const Section = styled.section`
  position: relative;
  padding: clamp(96px, 12vw, 180px) ${({ theme }) => theme.space.gutter};

  ${({ theme }) => theme.media.mobile} {
    padding-inline: 20px;
  }
`;

export const SectionInner = styled.div`
  width: min(100%, 1500px);
  margin: 0 auto;
`;

export const SectionHead = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.65fr) minmax(300px, 1fr);
  gap: 32px;
  align-items: end;
  margin-bottom: clamp(54px, 8vw, 110px);

  h2 {
    margin: 0;
    max-width: 11ch;
    font-size: clamp(44px, 7vw, 104px);
    line-height: 0.9;
    letter-spacing: -0.065em;
    font-weight: 500;
  }

  p {
    margin: 0;
    max-width: 48ch;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 18px;
    line-height: 1.55;
  }

  ${({ theme }) => theme.media.belowDesktop} {
    grid-template-columns: 1fr;
  }
`;

export const Profile = styled(Section)`
  background: #243cce;
  color: #f3f0e8;
  ${Kicker} {
    color: #d7ef92;
  }
  ${SectionHead} {
    grid-template-columns: 1.5fr 1fr;
    h2 {
      max-width: 16ch;
      font-size: clamp(48px, 6.4vw, 100px);
    }
    p {
      color: #e2e5ff;
    }
    @media (max-width: 860px) {
      grid-template-columns: 1fr;
    }
  }
`;

export const CapabilityGrid = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr;
  gap: 16px;

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const Capability = styled.article`
  padding: 32px;
  background: #1d30a7;
  border-radius: 8px;
  > svg {
    display: block;
    width: 50px;
    height: 50px;
    stroke-width: 1.75;
    color: #d7ef92;
    margin-bottom: 44px;
  }
  &:first-child {
    grid-row: span 2;
    display: flex;
    flex-direction: column;
    background: #d7ef92;
    color: #172014;
  }
  &:first-child > svg {
    color: #172014;
    width: 100px;
    height: 100px;
    margin-bottom: auto;
    padding-bottom: 60px;
  }
  &:first-child p {
    color: #35402a;
  }
  &:last-child {
    grid-column: 2 / 4;
  }

  h3 {
    margin: 0 0 18px;
    font-size: clamp(25px, 2.5vw, 40px);
    letter-spacing: -0.04em;
    font-weight: 500;
  }
  p {
    margin: 0;
    max-width: 42ch;
    color: #e2e5ff;
    line-height: 1.6;
  }
  small {
    display: block;
    margin-top: 36px;
    font: 400 11px/1.6 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  @media (max-width: 760px) {
    min-height: 0;
    padding: 28px;
    grid-column: 1 / -1 !important;
    grid-row: auto !important;
    > svg,
    &:first-child > svg {
      width: 42px;
      height: 42px;
      margin-bottom: 24px;
      padding: 0;
    }
  }
`;

export const About = styled(Section)`
  background: #f2b7a3;
  color: #2b231e;
  overflow: clip;
  ${Kicker} {
    color: #58362b;
  }
`;

export const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 0.65fr) minmax(0, 1.4fr);
  gap: clamp(42px, 6vw, 110px);
  align-items: center;

  figure {
    margin: 0;
    padding: 14px 14px 24px;
    background: #f5f0e5;
    rotate: -5deg;
  }
  figcaption {
    margin-top: 16px;
    font-size: 14px;
    color: #44392d;
    text-align: center;
  }
  img {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
  }
  h2 {
    margin: 0;
    font-size: clamp(44px, 6.4vw, 102px);
    line-height: 0.88;
    letter-spacing: -0.065em;
    font-weight: 500;
  }
  p {
    max-width: 49ch;
    color: #49372e;
    font-size: 18px;
    line-height: 1.65;
  }
  ${({ theme }) => theme.media.belowDesktop} {
    grid-template-columns: 1fr;
    figure {
      width: min(75%, 360px);
      margin: 0 auto 20px;
    }
  }
`;

export const ContactEmail = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  position: relative;
  z-index: 5;
  margin-top: auto;
  padding: 24px 0;
  border-top: 1px solid #a6bc72;
  color: #d7ef92;
  background: #08080a;
  font-size: clamp(24px, 5.7vw, 90px);
  letter-spacing: -0.055em;
  &:hover {
    color: #ff9b6a;
  }
  svg {
    width: 0.85em;
    height: 0.85em;
    transition: transform 240ms ease;
  }
  &:hover svg {
    transform: rotate(45deg);
  }
`;

export const Contact = styled(Section)`
  min-height: 100svh;
  display: flex;
  align-items: stretch;
  padding-bottom: 24px;

  > ${SectionInner} {
    min-height: calc(100svh - clamp(96px, 12vw, 180px) - 24px);
    display: flex;
    flex-direction: column;
  }

  ${({ theme }) => theme.media.mobile} {
    padding-bottom: 20px;
  }
`;

export const ContactTitle = styled.h2`
  margin: clamp(60px, 10vh, 140px) 0 46px;
  max-width: 11ch;
  font-size: clamp(54px, 9vw, 144px);
  line-height: 0.84;
  letter-spacing: -0.075em;
  font-weight: 500;

  ${({ theme }) => theme.media.mobile} {
    margin-top: 60px;
    margin-bottom: 34px;
  }
`;

export const ContactWord = styled.span`
  display: block;
  transform: translate3d(
      calc(var(--contact-collapse, 0) * var(--consume-x, 0px)),
      calc(var(--contact-collapse, 0) * var(--consume-y, 0px)),
      0
    )
    rotate(calc(var(--contact-collapse, 0) * var(--consume-rotate, 0deg)))
    scale(calc(1 - var(--contact-collapse, 0) * 0.96));
  transform-origin: 50% 50%;
  opacity: clamp(0, calc((1 - var(--contact-collapse, 0)) * 5), 1);
  will-change: transform, opacity;
  transition: opacity 80ms linear;
  @media (prefers-reduced-motion: reduce) {
    transform: none;
    opacity: 1;
    will-change: auto;
  }

  &:nth-child(1) {
    --consume-rotate: -12deg;
  }
  &:nth-child(2) {
    --consume-rotate: 9deg;
  }
  &:nth-child(3) {
    --consume-rotate: -7deg;
  }
`;
