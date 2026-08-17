import { useRef, type MouseEvent } from 'react';
import * as S from './Hero.styles';
import { hero } from '../../../lib/content';
import { useSmoothScroll } from '../../providers/SmoothScrollProvider';
import { useHeroExit } from '../../../hooks/useHeroExit';
import { useGravityLetters } from '../../../hooks/useGravityLetters';

interface Props {
  onOpenChat: () => void;
}

/**
 * The hero copy. The 3D lives in `layout/SingularityStage`, a fixed layer
 * behind the whole document — it is deliberately not a child of this section.
 *
 * The entrance is owned by `hooks/useSingularityIntro`, which reaches these
 * elements through their `data-*` hooks.
 */
export function Hero({ onOpenChat }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollTo } = useSmoothScroll();
  useHeroExit(sectionRef);
  // The field itself stays inert until the intro hands over (see
  // `useSingularityIntro`'s `land`), so mounting the consumer here is safe.
  useGravityLetters(true);

  const onScrollCue = (event: MouseEvent<HTMLAnchorElement>) => {
    const el = document.querySelector<HTMLElement>('#work');
    if (!el) return;
    event.preventDefault();
    scrollTo(el);
  };

  let letterIndex = 0;

  return (
    <S.HeroSection id="top" ref={sectionRef}>
      <S.Stage>
        <S.Vignette aria-hidden="true" />

        {/* `data-warp` on the row, not on the two `[data-meta]` spans: those
            carry a CSS `translateY(110%)` the first-visit timeline animates, so
            the row is the piece that travels to the core on a reload. */}
        <S.MetaRow data-hero-fade data-warp data-warp-mode="reload">
          <span>
            <span
              data-meta
              style={{ display: 'inline-block', transform: 'translateY(110%)' }}
            >
              {hero.metaLeft}
            </span>
          </span>
          <span>
            <span
              data-meta
              style={{ display: 'inline-block', transform: 'translateY(110%)' }}
            >
              {hero.metaRight}
            </span>
          </span>
        </S.MetaRow>

        <S.Content data-hero-fade>
          {/* Before the name in DOM order, so it paints under it without
              needing a stacking context that would trap the warp transforms. */}
          <S.NameScrim aria-hidden="true" />

          <S.Name>
            {hero.nameLines.map((line, lineIndex) => (
              <S.NameLine key={lineIndex} data-name-line>
                {line.map((char) => (
                  <S.Letter
                    key={`${char}-${letterIndex}`}
                    data-letter={letterIndex++}
                    data-warp
                  >
                    <S.LetterGlyph data-glyph>{char}</S.LetterGlyph>
                  </S.Letter>
                ))}
              </S.NameLine>
            ))}
          </S.Name>

          {/* The grid paints its own top rule, so it is warped as one block —
              warping the `S.Clip` children alone would leave that line hanging
              in the air after the copy was swallowed (the CONTACT bar bug). */}
          <S.InfoGrid data-warp data-warp-mode="reload">
            <S.Clip>
              <S.Role data-line>{hero.role}</S.Role>
            </S.Clip>
            <S.Clip>
              <S.Description data-line>{hero.description}</S.Description>
            </S.Clip>
            <S.FootRow>
              <S.Clip>
                <S.Micro data-line>{hero.location}</S.Micro>
              </S.Clip>
              <S.Clip>
                <S.MicroLink href="#work" data-line onClick={onScrollCue}>
                  {hero.scroll}
                </S.MicroLink>
              </S.Clip>
            </S.FootRow>
          </S.InfoGrid>

          <S.Clip data-warp data-warp-mode="reload">
            <S.Cta type="button" data-line onClick={onOpenChat} aria-haspopup="dialog">
              {hero.cta}
            </S.Cta>
          </S.Clip>
        </S.Content>
      </S.Stage>
    </S.HeroSection>
  );
}
