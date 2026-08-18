import { useCallback, useEffect, useRef } from 'react';
import * as S from './Work.styles';
import { ProjectPanel } from './ProjectPanel';
import { projects, work } from '../../../lib/content';
import { useHorizontalScroll } from '../../../hooks/useHorizontalScroll';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { breakpoints } from '../../../styles/theme';
import { setLight } from '../../../lib/register';

const total = String(projects.length).padStart(2, '0');

/** The panel that is a light surface — mirrors `isLight` in the styles. */
const LIGHT_INDEX = 1;

export function Work() {
  const wrapRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.desktop}px)`);
  const reduced = useReducedMotion();
  const horizontal = isDesktop && !reduced;

  // Imperative counter update: this fires on every scrubbed frame, so it must
  // never go through React state.
  const onProgress = useCallback((index: number) => {
    const el = counterRef.current;
    if (!el) return;
    const next = `${String(index + 1).padStart(2, '0')} / ${total}`;
    if (el.textContent !== next) el.textContent = next;
  }, []);

  useHorizontalScroll({
    wrapRef,
    pinRef,
    trackRef,
    enabled: horizontal,
    onProgress,
  });

  /**
   * The chapter tells the page which register it is in.
   *
   * Stable orbit is a light surface, and the chrome floating over it — the
   * header, the distance HUD, this chapter's own label — is painted for black.
   *
   * The question is geometric: is the light panel the thing under the middle
   * of the viewport. An observer with the root inset to a single vertical line
   * answers exactly that, and answers it without reading layout on the frame
   * loop. The first version did read a rect per frame and cost 11.1ms median
   * while scrolling against a 5.6ms baseline.
   *
   * Not taken from the panel-index callback above: that callback quantises
   * scroll progress and was observed holding a stale index while a different
   * panel was on screen (logged in BUGS-ENCONTRADOS). A stale counter is
   * cosmetic; chrome painted for the wrong register is not.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !horizontal) {
      setLight('work-panel', false);
      return;
    }
    const panel = track.children[LIGHT_INDEX] as HTMLElement | undefined;
    if (!panel) return;

    const io = new IntersectionObserver(
      ([entry]) => setLight('work-panel', entry.isIntersecting),
      // Root inset to the vertical centre line of the viewport.
      { root: null, rootMargin: '0px -50% 0px -50%', threshold: 0 },
    );
    io.observe(panel);

    return () => {
      io.disconnect();
      setLight('work-panel', false);
    };
  }, [horizontal]);

  return (
    <S.Wrap id="work" ref={wrapRef} aria-labelledby="work-label">
      <S.Pin ref={pinRef}>
        <S.Heading data-warp>
          <strong id="work-label">{work.label}</strong>
          {horizontal && (
            <span ref={counterRef} aria-hidden="true">
              01 / {total}
            </span>
          )}
        </S.Heading>

        <S.Track ref={trackRef}>
          {/* Index is the orbit: 0 near the horizon, 2 farthest out. */}
          {projects.map((project, index) => (
            <ProjectPanel
              key={project.n}
              project={project}
              orbit={Math.min(2, index) as S.Orbit}
            />
          ))}
        </S.Track>
      </S.Pin>
    </S.Wrap>
  );
}
