import styled from 'styled-components';
import { ArrowUpRight } from '@phosphor-icons/react';
import { useLanguage } from '../providers/LanguageProvider';

const Bar = styled.footer`
  width: min(100%, 1500px);
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.space.gutter} 34px;
  display: grid;
  gap: 30px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.16em;
  color: ${({ theme }) => theme.colors.textGhost};

  ${({ theme }) => theme.media.mobile} {
    padding: 0 20px 30px;
    gap: 22px;
  }
`;

const Social = styled.div`
  display: grid;
  grid-template-columns: minmax(130px, 0.35fr) minmax(0, 1fr);
  gap: 24px;
  align-items: end;
  padding: clamp(28px, 4vw, 54px) 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 26px 0 20px;
  }
`;

const SocialLabel = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textFaint};
  font-size: 11px;
  line-height: 1.4;
  letter-spacing: 0.2em;
  text-transform: uppercase;
`;

const SocialLinks = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: flex-end;
  gap: 8px clamp(20px, 3vw, 46px);

  ${({ theme }) => theme.media.mobile} {
    display: grid;
    justify-content: stretch;
    gap: 0;
  }
`;

const SocialLink = styled.a`
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 7px 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: clamp(16px, 1.6vw, 22px);
  letter-spacing: -0.025em;

  &:first-child {
    color: var(--accent);
    font-size: clamp(24px, 3.2vw, 48px);
    letter-spacing: -0.045em;
  }

  svg {
    width: 0.8em;
    height: 0.8em;
    flex: none;
    transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  &:hover,
  &:focus-visible {
    color: var(--accent-bright);
  }

  &:hover svg,
  &:focus-visible svg {
    transform: translate3d(3px, -3px, 0);
  }

  ${({ theme }) => theme.media.mobile} {
    width: 100%;
    justify-content: space-between;

    &:first-child {
      font-size: clamp(24px, 9vw, 40px);
    }
  }

  ${({ theme }) => theme.media.reduce} {
    svg {
      transition: none;
    }

    &:hover svg,
    &:focus-visible svg {
      transform: none;
    }
  }
`;

const Transmission = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px 18px;
`;

/** The closing transmission line, part of the contact composition. */
export function Footer() {
  const { content } = useLanguage();
  return (
    <Bar data-warp data-gravity-section>
      <Social>
        <SocialLabel>{content.footer.socialLabel}</SocialLabel>
        <SocialLinks aria-label={content.footer.socialLabel}>
          {content.footer.links.map((link) => {
            const opensNewTab = link.href.startsWith('http');
            return (
              <SocialLink
                key={link.href}
                href={link.href}
                target={opensNewTab ? '_blank' : undefined}
                rel={opensNewTab ? 'noreferrer' : undefined}
              >
                {link.label}
                <ArrowUpRight aria-hidden="true" weight="regular" />
              </SocialLink>
            );
          })}
        </SocialLinks>
      </Social>
      <Transmission>
        {content.footer.items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </Transmission>
    </Bar>
  );
}
