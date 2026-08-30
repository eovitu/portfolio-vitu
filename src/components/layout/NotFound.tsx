import styled from 'styled-components';
import { contact } from '../../lib/content';

const emailHref = contact.links.find((link) => link.label === 'EMAIL')?.href ?? '/';

const Page = styled.main`
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  overflow: hidden;
  display: grid;
  align-items: center;
  padding: 88px ${({ theme }) => theme.space.gutter} 40px;

  ${({ theme }) => theme.media.mobile} {
    padding: 84px 20px 28px;
  }
`;

const Orbit = styled.div`
  position: absolute;
  width: min(74vw, 760px);
  aspect-ratio: 1;
  right: -12%;
  top: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  transform: translateY(-50%) rotate(-18deg) scaleY(0.32);
  box-shadow:
    0 0 90px rgba(214, 159, 81, 0.12),
    inset 0 0 56px rgba(214, 159, 81, 0.08);
  animation: lost-orbit 8s ease-in-out infinite alternate;

  &::after {
    content: '';
    position: absolute;
    width: 34%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #000;
    box-shadow: 0 0 42px ${({ theme }) => theme.colors.accentMuted};
    left: 33%;
    top: 33%;
  }

  @keyframes lost-orbit {
    to {
      transform: translateY(-48%) rotate(-12deg) scaleY(0.36);
    }
  }

  ${({ theme }) => theme.media.reduce} {
    animation: none;
  }
`;

const Content = styled.div`
  position: relative;
  max-width: 900px;
  display: grid;
  gap: 28px;
`;

const Code = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.mono};
  letter-spacing: 0.2em;
  color: ${({ theme }) => theme.colors.accent};
`;

const Title = styled.h1`
  margin: 0;
  max-width: 8ch;
  font-size: clamp(64px, 14vw, 210px);
  line-height: 0.82;
  letter-spacing: -0.06em;
  font-weight: 500;
`;

const Copy = styled.p`
  margin: 0;
  max-width: 42ch;
  font-size: clamp(17px, 2vw, 22px);
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  a {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    padding: 12px 20px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 999px;
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: ${({ theme }) => theme.type.mono};
    letter-spacing: 0.14em;
  }

  a:first-child {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.bg};
  }
`;

export function NotFound() {
  return (
    <Page>
      <Orbit aria-hidden="true" />
      <Content>
        <Code>ERROR 404 / SIGNAL LOST</Code>
        <Title>OUT OF ORBIT.</Title>
        <Copy>
          This route crossed the event horizon. The selected work is still transmitting from
          the home page.
        </Copy>
        <Actions>
          <a href="/">RETURN HOME</a>
          <a href={emailHref}>REPORT THE SIGNAL</a>
        </Actions>
      </Content>
    </Page>
  );
}
