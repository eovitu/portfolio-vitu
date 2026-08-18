import { useRef } from 'react';
import styled from 'styled-components';
import { about } from '../../../lib/content';
import { useReveal } from '../../../hooks/useReveal';
import { useParallax } from '../../../hooks/useParallax';
import { useMediaFrame } from '../../../hooks/useMediaFrame';
import { useRegisterBreak } from '../../../hooks/useRegisterBreak';
import { useLightSection } from '../../../hooks/useLightSection';

/**
 * ABOUT — the register break.
 *
 * Every other surface on this site is near-black. This one is bone, with black
 * type. That inversion is the point: it is what makes the black elsewhere read
 * as a decision rather than as a default, and it is the site's equivalent of
 * walking out of a dark sky into a lit room.
 *
 * How the 3D survives a light background: it does not. The object is pure
 * black with additive light on it — against bone it would read as a hole
 * punched in the paper, and no amount of veil fixes an object whose entire
 * mechanism is emission against void. So it leaves the frame instead. This
 * section is opaque and sits above the fixed canvas layer (Main is z-index 1,
 * the canvas 0), which removes the object completely for the duration and
 * gives the passage in and out something real to animate. Recessing it or
 * silhouetting it were the alternatives; both keep a compromised object on
 * screen, and absence is the stronger statement.
 */

const Section = styled.section`
  position: relative;
  /* Opaque: this is what takes the object off screen for the section. */
  background: ${({ theme }) => theme.colors.paper};
  color: ${({ theme }) => theme.colors.ink};
  padding: 150px ${({ theme }) => theme.space.gutter} 170px;
  /* Isolate so the global grain still composites, but nothing behind bleeds.
     overflow clips the oversized skewed curtains as they translate out. */
  isolation: isolate;
  overflow: hidden;

  ${({ theme }) => theme.media.mobile} {
    padding: 100px 20px 120px;
  }
`;

/**
 * The curtains that make the inversion an event.
 *
 * These used to be soft gradients, which read as two pages glued together.
 * They are now solid sheets of page black, sitting over the light section and
 * clipped away by useRegisterBreak as the reader crosses the boundary — the
 * dark is consumed rather than faded through.
 *
 * Tall on purpose: the sweep needs room to be legible as a movement, and a
 * 140px band resolves too fast to register as anything.
 */
const Curtain = styled.div<{ $side: 'top' | 'bottom' }>`
  position: absolute;
  /* Wider than the section so the static skew never exposes a corner. */
  left: -12%;
  right: -12%;
  height: 46vh;
  z-index: 3;
  pointer-events: none;
  ${({ $side }) => ($side === 'top' ? 'top: 0;' : 'bottom: 0;')}
  background: ${({ theme }) => theme.colors.bg};
  /* The shear is applied by GSAP in both keyframes — see useRegisterBreak for
     why it cannot live here. */
  will-change: transform;
`;

const Inner = styled.div`
  position: relative;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  display: grid;
  gap: 72px;
`;

const Clip = styled.div`
  overflow: hidden;
`;

const Label = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.mono};
  letter-spacing: 0.2em;
  color: ${({ theme }) => theme.colors.inkFaint};
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.type.sectionTitle};
  line-height: 1.06;
  letter-spacing: -0.04em;
  font-weight: 300;
  max-width: 18ch;
`;

const TitleLine = styled.span`
  display: block;
  overflow: hidden;
  padding-bottom: 0.06em;

  > span {
    display: inline-block;
  }
`;

/**
 * The photograph — the only human presence on the site, and the only image.
 *
 * Treated as an archive document, not as a portrait: desaturated to nothing,
 * pushed hard on contrast, then re-tinted with the accent so it belongs to the
 * same world as the object. All of it in CSS; `public/victor-2010.jpg` is
 * never modified.
 */
const Plate = styled.figure`
  position: relative;
  margin: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 56px;
  align-items: end;

  ${({ theme }) => theme.media.belowDesktop} {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }
`;

const Frame = styled.div`
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.paperDeep};
  aspect-ratio: 4 / 3;

  img {
    width: 100%;
    /* Taller than the frame so the parallax drift never exposes an edge. */
    height: calc(100% + 14%);
    position: absolute;
    inset: -7% 0 auto 0;
    object-fit: cover;
    will-change: transform;
    /* Written by useMediaFrame on the shared ticker; the frame is the window
       and the picture moves behind it. */
    transform: translate3d(0, var(--media-shift, 0px), 0);
    /* Archive treatment: strip the colour, then rebuild the tonal range hard.
       Never the clean colour original.
       The first pass at 1.42/0.92 produced a pleasant sepia print — which is
       exactly the "fofo" the direction rules out. A document has crushed
       blacks and a blown highlight; these numbers force that. */
    filter: grayscale(1) contrast(2.6) brightness(0.62) saturate(0);
  }

  /* Duotone: the accent laid into the midtones with the color blend, over a deep
     shadow multiply. Two layers rather than one so the darks stay neutral and
     only the middle of the range goes warm — a flat tint would look like a
     filter, this looks like a print. */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    /* Much less warmth than the first two passes: the gold now only touches
       the upper midtones, and the rest of the range stays a cold neutral. A
       print stored for twenty years has a cast, not a colour. */
    background: linear-gradient(
      168deg,
      rgba(206, 158, 92, 0.42) 0%,
      rgba(120, 112, 104, 0.5) 40%,
      rgba(18, 17, 16, 0.94) 100%
    );
    mix-blend-mode: multiply;
  }

  /* Local grain, deliberately light. The global soft-light grain already
     covers this surface, and stacking a heavy second pass turns the print
     into dirt rather than into film. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    opacity: 0.6;
    mix-blend-mode: overlay;
    /* Two turbulence layers at different scales rather than one uniform tile.
       A single fine grain reads as a filter applied evenly; real scanned grain
       clumps, so a coarse low-frequency pass rides under the fine one. */
    background-image:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23f)'/%3E%3C/svg%3E"),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.16' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='320' height='320' filter='url(%23c)' opacity='0.75'/%3E%3C/svg%3E");
    background-size:
      120px 120px,
      320px 320px;
  }
`;

/**
 * The copy sits beside the plate rather than over it.
 *
 * The empty sand field behind the child is the negative space the direction
 * asked to use — but it is inside the photograph's own frame, and covering it
 * with type would destroy the very emptiness that makes the image work. So the
 * type takes the void the plate's proportion leaves in the layout instead: the
 * picture is given less than half the row, and the rest of the line is air.
 */
const Aside = styled.figcaption`
  display: grid;
  gap: 26px;
  padding-bottom: 6px;
`;

const Body = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.type.bodyAlt};
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.inkMuted};
  max-width: 46ch;
`;

const Stamp = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.22em;
  color: ${({ theme }) => theme.colors.inkFaint};
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.inkLine};
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 48px;
  border-top: 1px solid ${({ theme }) => theme.colors.inkLine};
  padding-top: 36px;
`;

const MetaList = styled.ul`
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.inkFaint};
  align-content: start;
`;

export function About() {
  const ref = useRef<HTMLElement>(null);
  const topCurtain = useRef<HTMLDivElement>(null);
  const bottomCurtain = useRef<HTMLDivElement>(null);
  useReveal(ref);
  useParallax(ref);
  useMediaFrame(ref);
  useRegisterBreak(ref, topCurtain, bottomCurtain);
  // The chrome that floats over this surface has to stop painting for black.
  useLightSection(ref, 'about');

  return (
    <Section id="about" ref={ref} aria-labelledby="about-label">
      <Curtain ref={topCurtain} $side="top" aria-hidden="true" />
      <Curtain ref={bottomCurtain} $side="bottom" aria-hidden="true" />

      <Inner>
        <Clip data-warp>
          <Label data-reveal="line" id="about-label">
            {about.label}
          </Label>
        </Clip>

        <Title data-parallax="0.94" data-skew data-reveal-group>
          {about.titleLines.map((line) => (
            <TitleLine key={line} data-warp>
              <span data-reveal="line">{line}</span>
            </TitleLine>
          ))}
        </Title>

        <Plate data-warp data-reveal-group>
          <Frame data-media-frame data-parallax="1.04">
            <img
              data-media-inner
              src="/victor-2010.jpg"
              alt={about.photoAlt}
              loading="lazy"
            />
          </Frame>
          <Aside>
            <Body data-reveal="soft">{about.bodySecond}</Body>
            <Stamp data-reveal="soft">{about.photoCaption}</Stamp>
          </Aside>
        </Plate>

        {/* `data-warp` on the container: it paints the rule above the columns,
            so warping the children alone would leave that line behind. */}
        <Columns data-parallax="1.05" data-reveal-group data-warp>
          <Body data-reveal="soft">{about.body}</Body>
          <MetaList>
            {about.meta.map((item) => (
              <li key={item} data-reveal="soft">
                {item}
              </li>
            ))}
          </MetaList>
        </Columns>
      </Inner>
    </Section>
  );
}
