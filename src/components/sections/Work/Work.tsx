import { useCallback, useEffect, useRef } from 'react';
import * as S from './Work.styles';
import { ProjectPanel } from './ProjectPanel';
import { projects, work } from '../../../lib/content';
import { useHorizontalScroll } from '../../../hooks/useHorizontalScroll';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useAnimationFrame } from '../../providers/SmoothScrollProvider';
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

  /**
   * The chapter tells the page which register it is in.
   *
   * Stable orbit is a light surface, and the chrome floating over it — the
   * header, the distance HUD, this chapter's own label — is painted for black.
   *
   * Read from geometry rather than from the progress callback above. That
   * callback quantises `self.progress` to a panel index and can be observed
   * holding a stale index while a different panel is on screen (logged in
   * BUGS-ENCONTRADOS); the counter surviving that is cosmetic, the chrome
   * surviving it is not. What matters here is one question with a geometric
   * answer: is the light panel the thing under the middle of the viewport.
   *
   * One rect read per frame, and only while the chapter is on screen.
   * `setLight` is idempotent, so the DOM is written only on a change.
   */
  useAnimationFrame(() => {
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return;

    const box = pin.getBoundingClientRect();
    if (box.bottom < 0 || box.top > window.innerHeight) {
      setLight('work-panel', false);
      return;
    }

    const panel = track.children[LIGHT_INDEX] as HTMLElement | undefined;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const centre = window.innerWidth / 2;
    setLight('work-panel', r.left <= centre && r.right >= centre);
  }, horizontal);

  // Leaving the chapter (or dropping to the vertical stack) must not leave a
  // claim behind — the whole page would stay in the light register.
  useEffect(() => {
    if (!horizontal) setLight('work-panel', false);
    return () => setLight('work-panel', false);
  }, [horizontal]);

  useHorizontalScroll({
    wrapRef,
    pinRef,
    trackRef,
    enabled: horizontal,
    onProgress,
  });

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
