import styled from 'styled-components';

export const Page = styled.main`
  position: relative;
  z-index: 1;
  min-height: 100svh;
  display: grid;
  align-items: center;
  padding: 132px ${({ theme }) => theme.space.gutter} 84px;

  /*
   * A scrim over the reading column, not over the object.
   *
   * This is the one page where the accretion disc is meant to be seen, so the
   * site-wide veil would defeat the point, and it is scroll-owned shared
   * state that the intro also writes, which is not something a single page
   * should reach into. Instead the copy gets its own ground: opaque where the
   * words are, gone by the time it reaches the object on the right.
   */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background: linear-gradient(
      100deg,
      ${({ theme }) => theme.colors.bg} 0%,
      ${({ theme }) => theme.colors.bg} 34%,
      rgba(8, 8, 10, 0.86) 48%,
      rgba(8, 8, 10, 0.35) 62%,
      transparent 76%
    );
  }

  ${({ theme }) => theme.media.belowTablet} {
    &::before {
      background: linear-gradient(
        180deg,
        ${({ theme }) => theme.colors.bg} 0%,
        rgba(8, 8, 10, 0.9) 62%,
        rgba(8, 8, 10, 0.72) 100%
      );
    }
  }

  ${({ theme }) => theme.media.mobile} {
    padding: 108px 20px 64px;
  }
`;

export const Inner = styled.div`
  width: min(100%, 1100px);
  margin: 0 auto;
`;

/**
 * The number, held back on purpose.
 *
 * A 404 that shouts its own error code is a page about the error. This one is
 * about what happened to the page, so the code sits where a section label
 * sits everywhere else on the site.
 */
export const Code = styled.p`
  margin: 0 0 22px;
  color: #d7ef92;
  font: 500 clamp(100px, 18vw, 250px)/0.85 ${({ theme }) => theme.fonts.sans};
  letter-spacing: -0.08em;
`;

export const Title = styled.h1`
  margin: 0;
  max-width: 16ch;
  font-size: clamp(46px, 8vw, 124px);
  line-height: 0.88;
  letter-spacing: -0.06em;
  font-weight: 500;
`;

export const Body = styled.div`
  margin-top: clamp(28px, 4vw, 44px);
  display: grid;
  gap: 14px;
  max-width: 52ch;

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 18px;
    line-height: 1.55;
  }
`;

export const Path = styled.code`
  color: ${({ theme }) => theme.colors.text};
  font: 400 15px/1 ${({ theme }) => theme.fonts.mono};
  overflow-wrap: anywhere;
`;

export const Actions = styled.div`
  margin-top: clamp(32px, 4vw, 48px);
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
`;

export const Action = styled.a<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 20px;
  border: 1px solid
    ${({ theme, $primary }) => ($primary ? theme.colors.text : theme.colors.border)};
  background: ${({ theme, $primary }) => ($primary ? theme.colors.text : 'transparent')};
  color: ${({ theme, $primary }) => ($primary ? theme.colors.bg : theme.colors.text)};
  font: 400 11px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: border-color 200ms ease;

  &:hover,
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme, $primary }) => ($primary ? theme.colors.bg : theme.colors.text)};
  }
`;

export const Cases = styled.nav`
  margin-top: clamp(48px, 7vw, 86px);
  padding-top: 26px;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;

  a {
    display: grid;
    gap: 8px;
    align-content: start;
  }
  span {
    color: ${({ theme }) => theme.colors.textFaint};
    font: 400 10px/1 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.16em;
  }
  strong {
    font-size: 20px;
    font-weight: 500;
    letter-spacing: -0.02em;
  }
  small {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 13px;
    line-height: 1.4;
  }
  a:hover strong,
  a:focus-visible strong {
    color: ${({ theme }) => theme.colors.accent};
  }

  ${({ theme }) => theme.media.belowTablet} {
    grid-template-columns: 1fr;
    gap: 18px;
  }
`;
