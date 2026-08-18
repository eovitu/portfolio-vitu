import styled from 'styled-components';

/**
 * WORK layout.
 *
 * Desktop: `Pin` is a 100vh box that ScrollTrigger pins (position stays
 * `relative` — a `sticky` pin would fight ScrollTrigger and is the usual cause
 * of the "giant black gap" artefact). `Wrap` has NO explicit height: the pin
 * spacer ScrollTrigger injects provides the exact scroll distance, so the
 * section can never be taller than the animation it drives.
 *
 * Below the desktop breakpoint (or under reduced motion) the same markup is a
 * plain vertical stack — no pin, no track transform, no height maths.
 */

export const Wrap = styled.section`
  position: relative;
`;

export const Pin = styled.div`
  position: relative;
  height: 100vh;
  overflow: hidden;

  /**
   * The hero → WORK boundary.
   *
   * Now that each panel paints its own world, the first panel's background
   * meets the hero's page black at a hard horizontal line, and a hard line
   * between two sections reads as a seam rather than as an arrival. This
   * dissolves the top ~180px of the chapter back into the page, the same
   * device the ABOUT section uses at both of its edges.
   */
  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 180px;
    z-index: 4;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      ${({ theme }) => theme.colors.bg} 0%,
      rgba(8, 8, 10, 0) 100%
    );
  }

  ${({ theme }) => theme.media.belowDesktop} {
    height: auto;
    overflow: visible;
  }
`;

export const Heading = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  justify-content: space-between;
  padding: 88px ${({ theme }) => theme.space.gutter} 0;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.mono};
  letter-spacing: 0.2em;
  color: ${({ theme }) => theme.colors.textFaint};
  pointer-events: none;

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: inherit;
  }

  ${({ theme }) => theme.media.belowDesktop} {
    position: static;
    padding: 96px 20px 0;
  }
`;

export const Track = styled.div`
  display: flex;
  height: 100%;
  will-change: transform;

  ${({ theme }) => theme.media.belowDesktop} {
    flex-direction: column;
    height: auto;
    will-change: auto;
  }
`;

/**
 * Orbital state. Three positions in one system, not three layouts.
 *
 * 0 — near the horizon: compressed, hot, high contrast, matter under tension.
 * 1 — stable orbit: balanced and classical, the rest point between extremes.
 * 2 — far and cold: small type in a large field, low contrast, mostly void.
 *
 * What varies is the grid itself — column ratio, alignment, type scale,
 * density, where the media block sits — not a palette swap over one structure.
 *
 * What deliberately does NOT vary is the panel's outer width. Each panel stays
 * exactly one measured pin-width wide. Varying that would change the track
 * length, which changes the pin's `end`, which changes document height — the
 * precise mechanism behind the reload-lands-on-PROJECT-03 bug. The direction
 * asked for a different grade of grid, and a different grade of grid is
 * achievable entirely inside a fixed frame.
 */
export type Orbit = 0 | 1 | 2;

const ORBIT = {
  0: {
    columns: 'minmax(0, 1.5fr) minmax(0, 0.75fr)',
    gap: '34px',
    align: 'end',
    padTop: '132px',
  },
  1: {
    columns: 'minmax(0, 1fr) minmax(0, 1.15fr)',
    gap: '64px',
    align: 'center',
    padTop: '120px',
  },
  2: {
    columns: 'minmax(0, 0.78fr) minmax(0, 1.05fr)',
    gap: '108px',
    align: 'start',
    padTop: '190px',
  },
} as const;

/**
 * Each panel's world.
 *
 * With the object no longer parked behind the chapter (see `stagePresence`),
 * a panel can finally own its own sky — which is the whole point of calling
 * them orbits. These are semi-opaque on purpose: the starfield behind them is
 * the site's constant and has to stay faintly readable through every world,
 * or the three panels stop belonging to the same place.
 */
const WORLD = {
  0: `radial-gradient(120% 88% at 22% 112%, rgba(214,159,81,.26) 0%, rgba(150,96,30,.10) 38%, rgba(8,8,10,0) 68%),
      linear-gradient(172deg, rgba(26,19,12,.92) 0%, rgba(13,10,9,.90) 52%, rgba(6,5,6,.94) 100%)`,
  1: `linear-gradient(158deg, rgba(20,20,23,.88) 0%, rgba(14,14,17,.86) 54%, rgba(9,9,11,.90) 100%)`,
  2: `radial-gradient(150% 120% at 86% -14%, rgba(120,150,180,.13) 0%, rgba(8,8,10,0) 58%),
      linear-gradient(190deg, rgba(9,12,17,.90) 0%, rgba(6,7,10,.94) 100%)`,
} as const;

/**
 * The project number as scenery rather than as a label.
 *
 * Giant, ghosted, and deliberately cropped by the panel edge — the numeral is
 * architecture the copy sits inside, not a caption beside it. It is the piece
 * that gives the three panels a shared authorship, and it is why the small
 * `Number` above it can stay quiet.
 */
export const Ghost = styled.div<{ $orbit: Orbit }>`
  position: absolute;
  bottom: ${({ $orbit }) => (['-16%', '-13%', '-9%'] as const)[$orbit]};
  ${({ $orbit }) => ($orbit === 2 ? 'left: -7%;' : 'right: -6%;')}
  margin: 0;
  font-size: clamp(280px, 42vw, 720px);
  line-height: 0.72;
  font-weight: 500;
  letter-spacing: -0.06em;
  pointer-events: none;
  user-select: none;
  z-index: 0;
  color: ${({ theme, $orbit }) => ($orbit === 0 ? theme.colors.accent : theme.colors.text)};
  opacity: ${({ $orbit }) => (['0.075', '0.05', '0.032'] as const)[$orbit]};

  ${({ theme }) => theme.media.belowDesktop} {
    font-size: clamp(200px, 54vw, 420px);
    opacity: 0.045;
  }
`;

export const Panel = styled.article<{ $orbit: Orbit }>`
  position: relative;
  overflow: hidden;
  background: ${({ $orbit }) => WORLD[$orbit]};

  /**
   * The copy and the plate ride above the scenery numeral.
   *
   * Scoped to the two grid children rather than to every child: a blanket
   * rule also re-positioned the absolutely-placed numeral, which put it back
   * into the grid, consumed the first column and pushed the copy and the media
   * plate one cell along. The layout looked plausible and was wrong.
   */
  > [data-panel-body],
  > [data-panel-cell] {
    position: relative;
    z-index: 1;
  }

  /* Desktop width is assigned from the measured pin width at runtime, and is
     identical across orbits on purpose — see the note above. */
  flex: 0 0 100%;
  height: 100%;
  display: grid;
  grid-template-columns: ${({ $orbit }) => ORBIT[$orbit].columns};
  gap: ${({ $orbit }) => ORBIT[$orbit].gap};
  align-items: ${({ $orbit }) => ORBIT[$orbit].align};
  padding: ${({ $orbit }) => ORBIT[$orbit].padTop} ${({ theme }) => theme.space.gutter} 60px;

  ${({ theme }) => theme.media.belowTablet} {
    gap: 40px;
  }

  ${({ theme }) => theme.media.belowDesktop} {
    flex: 0 0 auto;
    height: auto;
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
    padding: 80px ${({ theme }) => theme.space.gutter};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: 64px 20px;
  }
`;

export const Body = styled.div<{ $orbit: Orbit }>`
  display: grid;
  /* Density is the tell: crushed at the horizon, generous far away. */
  gap: ${({ $orbit }) => (['14px', '22px', '40px'] as const)[$orbit]};
  align-content: ${({ $orbit }) => (['end', 'center', 'start'] as const)[$orbit]};
`;

export const Clip = styled.div`
  overflow: hidden;
`;

/**
 * The title's reveal mask, which must clip vertically and NOT horizontally.
 *
 * `overflow: hidden` on both axes would cut the title at the text column and
 * the bleed would never happen. Mixing `overflow-x: visible` with
 * `overflow-y: hidden` is not available in CSS — the visible axis computes to
 * `auto` and the element becomes a scroll container.
 *
 * So the mask keeps `overflow: hidden` and is instead made wide enough that
 * its own edge is never the thing doing the cutting: `width: max-content`
 * sizes it to the glyphs, and grid children with a `minmax(0, …)` track do not
 * constrain an overflowing child. The panel's `overflow: hidden` performs the
 * crop, which is what the composition wants.
 */
export const TitleClip = styled.div`
  overflow: hidden;
  width: max-content;
  max-width: none;
  padding-bottom: 0.05em;
  /* Above the media plate: where the two now cross, the word wins. */
  position: relative;
  z-index: 2;

  ${({ theme }) => theme.media.belowDesktop} {
    /* No panel edge to be cut by in the vertical stack — a nowrap title wider
       than the screen would give the page a horizontal scrollbar. */
    width: auto;
    max-width: 100%;
  }
`;

/**
 * Project numbering — one of the few places the accent is unconditional,
 * because it is the conceptual index of the piece, not a small label.
 *
 * Except at orbit 2. Out there the gold is all but gone, by decision: matter
 * that far from the horizon has not been touched by it yet, and a warm accent
 * would contradict the one thing that panel is saying.
 */
export const Number = styled.div<{ $orbit: Orbit }>`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.mono};
  letter-spacing: 0.2em;
  color: ${({ theme, $orbit }) =>
    $orbit === 2 ? theme.colors.textFaint : theme.colors.accent};
  opacity: ${({ $orbit }) => ($orbit === 0 ? 1 : $orbit === 1 ? 0.85 : 0.55)};
`;

/**
 * The project title, sized to leave the column.
 *
 * At the old scale the title sat obediently inside its grid cell, and a title
 * that fits its cell is a caption. These sizes are chosen so the word runs
 * past the text column and is cut by the panel's own edge — the crop is the
 * statement, and it is why `TitleClip` below has to stop clipping horizontally.
 *
 * The near/far grading survives: orbit 0 is crushed and enormous, orbit 2 is
 * still the smallest of the three. What changed is the floor, not the shape.
 *
 * Revert: restore 'clamp(42px, 6.6vw, 108px)' / 'clamp(34px, 5.4vw, 88px)' /
 * 'clamp(24px, 3.2vw, 52px)' and drop `TitleClip`'s width rules.
 */
export const Title = styled.h3<{ $orbit: Orbit }>`
  margin: 0;
  display: inline-block;
  white-space: nowrap;
  /* Type scale is a grid variable here, not decoration: the near panel is
     crushed large and tight, the far one is small inside a big field. */
  font-size: ${({ $orbit }) =>
    (
      [
        'clamp(58px, 11.8vw, 208px)',
        'clamp(48px, 9.6vw, 172px)',
        'clamp(38px, 6.4vw, 116px)',
      ] as const
    )[$orbit]};
  line-height: ${({ $orbit }) => (['0.84', '0.92', '1.04'] as const)[$orbit]};
  letter-spacing: ${({ $orbit }) => (['-0.058em', '-0.045em', '-0.02em'] as const)[$orbit]};
  font-weight: 500;
  color: ${({ theme, $orbit }) =>
    $orbit === 2 ? theme.colors.textMuted : theme.colors.text};

  ${({ theme }) => theme.media.belowDesktop} {
    /* The stack has no panel edge to crop against — let it wrap instead of
       handing the document a horizontal scrollbar. */
    white-space: normal;
    font-size: clamp(38px, 12vw, 96px);
  }
`;

export const Desc = styled.p<{ $placeholder?: boolean; $orbit: Orbit }>`
  margin: 0;
  max-width: ${({ $orbit }) => (['34ch', '40ch', '46ch'] as const)[$orbit]};
  font-size: ${({ $orbit }) => (['18px', '18px', '15px'] as const)[$orbit]};
  line-height: ${({ $orbit }) => (['1.45', '1.55', '1.8'] as const)[$orbit]};
  color: ${({ theme, $placeholder, $orbit }) =>
    $orbit === 2
      ? theme.colors.textGhost
      : $placeholder
        ? theme.colors.textDim
        : theme.colors.textMuted};

  ${({ theme }) => theme.media.mobile} {
    font-size: 16px;
  }
`;

export const Meta = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.14em;
  color: ${({ theme }) => theme.colors.textFaint};

  > div {
    display: grid;
    gap: 8px;
  }

  dt {
    margin: 0;
  }

  dd {
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
  }
`;

/**
 * A transparent cell around the plate, purely so the plate has a warp target.
 *
 * `Media` itself carries `data-p` — the pinned horizontal timeline scrubs its
 * `opacity` and `yPercent`, and the intro would be writing the same `opacity`
 * from a second timeline. The cell owns the warp, the figure keeps the scrub.
 */
export const MediaCell = styled.div<{ $orbit: Orbit }>`
  display: grid;
  align-content: ${({ $orbit }) => (['end', 'center', 'start'] as const)[$orbit]};
  justify-items: ${({ $orbit }) => (['stretch', 'stretch', 'end'] as const)[$orbit]};
  min-width: 0;
  /* At orbit 2 the plate is pushed down into an otherwise empty field — the
     void is the composition, not leftover space. */
  padding-top: ${({ $orbit }) => (['0', '0', '9vh'] as const)[$orbit]};
`;

export const Media = styled.figure<{ $orbit: Orbit }>`
  position: relative;
  margin: 0;
  /* Format is part of the grid: portrait and crushed near the horizon,
     classical in stable orbit, a small distant plate far out. */
  aspect-ratio: ${({ $orbit }) => (['3 / 4', '4 / 3', '16 / 10'] as const)[$orbit]};
  max-height: ${({ $orbit }) => (['82vh', '70vh', '38vh'] as const)[$orbit]};
  width: ${({ $orbit }) => (['100%', '100%', '78%'] as const)[$orbit]};
  border: 1px solid
    ${({ theme, $orbit }) => ($orbit === 2 ? theme.colors.line : theme.colors.border)};
  overflow: hidden;

  ${({ theme }) => theme.media.belowDesktop} {
    max-height: none;
    width: 100%;
    aspect-ratio: 4 / 3;
  }
`;

/**
 * Placeholder plate — composed, not reserved.
 *
 * These are still mocks, but a flat grey rectangle would read as missing
 * content and drag the whole panel down with it. Each plate is instead lit
 * like a frame belonging to its orbit: a hot rake of light near the horizon, a
 * neutral silver in stable orbit, an almost-empty cold field far out. They do
 * not look like each other, which is the point.
 *
 * TODO(assets): swap the layered background for the real capture as an <img>,
 * keeping `data-panel-image` so the parallax and scale reveal keep working.
 * The framing is already correct for each orbit, so the images drop in
 * without a redesign.
 */
export const MediaInner = styled.div<{ $orbit: Orbit }>`
  position: absolute;
  inset: -6%;
  background: ${({ $orbit }) =>
    [
      /* 0 — near: matter raked by the disc, warm and high contrast. */
      `radial-gradient(120% 90% at 18% 108%, rgba(214,159,81,.30) 0%, rgba(214,159,81,.07) 34%, rgba(8,8,10,0) 62%),
       linear-gradient(168deg, #17130E 0%, #0C0B0A 46%, #060506 100%),
       repeating-linear-gradient(122deg, rgba(255,255,255,.045) 0px, rgba(255,255,255,.045) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 9px)`,
      /* 1 — stable: neutral silver, even, classical. */
      `linear-gradient(150deg, #141417 0%, #0E0E11 52%, #0A0A0C 100%),
       repeating-linear-gradient(135deg, rgba(255,255,255,.03) 0px, rgba(255,255,255,.03) 3px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 13px)`,
      /* 2 — far: cold, nearly empty, a single cool wash off one edge. */
      `radial-gradient(140% 120% at 88% -10%, rgba(150,170,190,.10) 0%, rgba(8,8,10,0) 55%),
       linear-gradient(190deg, #0B0C0E 0%, #08080A 100%)`,
    ][$orbit]};
  display: flex;
  align-items: ${({ $orbit }) => (['flex-end', 'center', 'flex-start'] as const)[$orbit]};
  justify-content: ${({ $orbit }) => (['flex-start', 'center', 'flex-end'] as const)[$orbit]};

  span {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: ${({ theme }) => theme.type.monoSm};
    letter-spacing: 0.24em;
    color: ${({ theme, $orbit }) =>
      $orbit === 2 ? theme.colors.textTrace : theme.colors.textGhost};
    text-align: ${({ $orbit }) => (['left', 'center', 'right'] as const)[$orbit]};
    padding: 26px 24px;
    max-width: 60%;
  }
`;

export const MediaNote = styled.figcaption`
  position: absolute;
  left: 14px;
  bottom: 12px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.14em;
  color: ${({ theme }) => theme.colors.textTrace};
`;
