import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { skills, type SpectralLine } from '../../../lib/content';
import { useReveal } from '../../../hooks/useReveal';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

/**
 * SKILLS as an emission spectrum.
 *
 * A list of technologies grouped under three headings is the most generic
 * thing a portfolio can contain, and it said nothing this site's concept could
 * use. Astronomy reads composition off spectral lines; the section now states
 * what the work is made of the same way — one continuum, one line per
 * technology, position by domain and brightness by weight.
 *
 * Built with DOM elements rather than canvas on purpose. Each line has to be
 * hoverable, focusable and announced to a screen reader, and every one of
 * those is free here and hand-rolled in a canvas. The band is ~14 nodes, so
 * there is no cost argument for the pixel route.
 */

const Section = styled.section`
  position: relative;
  padding: 150px ${({ theme }) => theme.space.gutter} 170px;

  ${({ theme }) => theme.media.mobile} {
    padding: 100px 20px 120px;
  }
`;

const Inner = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  display: grid;
  gap: 46px;
`;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 24px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.mono};
  letter-spacing: 0.2em;
  color: ${({ theme }) => theme.colors.textFaint};

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: inherit;
  }
`;

const Intro = styled.p`
  margin: 0;
  max-width: 52ch;
  font-size: ${({ theme }) => theme.type.bodyAlt};
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textMuted};
`;

/** The continuum the lines sit on. */
const Band = styled.div`
  position: relative;
  height: 190px;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  background:
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.028) 0%,
      rgba(255, 255, 255, 0.012) 32%,
      rgba(255, 255, 255, 0.02) 64%,
      rgba(255, 255, 255, 0.008) 100%
    ),
    linear-gradient(
      180deg,
      rgba(8, 8, 10, 0) 0%,
      rgba(255, 255, 255, 0.02) 50%,
      rgba(8, 8, 10, 0) 100%
    );

  ${({ theme }) => theme.media.mobile} {
    height: 150px;
  }
`;

/**
 * Domain colours.
 *
 * These are spectral positions, not brand colours, and they are the one place
 * on the site where more than one hue is allowed — a spectrum with a single
 * hue is not a spectrum. They stay desaturated so the band still reads as
 * light rather than as a chart, and the accent is reserved for the active
 * line, which is the only state that means anything here.
 */
const DOMAIN_HUE: Record<SpectralLine['domain'], string> = {
  BACKEND: '210, 225, 245',
  FRONTEND: '235, 240, 245',
  TRIDIMENSIONAL: '245, 232, 210',
  DESIGN: '245, 220, 205',
};

const Line = styled.button<{
  $at: number;
  $weight: number;
  $rgb: string;
  $on: boolean;
  $drawn: boolean;
}>`
  position: absolute;
  top: 8%;
  bottom: 8%;
  left: ${({ $at }) => 3 + $at * 94}%;
  width: ${({ $weight, $on }) => ($on ? 3 : Math.max(1, Math.round($weight * 2)))}px;
  padding: 0;
  border: 0;
  cursor: pointer;
  background: ${({ $rgb, $weight, $on }) =>
    $on ? 'var(--accent)' : `rgba(${$rgb}, ${0.24 + $weight * 0.5})`};
  box-shadow: ${({ $rgb, $weight, $on }) =>
    $on
      ? '0 0 26px 3px rgba(214,159,81,.55)'
      : `0 0 ${Math.round(6 + $weight * 16)}px rgba(${$rgb}, ${0.16 + $weight * 0.3})`};
  /**
   * The band builds itself in front of the reader.
   *
   * A section that is already finished when it arrives is scenery; one that
   * assembles is an event. Each line grows from zero height, ordered outward
   * from the centre of the spectrum, so the band reads as being measured
   * rather than as being switched on.
   *
   * transform-origin at the centre makes them grow in both directions at once,
   * which is what a spectrograph trace actually looks like.
   */
  transform-origin: 50% 50%;
  transform: scaleY(${({ $drawn }) => ($drawn ? 1 : 0)});
  transition:
    transform 0.62s cubic-bezier(0.16, 1, 0.3, 1)
      ${({ $at }) => (Math.abs($at - 0.5) * 1.15).toFixed(2)}s,
    background-color 0.28s ease,
    box-shadow 0.28s ease,
    width 0.28s ease;

  /* Each line breathes on its own phase, so the band is alive without
     anything actually moving. Delay is derived from position, which keeps the
     whole set permanently out of sync. */
  animation: emission ${({ $weight }) => 3.4 + $weight * 2.6}s ease-in-out infinite;
  animation-delay: ${({ $at }) => (-$at * 6).toFixed(2)}s;
  /* The flicker only starts once every line has settled — a band that
     shimmers while it is still being drawn reads as two effects fighting. */
  animation-play-state: ${({ $drawn }) => ($drawn ? 'running' : 'paused')};

  @keyframes emission {
    0%,
    100% {
      opacity: 0.72;
    }
    50% {
      opacity: 1;
    }
  }

  &:focus-visible {
    outline: 1px solid var(--accent);
    outline-offset: 6px;
  }

  ${({ theme }) => theme.media.reduce} {
    animation: none;
    transform: none;
    transition: none;
  }
`;

/** The readout under the band — what the selected line actually is. */
const Readout = styled.div`
  display: grid;
  gap: 10px;
  min-height: 92px;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  padding-top: 20px;
`;

const ReadoutHead = styled.div`
  display: flex;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
`;

const ReadoutName = styled.div`
  font-size: clamp(22px, 3vw, 38px);
  letter-spacing: -0.03em;
`;

const ReadoutDomain = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.24em;
  color: var(--accent);
`;

const ReadoutDetail = styled.p`
  margin: 0;
  max-width: 60ch;
  font-size: ${({ theme }) => theme.type.bodyAlt};
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Hint = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.24em;
  color: ${({ theme }) => theme.colors.textTrace};
`;

/**
 * Fallback hierarchy.
 *
 * The spectrum is the idea, but a band of glowing ticks does not by itself
 * tell anyone what the work is made of. The plain grouped list stays, quietly,
 * underneath — it is what a screen reader reads, what prints, and what a
 * recruiter scans in four seconds.
 */
const Groups = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 34px;
  padding-top: 12px;
`;

const GroupLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.2em;
  color: ${({ theme }) => theme.colors.textDim};
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  margin-bottom: 14px;
`;

const GroupList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 9px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const DOMAINS: SpectralLine['domain'][] = [
  'BACKEND',
  'FRONTEND',
  'TRIDIMENSIONAL',
  'DESIGN',
];

export function Skills() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<SpectralLine | null>(null);
  const [drawn, setDrawn] = useState(false);
  const reduced = useReducedMotion();
  useReveal(ref);

  /**
   * Replays on every entry, not once. Leaving and coming back to a section is
   * a deliberate act, and getting the same construction again rewards it —
   * `once: true` would make the second visit feel like a different, duller
   * page.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setDrawn(entry.isIntersecting), {
      threshold: 0.18,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const shown =
    active ?? skills.lines.find((l) => l.name === 'TypeScript') ?? skills.lines[0];

  return (
    <Section id="skills" ref={ref} aria-labelledby="skills-label">
      <Inner>
        <Head data-warp>
          <strong id="skills-label">{skills.label}</strong>
          <span>{skills.labelRight}</span>
        </Head>

        <Intro data-reveal="soft" data-warp>
          {skills.intro}
        </Intro>

        <Band data-warp role="group" aria-label={skills.labelRight}>
          {skills.lines.map((line) => (
            <Line
              key={line.name}
              type="button"
              $at={line.at}
              $weight={line.weight}
              $rgb={DOMAIN_HUE[line.domain]}
              $on={shown.name === line.name}
              $drawn={drawn}
              aria-label={`${line.name}, ${line.domain}`}
              aria-pressed={shown.name === line.name}
              onMouseEnter={() => !reduced && setActive(line)}
              onFocus={() => setActive(line)}
              onClick={() => setActive(line)}
            />
          ))}
        </Band>

        {/* `aria-live` so keyboard and screen-reader users get the detail the
            hover reveals, rather than the band being a decorative dead end. */}
        <Readout aria-live="polite">
          <ReadoutHead>
            <ReadoutName>{shown.name}</ReadoutName>
            <ReadoutDomain>{shown.domain}</ReadoutDomain>
          </ReadoutHead>
          <ReadoutDetail>{shown.detail}</ReadoutDetail>
          {!active && <Hint>{skills.hint}</Hint>}
        </Readout>

        <Groups data-warp>
          {DOMAINS.map((domain) => (
            <div key={domain}>
              <GroupLabel>{domain}</GroupLabel>
              <GroupList>
                {skills.lines
                  .filter((l) => l.domain === domain)
                  .map((l) => (
                    <li key={l.name}>{l.name}</li>
                  ))}
              </GroupList>
            </div>
          ))}
        </Groups>
      </Inner>
    </Section>
  );
}
