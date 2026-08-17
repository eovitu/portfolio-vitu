import { useRef } from 'react';
import styled from 'styled-components';
import { contact } from '../../../lib/content';
import { useReveal } from '../../../hooks/useReveal';
import { useParallax } from '../../../hooks/useParallax';
import { useCollapse } from '../../../hooks/useCollapse';

const email = contact.links.find((l) => l.label === 'EMAIL') ?? {
  label: 'EMAIL',
  href: '#contact',
};
import { Footer } from '../../layout/Footer';

const Section = styled.section`
  position: relative;
  padding: 200px ${({ theme }) => theme.space.gutter} 44px;
  overflow: hidden;

  ${({ theme }) => theme.media.mobile} {
    padding: 130px 20px 40px;
  }
`;

/** The gravitational glow behind the closing statement. */
const Halo = styled.div`
  position: absolute;
  left: 50%;
  bottom: -46vh;
  transform: translateX(-50%);
  width: min(130vw, 1600px);
  height: min(130vw, 1600px);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(185, 167, 154, 0.15) 0%,
    rgba(185, 167, 154, 0.045) 34%,
    rgba(8, 8, 10, 0) 62%
  );
  pointer-events: none;
`;

/**
 * The escaping signal.
 *
 * Everything else in this section is a warp target and gets consumed by
 * `useCollapse`. This block is deliberately outside that set — it is pulled at
 * and holds, which is the only reason the collapse means anything. If it were
 * simply excluded and static it would read as forgotten rather than as
 * escaping, so the timeline still animates it, upward and slightly larger.
 */
const Survivor = styled.div`
  position: relative;
  display: grid;
  gap: 14px;
  justify-items: start;
  will-change: transform;
`;

const SurvivorNote = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.24em;
  color: var(--accent);
`;

const SurvivorLink = styled.a`
  font-size: clamp(24px, 3.4vw, 46px);
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 6px;

  &:hover,
  &:focus-visible {
    border-bottom-color: var(--accent);
  }
`;

const Inner = styled.div`
  position: relative;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  display: grid;
  gap: 76px;

  ${({ theme }) => theme.media.mobile} {
    gap: 48px;
  }
`;

const Clip = styled.div`
  overflow: hidden;
`;

const Label = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.mono};
  letter-spacing: 0.2em;
  color: ${({ theme }) => theme.colors.textFaint};
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.type.contactTitle};
  line-height: 0.92;
  letter-spacing: -0.05em;
  font-weight: 500;
  max-width: 14ch;
`;

const TitleLine = styled.span`
  display: block;
  overflow: hidden;
  padding-bottom: 0.05em;

  > span {
    display: inline-block;
  }
`;

const Links = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1px;
  background: ${({ theme }) => theme.colors.line};
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
`;

const Link = styled.a`
  background: ${({ theme }) => theme.colors.bg};
  padding: 32px 4px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoLg};
  letter-spacing: 0.18em;
  transition:
    background 0.4s ease,
    color 0.3s ease;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.bgPanel};
    color: ${({ theme }) => theme.colors.text};
  }

  span:last-child {
    color: ${({ theme }) => theme.colors.textTrace};
  }
`;

/**
 * CONTACT — the calmest moment of the site. The statement uses the `slow`
 * reveal preset (1.6 s, 140 ms stagger) so it arrives deliberately.
 */
export function Contact() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  useParallax(ref);
  useCollapse(ref, '[data-survivor]');

  return (
    <Section id="contact" ref={ref} aria-labelledby="contact-label">
      <Halo data-parallax="0.85" aria-hidden="true" />
      <Inner>
        <Clip data-warp>
          <Label data-reveal="line" id="contact-label">
            {contact.label}
          </Label>
        </Clip>

        <Title data-reveal-group>
          {contact.titleLines.map((line) => (
            <TitleLine key={line} data-warp>
              <span data-reveal="slow" data-skew>
                {line}
              </span>
            </TitleLine>
          ))}
        </Title>

        {/* `data-warp` sits on the container, not the links: the grid paints
            its own rule colour between them, so warping the children alone
            would leave that bar hanging in the air after they are swallowed. */}
        {/* `data-warp` sits on the container, not the links: the grid paints
            its own rule colour between them. The email is lifted out of the
            group entirely — it is the signal that survives the collapse, so it
            must not be a warp target at all. */}
        <Links data-reveal-group data-warp>
          {contact.links
            .filter((link) => link.label !== 'EMAIL')
            .map((link) => (
              <Link key={link.label} href={link.href} data-reveal="soft">
                <span>{link.label}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
        </Links>

        <Survivor data-survivor>
          <SurvivorNote>{contact.survivorNote}</SurvivorNote>
          <SurvivorLink href={email.href}>{email.label}</SurvivorLink>
        </Survivor>

        <Footer />
      </Inner>
    </Section>
  );
}
