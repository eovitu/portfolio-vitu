import styled from 'styled-components';

export const Page = styled.main`
  position: relative;
  z-index: 1;
  background: ${({ theme }) => theme.colors.bg};
`;

export const Hero = styled.header`
  min-height: 82vh;
  display: grid;
  align-items: end;
  padding: 150px ${({ theme }) => theme.space.gutter} 62px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};

  ${({ theme }) => theme.media.mobile} {
    padding: 128px 20px 38px;
  }
`;

export const Width = styled.div`
  width: min(100%, 1500px);
  margin: 0 auto;
`;

export const Back = styled.a`
  display: inline-flex;
  margin-bottom: clamp(54px, 10vh, 110px);
  color: ${({ theme }) => theme.colors.textMuted};
  font: 400 11px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

export const Eyebrow = styled.p`
  margin: 0 0 22px;
  color: ${({ theme }) => theme.colors.accent};
  font: 400 12px/1.4 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.16em;
  text-transform: uppercase;
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
    color: ${({ theme }) => theme.colors.textMuted};
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
    color: ${({ theme }) => theme.colors.textFaint};
    font: 400 10px/1 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  dd {
    margin: 8px 0 0;
    color: ${({ theme }) => theme.colors.textMuted};
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
  margin: clamp(72px, 10vw, 150px) auto 0;
  aspect-ratio: 16 / 10;
  border: 1px solid ${({ theme }) => theme.colors.line};
  background: ${({ theme }) => theme.colors.bgPanel};
  overflow: hidden;

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

export const Body = styled.section`
  padding: clamp(90px, 12vw, 180px) ${({ theme }) => theme.space.gutter};
  ${({ theme }) => theme.media.mobile} {
    padding-inline: 20px;
  }
`;

export const Sections = styled.div`
  width: min(100%, 1120px);
  margin: 0 auto;
  display: grid;
`;

export const Section = styled.section`
  display: grid;
  grid-template-columns: minmax(180px, 0.42fr) minmax(0, 1fr);
  gap: 36px;
  padding: clamp(42px, 7vw, 84px) 0;
  border-top: 1px solid ${({ theme }) => theme.colors.line};

  h2 {
    margin: 0;
    font: 400 12px/1.4 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.accent};
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
  margin: 0 auto clamp(92px, 12vw, 170px);
  padding: clamp(36px, 6vw, 76px);
  color: ${({ theme }) => theme.colors.ink};
  background: ${({ theme }) => theme.colors.paper};

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
  border-top: 1px solid ${({ theme }) => theme.colors.line};

  a {
    min-height: 220px;
    padding: 34px ${({ theme }) => theme.space.gutter};
    display: grid;
    align-content: end;
    border-right: 1px solid ${({ theme }) => theme.colors.line};
  }
  small {
    color: ${({ theme }) => theme.colors.textFaint};
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
      border-bottom: 1px solid ${({ theme }) => theme.colors.line};
    }
  }
`;
