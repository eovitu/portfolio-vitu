import styled from 'styled-components';
import { EASE_CSS } from '../../../lib/motion';

export const HeroSection = styled.section`
  position: relative;
  /* Taller than the viewport: the sticky stage gives the 3D room to travel
     before the next section arrives. Matches the handoff exactly. */
  height: 132vh;
`;

export const Stage = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 ${({ theme }) => theme.space.gutter} 36px;

  ${({ theme }) => theme.media.mobile} {
    padding: 0 20px 28px;
  }
`;

export const Vignette = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse at 52% 42%,
    rgba(8, 8, 10, 0) 32%,
    rgba(8, 8, 10, 0.74) 76%
  );
`;

export const MetaRow = styled.div`
  position: absolute;
  top: 92px;
  left: ${({ theme }) => theme.space.gutter};
  right: ${({ theme }) => theme.space.gutter};
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.24em;
  color: ${({ theme }) => theme.colors.textGhost};

  span {
    overflow: hidden;
    display: inline-block;
  }

  ${({ theme }) => theme.media.mobile} {
    left: 20px;
    right: 20px;
    top: 76px;
    font-size: 9px;
    letter-spacing: 0.18em;
  }
`;

export const Content = styled.div`
  position: relative;
  display: grid;
  gap: 30px;

  /* The lockup now claims ~36vh on its own. On a short window that plus the
     info grid would push past the fold, and the hero is the one screen that
     must never scroll to be complete. */
  @media (max-height: 760px) {
    gap: 20px;
  }
`;

/**
 * Local scrim behind the name only.
 *
 * With the object moved inside the lockup, the disc's bright band crosses the
 * lower quarter of the glyphs, and the text (#E9E7E2) against a near-white
 * accretion highlight would fall to roughly 1.2:1 — unreadable.
 *
 * The direction's constraint is that the fix darkens locally behind the
 * typography and never shrinks the object. So this is a soft ellipse of page
 * black, sized to the name block, sitting between the canvas layer and the
 * copy. It carries no hard edge: the gradient reaches zero well inside the
 * block so no rectangle is ever perceptible against the starfield.
 */
export const NameScrim = styled.div`
  position: absolute;
  /* Generous bleed so the falloff finishes off-block, never at an edge. */
  /* Follows the block, which is now roughly twice as tall and starts off the
     left edge — the falloff has to finish outside the viewport on that side
     or the ellipse becomes a visible shape against the starfield. */
  inset: -12% -6% -16% -22%;
  pointer-events: none;
  background: radial-gradient(
    ellipse 66% 62% at 32% 60%,
    rgba(8, 8, 10, 0.9) 0%,
    rgba(8, 8, 10, 0.72) 38%,
    rgba(8, 8, 10, 0.34) 64%,
    rgba(8, 8, 10, 0) 82%
  );
`;

/**
 * The lockup bleeds to the physical edge of the screen.
 *
 * Every other element on the page respects the 32px gutter, and a name that
 * respects it too reads as one more item in a column. Pulling it out by the
 * full gutter plus the glyph's left sidebearing puts the stem of the "V" on
 * the viewport's own edge, so the type stops being content inside a frame and
 * becomes the frame. The `Stage` already clips, so nothing can escape.
 *
 * Revert: delete the `margin-left` declaration.
 */
export const Name = styled.h1`
  margin: 0;
  margin-left: calc(-1 * ${({ theme }) => theme.space.gutter} - 0.055em);
  font-size: ${({ theme }) => theme.type.heroName};
  line-height: 0.84;
  letter-spacing: -0.05em;
  font-weight: 500;
  /**
   * Legibility mitigation, measured rather than assumed.
   *
   * With the object moved inside the lockup, the photon ring's white arc runs
   * behind "TO" in VICTOR. Sampling the composited backdrop through an alpha
   * mask of the real glyph shapes put 3.88% of the name's area below 3:1, with
   * a worst pixel at 1.00:1 — the arc is the same luminance as the type.
   *
   * The scrim alone could not fix that without being strong enough to dim the
   * disc across the whole block, which would undo the overlap it exists to
   * enable. This shadow is local by construction: it hugs the letterforms, so
   * it darkens only the few px where a glyph edge meets the arc and leaves the
   * glow free to leak everywhere else.
   */
  text-shadow:
    0 0 14px rgba(8, 8, 10, 0.92),
    0 0 34px rgba(8, 8, 10, 0.72),
    0 0 72px rgba(8, 8, 10, 0.45);

  /* The Stage's padding drops to 20px here, so the bleed has to match it or
     the name hangs 12px off the screen. */
  ${({ theme }) => theme.media.mobile} {
    margin-left: calc(-20px - 0.055em);
  }
`;

export const NameLine = styled.span`
  display: block;
  overflow: hidden;
  padding-bottom: 0.04em;
`;

export const Letter = styled.span`
  display: inline-block;
  transform: translateY(115%);
`;

/**
 * Inner glyph wrapper — the gravitational field's exclusive node.
 *
 * Three systems want to write `transform` on a hero letter: the intro reveal,
 * the warp that absorbs and expels it, and now the field. Two of them are
 * GSAP timelines that read the current transform to build their tweens, and
 * composing all three on one node is precisely the shape of bug that produced
 * stranded transforms here before.
 *
 * So the channels are made disjoint at the DOM level instead of negotiated:
 * GSAP keeps `[data-letter]` (the outer span) and never learns this element
 * exists; the field owns `[data-glyph]` and never touches the outer one.
 * Neither has to know about the other, and at rest this node is exactly
 * identity — which is what makes the audit's "zero residual transforms"
 * check meaningful rather than aspirational.
 */
export const LetterGlyph = styled.span`
  display: inline-block;
  will-change: transform;
  /* The letter can be pulled out of the word. Selection would otherwise start
     on pointer-down and the glyph would become a native drag image instead of
     moving. Nothing announces the toy — this is the only trace of it. */
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  ${({ theme }) => theme.media.reduce} {
    cursor: auto;
  }
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 34px;
  align-items: end;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  padding-top: 24px;

  ${({ theme }) => theme.media.mobile} {
    gap: 22px;
  }
`;

export const Clip = styled.div`
  overflow: hidden;
`;

export const Role = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.mono};
  letter-spacing: 0.2em;
  color: ${({ theme }) => theme.colors.textMuted};
  transform: translateY(110%);
`;

export const Description = styled.p`
  margin: 0;
  max-width: 42ch;
  font-size: ${({ theme }) => theme.type.body};
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textMuted};
  transform: translateY(110%);

  ${({ theme }) => theme.media.mobile} {
    font-size: 16px;
  }
`;

export const FootRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 16px;
`;

export const Micro = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.textFaint};
  transform: translateY(110%);
`;

export const MicroLink = styled.a`
  display: inline-block;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.textFaint};
  transform: translateY(110%);
`;

export const Cta = styled.button`
  transform: translateY(115%);
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.mono};
  letter-spacing: 0.2em;
  padding: 15px 26px;
  border-radius: 999px;
  cursor: pointer;
  justify-self: start;
  transition:
    border-color 0.35s ease,
    color 0.35s ease,
    transform 0.4s ${EASE_CSS};

  &:hover,
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.text};
  }
`;
