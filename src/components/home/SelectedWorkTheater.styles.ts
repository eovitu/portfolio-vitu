import styled, { keyframes } from 'styled-components';

const chapterArrival = keyframes`
  from { transform: translate3d(0, 42px, 0) rotate(1.2deg) scale(.97); }
  to { transform: translate3d(0, 0, 0) rotate(0) scale(1); }
`;

export const Theater = styled.section`
  position: relative;
  padding: clamp(72px, 9vw, 132px) 0 0;
  overflow: clip;
  --theater-velocity: 0;
  --theater-tilt: 0deg;
`;

export const Intro = styled.div`
  width: min(calc(100% - 64px), 1500px);
  margin: 0 auto clamp(42px, 5vw, 76px);
  display: grid;
  grid-template-columns: 1.4fr 0.6fr;
  gap: 40px;
  align-items: end;
  h2 {
    margin: 0;
    max-width: 14ch;
    font-size: clamp(48px, 7.5vw, 118px);
    line-height: 0.94;
    letter-spacing: -0.065em;
    font-weight: 500;
  }
  p {
    margin: 0;
    max-width: 40ch;
    color: #b9b9b0;
    font-size: 18px;
    line-height: 1.55;
  }
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 560px) {
    width: calc(100% - 40px);
  }
`;

export const TheaterRun = styled.div`
  margin: 0 auto;
  min-height: calc(3 * 110svh);
  &[data-enhanced='false'] {
    min-height: auto;
  }
`;

export const TheaterStage = styled.div`
  position: sticky;
  top: 0;
  min-height: 100svh;
  display: grid;
  isolation: isolate;
  [data-theater-run][data-enhanced='false'] & {
    position: relative;
    min-height: 0;
    display: block;
  }
`;

export const Chapter = styled.article`
  --local-ink: var(--chapter-ink);
  --button-fill: var(--chapter-ink);
  --button-ink: var(--chapter-color);
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr);
  gap: clamp(36px, 5vw, 86px);
  padding: 108px clamp(32px, 5vw, 90px) 100px;
  align-items: center;
  isolation: isolate;
  overflow: hidden;
  background: var(--chapter-color);
  color: var(--chapter-ink);
  visibility: hidden;
  pointer-events: none;
  &[data-active='true'] {
    visibility: visible;
    pointer-events: auto;
    animation: ${chapterArrival} 650ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  &[data-layout='editorial'] {
    grid-template-columns: 0.82fr 1.18fr;
    &::before {
      content: '';
      position: absolute;
      width: 60%;
      aspect-ratio: 1;
      background: #d98c8c;
      border-radius: 50%;
      right: -5%;
      top: 5%;
      z-index: -1;
    }
  }
  &[data-layout='organic'] {
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      opacity: 0.16;
      background-image:
        linear-gradient(#193825 1px, transparent 1px),
        linear-gradient(90deg, #193825 1px, transparent 1px);
      background-size: 72px 72px;
      mask-image: linear-gradient(90deg, black, transparent 58%);
    }
  }
  [data-theater-run][data-enhanced='false'] & {
    position: relative;
    inset: auto;
    min-height: 85svh;
    visibility: visible;
    pointer-events: auto;
    animation: none;
    padding-block: 64px;
  }
  @media (max-width: 1000px) {
    gap: 24px;
    padding-inline: 28px;
  }
  @media (max-width: 760px) {
    &,
    &[data-layout='editorial'] {
      grid-template-columns: 1fr;
      padding: 56px 20px;
    }
  }
`;

export const ChapterNumber = styled.span`
  position: absolute;
  top: 16%;
  left: 1%;
  z-index: -1;
  font-size: clamp(180px, 38vw, 620px);
  font-weight: 500;
  letter-spacing: -0.09em;
  line-height: 1;
  color: var(--chapter-ink);
  opacity: 0.09;
  [data-layout='editorial'] & {
    left: auto;
    right: 3%;
    font-style: italic;
  }
`;

export const Copy = styled.div`
  order: 2;
  position: relative;
  display: grid;
  gap: 18px;
  max-width: 580px;
  [data-layout='editorial'] & {
    order: 0;
  }
  h3 {
    margin: 0;
    font-size: clamp(48px, 6.8vw, 110px);
    line-height: 0.92;
    letter-spacing: -0.065em;
    font-weight: 500;
  }
  [data-layout='editorial'] & h3 {
    font-family: Georgia, serif;
    font-style: italic;
    font-weight: 400;
  }
  > p {
    margin: 0;
    font-size: 18px;
    line-height: 1.5;
    max-width: 40ch;
  }
  [data-project-kicker] {
    font: 400 12px/1.5 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  [data-project-meta] {
    display: grid;
    gap: 16px;
    grid-template-columns: 1fr;
  }
  dl {
    margin: 0;
  }
  dt {
    font: 400 11px/1.4 ${({ theme }) => theme.fonts.mono};
    text-transform: uppercase;
  }
  dd {
    margin: 6px 0 0;
    font-size: 12px;
    line-height: 1.5;
    max-width: 48ch;
  }
  ul {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 18px;
    padding: 0;
    margin: 0;
    font-size: 12px;
  }
  li::before {
    content: '↳ ';
  }
  @media (max-width: 760px) {
    &,
    [data-layout='editorial'] & {
      order: 0;
      max-width: none;
    }
    h3 {
      font-size: clamp(48px, 11vw, 80px);
    }
  }
  @media (max-height: 740px) and (min-width: 761px) {
    gap: 13px;
    h3 {
      font-size: clamp(48px, 6vw, 90px);
    }
    ul,
    [data-project-meta] {
      display: none;
    }
  }
`;

export const MediaSurface = styled.div`
  order: 1;
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--chapter-ink);
  border-radius: 10px;
  box-shadow:
    0 22px 0 -12px color-mix(in srgb, var(--chapter-ink) 20%, transparent),
    0 32px 64px -25px #0005;
  /* Layout motion owns this element's transform. CSS rotates via an independent property. */
  rotate: calc(-4deg + var(--theater-tilt, 0deg));
  [data-layout='editorial'] & {
    rotate: calc(4deg + var(--theater-tilt, 0deg));
    border-radius: 50% 50% 8px 8px / 12% 12% 8px 8px;
  }
  [data-layout='organic'] & {
    rotate: calc(-2deg + var(--theater-tilt, 0deg));
    border-radius: 24px;
  }
  img,
  video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  img {
    z-index: 2;
    transition: opacity 360ms ease;
  }
  video {
    z-index: 1;
    opacity: 0;
  }
  &[data-playing='true'] img {
    opacity: 0;
  }
  &[data-playing='true'] video {
    opacity: 1;
  }
  @media (max-width: 760px) {
    margin: 16px 8px 12px;
  }
  @media (prefers-reduced-motion: reduce) {
    rotate: 0;
  }
`;

export const Progress = styled.nav`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  display: flex;
  gap: 4px;
  padding: 5px;
  background: #08080a;
  border-radius: 100px;
  a {
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 44px;
    padding: 10px 16px;
    border-radius: 100px;
    color: #e9e7e2;
    white-space: nowrap;
    font-size: 12px;
    transition:
      background 180ms ease,
      color 180ms ease;
  }
  a[aria-current='step'] {
    background: #e9e7e2;
    color: #08080a;
  }
  a:hover {
    background: #d7ef92;
    color: #172014;
  }
  [data-theater-run][data-enhanced='false'] & {
    display: none;
  }
  @media (max-width: 760px) {
    a span:last-child {
      display: none;
    }
  }
`;
