import { useRef, type ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { MatterField } from './MatterField';
import type { FieldKind } from '../../lib/matterField';
import { useReveal } from '../../hooks/useReveal';
import { useParallax } from '../../hooks/useParallax';

/**
 * A full-bleed screen.
 *
 * Two things this site did not have. The first is a frame with no margin in
 * it: every surface lived inside a comfortable 32px gutter, and a comfortable
 * margin on every screen is the single most reliable way to make a site look
 * like a template. The second is variation of pressure — the sections were all
 * the same length at the same density, so the descent had no rhythm even
 * though each part of it worked.
 *
 * So an interlude is one image and one statement, edge to edge. `saturated`
 * adds the instrument strip and a second line; without it the screen holds a
 * single sentence and nothing else, which is the breath.
 *
 * The surface is opaque, so it also takes the 3D object off screen for its
 * duration. That is deliberate at the second one: the object comes back at
 * CONTACT, and something has to be absent before a return can register.
 */

const Section = styled.section<{ $tall: boolean }>`
  position: relative;
  /* Bleeds past the page gutter to the physical edges of the viewport. */
  width: 100%;
  height: ${({ $tall }) => ($tall ? '104vh' : '88vh')};
  min-height: ${({ $tall }) => ($tall ? '660px' : '520px')};
  overflow: hidden;
  isolation: isolate;
  background: #06070a;
  display: grid;
  align-content: ${({ $tall }) => ($tall ? 'end' : 'center')};
  padding: 0 ${({ theme }) => theme.space.gutter} ${({ $tall }) => ($tall ? '9vh' : '0')};

  ${({ theme }) => theme.media.mobile} {
    height: auto;
    min-height: 0;
    padding: 96px 20px;
  }
`;

const Surface = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  will-change: transform;
  /* Oversized so the parallax drift can never expose an edge. */
  transform: scale(1.08);
`;

/** Weight under the statement, poured from the side the type sits on. */
const Weight = styled.div<{ $tall: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: ${({ $tall }) =>
    $tall
      ? `linear-gradient(to top, rgba(4,4,6,.88) 0%, rgba(4,4,6,.52) 34%, rgba(4,4,6,0) 68%)`
      : `radial-gradient(72% 58% at 42% 50%, rgba(4,4,6,.82) 0%, rgba(4,4,6,.46) 46%, rgba(4,4,6,0) 82%)`};
`;

const Body = styled.div`
  position: relative;
  z-index: 2;
  display: grid;
  gap: 34px;
`;

const Statement = styled.h2<{ $tall: boolean }>`
  margin: 0;
  /* To the physical edge — the whole point of a full-bleed screen is that the
     type is not sitting inside a frame. */
  margin-left: calc(-1 * ${({ theme }) => theme.space.gutter});
  font-size: ${({ $tall }) =>
    $tall ? 'clamp(46px, min(11vw, 17vh), 192px)' : 'clamp(42px, min(9.6vw, 15vh), 168px)'};
  line-height: 0.9;
  letter-spacing: -0.05em;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  /* No text-shadow. On a 192px face spanning the viewport a two-stop shadow is
     a large blur repainted on every scrubbed frame; the Weight layer behind
     already buys the contrast, and it is one flat gradient. */

  ${({ theme }) => theme.media.mobile} {
    margin-left: -20px;
  }
`;

const Line = styled.span`
  display: block;
  overflow: hidden;
  padding-bottom: 0.06em;

  > span {
    display: inline-block;
  }
`;

const Lead = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoLg};
  letter-spacing: 0.24em;
  color: var(--accent);
`;

const metrics = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 22px;
  margin: 0;
  padding-top: 20px;
  border-top: 1px solid rgba(233, 231, 226, 0.18);
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.16em;
  color: ${({ theme }) => theme.colors.textFaint};
`;

const Metrics = styled.dl`
  ${metrics}

  > div {
    display: grid;
    gap: 8px;
  }

  dt,
  dd {
    margin: 0;
  }

  dd {
    color: ${({ theme }) => theme.colors.text};
  }
`;

interface Props {
  id: string;
  kind: FieldKind;
  lines: readonly string[];
  lead?: string;
  metrics?: readonly (readonly [string, string])[];
  children?: ReactNode;
}

export function Interlude({ id, kind, lines, lead, metrics: rows }: Props) {
  const ref = useRef<HTMLElement>(null);
  const saturated = Boolean(rows);
  useReveal(ref);
  useParallax(ref);

  return (
    <Section id={id} ref={ref} $tall={saturated} aria-labelledby={`${id}-title`}>
      {/* The field drifts against the page at a different rate from the type
          in front of it, which is what gives a flat surface depth. */}
      <Surface data-parallax="0.88" aria-hidden="true">
        <MatterField kind={kind} budget={92000} layered />
      </Surface>
      <Weight $tall={saturated} aria-hidden="true" />

      <Body data-reveal-group data-warp>
        <Statement id={`${id}-title`} $tall={saturated} data-skew>
          {lines.map((line) => (
            <Line key={line}>
              <span data-reveal="line">{line}</span>
            </Line>
          ))}
        </Statement>

        {lead && <Lead data-reveal="soft">{lead}</Lead>}

        {rows && (
          <Metrics data-reveal="soft">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </Metrics>
        )}
      </Body>
    </Section>
  );
}
