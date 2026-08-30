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
 * Below the desktop breakpoint OR under reduced motion the same markup is a
 * plain vertical stack — no pin, no track transform, no height maths. Both
 * conditions matter: `useHorizontalScroll` declines to build the pin under
 * reduced motion at any width, so a width-only query left those readers with a
 * clipped 100vh row and panels 02 and 03 permanently off screen.
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
    opacity: 1;
    transition: opacity 0.45s ease;
    background: linear-gradient(
      to bottom,
      ${({ theme }) => theme.colors.bg} 0%,
      rgba(8, 8, 10, 0) 100%
    );
  }

  /* Over the light panel that seam is a black bar hanging in a lit room. It
     only ever had a job at the hero boundary, which is the dark register. */
  :root[data-register='light'] &::before {
    opacity: 0;
  }

  ${({ theme }) => theme.media.stacked} {
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
  /* Pinned over three panels, one of which is a light surface — see
     lib/register. */
  color: var(--chrome-faint);
  pointer-events: none;
  transition: color 0.45s ease;

  strong {
    color: var(--chrome-text);
    transition: color 0.45s ease;
    font-weight: inherit;
  }

  ${({ theme }) => theme.media.stacked} {
    position: static;
    padding: 96px 20px 0;
  }
`;

export const Track = styled.div`
  display: flex;
  height: 100%;
  will-change: transform;

  ${({ theme }) => theme.media.stacked} {
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

/** Stable orbit is the light panel — see WORLD below. */
export const isLight = (orbit: Orbit): boolean => orbit === 1;

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
  /**
   * Orbit 1 is the site's second light surface.
   *
   * One inversion in a whole descent makes the rest read as monotone: the
   * ABOUT bone is the best moment on the site precisely because it is a change
   * of material, and a change of material that happens once is an exception
   * rather than a language. Stable orbit is the right place for the second —
   * it is the panel whose whole argument is equilibrium, and a lit, neutral
   * room is what equilibrium looks like.
   *
   * Fully opaque, unlike its neighbours: the starfield showing through a light
   * surface would read as dirt. That also takes the 3D object off screen for
   * the panel, the same mechanism ABOUT uses, and gives the horizontal
   * transition something real to reveal.
   *
   * Revert: restore
   *   linear-gradient(158deg, rgba(20,20,23,.88), rgba(14,14,17,.86) 54%, rgba(9,9,11,.90))
   * and delete the `$light` branches below.
   */
  1: `radial-gradient(120% 90% at 72% -10%, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 58%),
      linear-gradient(162deg, #DEDFDB 0%, #D3D5D0 54%, #C4C6C2 100%)`,
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
  /**
   * Between the plate and the copy, not behind both.
   *
   * The panel used to be three parallel quadrants — copy left, plate right,
   * numeral behind everything — and nothing ever crossed anything. Sitting the
   * numeral above the plate and below the copy gives one element two different
   * depths on the same screen, which is the cheapest way to make a flat grid
   * read as layers. Revert: z-index 0.
   */
  z-index: 3;
  color: ${({ theme, $orbit }) =>
    $orbit === 0
      ? theme.colors.accent
      : isLight($orbit)
        ? theme.colors.ink
        : theme.colors.text};
  /* Raised with the depth change: at 0.03 the numeral vanished entirely where
     it crossed a lit plate, which made the new layering invisible exactly
     where it was supposed to read. */
  opacity: ${({ $orbit }) => (['0.11', '0.1', '0.062'] as const)[$orbit]};

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
  > [data-panel-body] {
    position: relative;
    /* Above the ghost numeral, which is above the plate. */
    z-index: 4;
  }

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
  position: relative;
  display: grid;

  /**
   * Local weight under the copy, now that the plate is allowed to slide
   * beneath it.
   *
   * The direction's rule for overlaps is that legibility is bought with weight
   * behind the type, never by shrinking what is behind it. This is a soft
   * ellipse of page black with its falloff finishing outside the block, so no
   * edge is ever perceptible — the same device the hero uses under the name.
   *
   * Orbit 1 is exempt: nothing overlaps there, and a black scrim on a light
   * panel would be a bruise.
   */
  &::before {
    content: '';
    position: absolute;
    /* Reaches well past the copy column on the right: the title bleeds out
       there, and the pixels measured under 3:1 were all in the stretch of the
       word that had run out from under this gradient. */
    inset: -14% -52% -16% -10%;
    z-index: -1;
    pointer-events: none;
    opacity: ${({ $orbit }) => (isLight($orbit) ? 0 : 1)};
    background: radial-gradient(
      ellipse 66% 62% at 40% 52%,
      rgba(6, 6, 8, 0.88) 0%,
      rgba(6, 6, 8, 0.68) 44%,
      rgba(6, 6, 8, 0.3) 72%,
      rgba(6, 6, 8, 0) 88%
    );
  }

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
    $orbit === 2
      ? theme.colors.textFaint
      : isLight($orbit)
        ? theme.colors.accentInk
        : theme.colors.accent};
  opacity: ${({ $orbit }) => ($orbit === 0 ? 1 : $orbit === 1 ? 0.95 : 0.55)};
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
    $orbit === 2
      ? theme.colors.textMuted
      : isLight($orbit)
        ? theme.colors.ink
        : theme.colors.text};
  /* The title now runs across its own plate. Measured through a glyph mask,
     1.55% of orbit 0's pixels fell below 3:1 where the word crosses the hot
     core; a shadow that hugs the letterforms fixes exactly those pixels and
     leaves the plate's light alone everywhere else. */
  text-shadow: ${({ $orbit }) =>
    isLight($orbit) ? 'none' : '0 0 14px rgba(6,6,8,.8), 0 0 38px rgba(6,6,8,.55)'};

  ${({ theme }) => theme.media.belowDesktop} {
    /* The stack has no panel edge to crop against — let it wrap instead of
       handing the document a horizontal scrollbar. */
    white-space: normal;
    font-size: clamp(38px, 12vw, 96px);
  }
`;

export const Desc = styled.p<{ $orbit: Orbit }>`
  margin: 0;
  max-width: ${({ $orbit }) => (['34ch', '40ch', '46ch'] as const)[$orbit]};
  font-size: ${({ $orbit }) => (['18px', '18px', '15px'] as const)[$orbit]};
  line-height: ${({ $orbit }) => (['1.45', '1.55', '1.8'] as const)[$orbit]};
  color: ${({ theme, $orbit }) =>
    isLight($orbit)
      ? theme.colors.inkMuted
      : $orbit === 2
        ? theme.colors.textGhost
        : theme.colors.textMuted};

  ${({ theme }) => theme.media.mobile} {
    font-size: 16px;
  }
`;

export const Highlights = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
  max-width: 52ch;
  font-size: 13px;
  line-height: 1.45;
  color: currentColor;

  li {
    display: grid;
    grid-template-columns: 14px minmax(0, 1fr);
    gap: 8px;
  }

  li::before {
    content: '↳';
    color: var(--accent);
  }
`;

export const ProjectLinks = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.14em;

  a {
    display: inline-flex;
    gap: 7px;
    padding-bottom: 4px;
    border-bottom: 1px solid currentColor;
  }

  > span {
    opacity: 0.58;
  }
`;

export const Meta = styled.dl<{ $orbit: Orbit }>`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid
    ${({ theme, $orbit }) => (isLight($orbit) ? theme.colors.inkLine : theme.colors.line)};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.14em;
  color: ${({ theme, $orbit }) =>
    isLight($orbit) ? theme.colors.inkFaint : theme.colors.textFaint};

  > div {
    display: grid;
    gap: 8px;
  }

  dt {
    margin: 0;
  }

  dd {
    margin: 0;
    color: ${({ theme, $orbit }) => (isLight($orbit) ? theme.colors.ink : theme.colors.text)};
  }
`;

/**
 * A transparent cell around the plate, purely so the plate has a warp target.
 *
 * `Media` itself carries `data-p` — the pinned horizontal timeline scrubs its
 * `opacity` and `yPercent`, and the intro would be writing the same `opacity`
 * from a second timeline. The cell owns the warp, the figure keeps the scrub.
 */
/**
 * The plate is allowed into the column beside it.
 *
 * Grid cells that respect their tracks produce a layout where text and image
 * are neighbours; the reference this phase is measured against overlaps them,
 * and overlap is what produces depth. The negative margin pulls the plate back
 * under the copy column, and the copy stays legible because it sits two layers
 * above with its own local weight — never by shrinking the plate.
 *
 * Not applied at orbit 1: that panel is the still point, and the one place
 * where the grid holding still is the statement. Revert: drop margin-left.
 */
export const MediaCell = styled.div<{ $orbit: Orbit }>`
  margin-left: ${({ $orbit }) => (['-14%', '0', '-18%'] as const)[$orbit]};
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
    ${({ theme, $orbit }) =>
      isLight($orbit)
        ? theme.colors.inkLine
        : $orbit === 2
          ? theme.colors.line
          : theme.colors.border};
  overflow: hidden;

  ${({ theme }) => theme.media.belowDesktop} {
    max-height: none;
    width: 100%;
    aspect-ratio: 4 / 3;
  }
`;

/**
 * The plate's body.
 *
 * This used to be three layered CSS gradients with a faint word inside, and it
 * was the single largest reason the dark sections read as unfinished: a plate
 * with no matter in it is a hole in the composition, and each panel had one
 * occupying between a third and a half of the frame.
 *
 * The gradients are gone. A generated field (see lib/matterField) paints the
 * body on a canvas underneath, and what remains here is the treatment over it:
 * a light leak from the direction of the orbit's source, and a coarse grain
 * that keeps the upscaled noise from reading as a smooth digital gradient.
 *
 * TODO(assets): the real capture drops in as an <img> above the canvas, with
 * `data-panel-image` kept where it is. The framing per orbit is already right,
 * so nothing about the layout has to change when it arrives.
 */
export const MediaInner = styled.div<{ $orbit: Orbit }>`
  position: absolute;
  inset: -6%;
  overflow: hidden;
  background: #060608;

  /* The leak: the panel's light source, stated once more over the field so
     the plate belongs to the same sky as the panel behind it. */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: ${({ $orbit }) =>
      [
        `radial-gradient(88% 74% at 8% 104%, rgba(255,206,138,.30) 0%, rgba(214,159,81,.10) 34%, rgba(0,0,0,0) 66%)`,
        `linear-gradient(158deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,0) 44%),
         radial-gradient(96% 80% at 50% 40%, rgba(255,255,255,.05) 0%, rgba(0,0,0,0) 70%)`,
        `radial-gradient(120% 96% at 96% -8%, rgba(150,186,232,.16) 0%, rgba(0,0,0,0) 58%),
         linear-gradient(190deg, rgba(0,0,0,0) 40%, rgba(4,5,8,.55) 100%)`,
      ][$orbit]};
  }

  /* Grain over the field, at a coarser frequency than the global film grain.
     The upscale that makes the noise read as plasma also makes it perfectly
     smooth, and perfectly smooth is what makes generated imagery look
     generated. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    opacity: ${({ $orbit }) => (['0.5', '0.38', '0.3'] as const)[$orbit]};
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.62' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E");
    background-size: 180px 180px;
  }
`;

/**
 * The plate's stamp.
 *
 * The old treatment put two faint mono labels on every plate — the slot name
 * and a `REGISTRO PENDENTE` caption — both at 10px in a dim grey over black.
 * At that weight they did not read as a decision; they read as text that had
 * failed to render.
 *
 * There is now one mark instead of two, and it states itself: a rule in the
 * orbit's own light, then the slot name at a size that admits it is there on
 * purpose. Revert: restore `MediaNote` in ProjectPanel and drop this.
 */
export const MediaStamp = styled.figcaption<{ $orbit: Orbit }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: grid;
  gap: 10px;
  padding: 22px 24px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.mono};
  letter-spacing: 0.22em;
  color: ${({ theme }) => theme.colors.text};
  /* Local weight so the mark keeps its contrast wherever the field happens to
     be bright — the field moves, the label cannot move with it. */
  background: linear-gradient(
    to top,
    rgba(4, 4, 6, 0.82) 0%,
    rgba(4, 4, 6, 0.52) 46%,
    rgba(4, 4, 6, 0) 100%
  );

  &::before {
    content: '';
    display: block;
    width: 46px;
    height: 1px;
    background: ${({ theme, $orbit }) =>
      $orbit === 2 ? theme.colors.textFaint : theme.colors.accent};
  }
`;
