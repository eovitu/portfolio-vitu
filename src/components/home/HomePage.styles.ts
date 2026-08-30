import styled from 'styled-components';

export const Hero = styled.section`
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  align-items: end;
  padding: 132px ${({ theme }) => theme.space.gutter} 54px;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: radial-gradient(
      circle at 68% 48%,
      transparent 0 22%,
      rgba(8, 8, 10, 0.15) 48%,
      #08080a 82%
    );
    pointer-events: none;
  }

  ${({ theme }) => theme.media.mobile} {
    padding: 118px 20px 34px;
  }
`;

export const HeroGrid = styled.div`
  width: min(100%, 1500px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.55fr);
  gap: clamp(40px, 8vw, 140px);
  align-items: end;

  ${({ theme }) => theme.media.belowTablet} {
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
  max-width: 9ch;
  font-size: clamp(58px, 9.5vw, 158px);
  line-height: 0.82;
  letter-spacing: -0.075em;
  font-weight: 500;

  span {
    display: block;
  }
`;

export const HeroAside = styled.div`
  display: grid;
  gap: 28px;
  padding-bottom: 8px;
`;

export const HeroCopy = styled.p`
  margin: 0;
  max-width: 36ch;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: clamp(18px, 1.6vw, 24px);
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
  border: 1px solid
    ${({ theme, $primary }) => ($primary ? theme.colors.text : theme.colors.border)};
  background: ${({ theme, $primary }) => ($primary ? theme.colors.text : 'transparent')};
  color: ${({ theme, $primary }) => ($primary ? theme.colors.bg : theme.colors.text)};
  font: 400 11px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.13em;
  text-transform: uppercase;
  transition:
    transform 180ms ease,
    background 180ms ease;

  &:hover {
    transform: translateY(-2px);
    color: ${({ theme, $primary }) => ($primary ? theme.colors.bg : theme.colors.text)};
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

export const ProjectList = styled.div`
  display: grid;
  gap: clamp(96px, 14vw, 210px);
`;

export const Project = styled.article`
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(300px, 0.72fr);
  gap: clamp(32px, 6vw, 96px);
  align-items: center;

  &:nth-child(even) > div:first-child {
    order: 2;
  }

  ${({ theme }) => theme.media.belowDesktop} {
    grid-template-columns: 1fr;
    &:nth-child(even) > div:first-child {
      order: 0;
    }
  }
`;

export const MediaFrame = styled.div`
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bgPanel};
  border: 1px solid ${({ theme }) => theme.colors.line};

  video,
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: inset 0 0 100px rgba(8, 8, 10, 0.24);
  }
`;

export const ProjectCopy = styled.div`
  display: grid;
  gap: 22px;

  h3 {
    margin: 0;
    font-size: clamp(42px, 5vw, 78px);
    line-height: 0.92;
    letter-spacing: -0.055em;
    font-weight: 500;
  }

  > p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 18px;
    line-height: 1.55;
  }
`;

export const Meta = styled.dl`
  margin: 8px 0 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  div {
    border-top: 1px solid ${({ theme }) => theme.colors.line};
    padding-top: 12px;
  }
  dt {
    color: ${({ theme }) => theme.colors.textFaint};
    font: 400 10px/1 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.16em;
  }
  dd {
    margin: 8px 0 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 14px;
    line-height: 1.4;
  }
`;

export const Ownership = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  color: ${({ theme }) => theme.colors.textMuted};
  font: 400 11px/1.4 ${({ theme }) => theme.fonts.mono};

  li::before {
    content: '↳ ';
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const Profile = styled(Section)`
  background: ${({ theme }) => theme.colors.paper};
  color: ${({ theme }) => theme.colors.ink};
`;

export const CapabilityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid ${({ theme }) => theme.colors.inkLine};

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const Capability = styled.article`
  min-height: 260px;
  padding: 30px 30px 36px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.inkLine};

  &:nth-child(odd) {
    border-right: 1px solid ${({ theme }) => theme.colors.inkLine};
  }
  &:nth-child(even) {
    padding-left: 30px;
  }

  h3 {
    margin: 0 0 18px;
    font-size: clamp(28px, 3vw, 48px);
    letter-spacing: -0.04em;
    font-weight: 500;
  }
  p {
    margin: 0;
    max-width: 42ch;
    color: ${({ theme }) => theme.colors.inkMuted};
    line-height: 1.6;
  }
  small {
    display: block;
    margin-top: 36px;
    font: 400 11px/1.6 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  ${({ theme }) => theme.media.mobile} {
    min-height: 0;
    padding: 26px 0 !important;
    border-right: 0 !important;
  }
`;

export const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(260px, 0.75fr) minmax(0, 1.1fr);
  gap: clamp(42px, 9vw, 150px);
  align-items: center;

  img {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    filter: grayscale(1) contrast(1.08);
  }
  h2 {
    margin: 0;
    font-size: clamp(44px, 7vw, 108px);
    line-height: 0.88;
    letter-spacing: -0.065em;
    font-weight: 500;
  }
  p {
    max-width: 49ch;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 18px;
    line-height: 1.65;
  }
  ${({ theme }) => theme.media.belowDesktop} {
    grid-template-columns: 1fr;
  }
`;

export const Contact = styled(Section)`
  min-height: 82vh;
  display: grid;
  align-items: end;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
`;

export const ContactTitle = styled.h2`
  margin: 0 0 46px;
  max-width: 11ch;
  font-size: clamp(54px, 9vw, 144px);
  line-height: 0.84;
  letter-spacing: -0.075em;
  font-weight: 500;
`;

export const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  padding-top: 28px;

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.6;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 26px;
    font: 400 11px/1 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;
