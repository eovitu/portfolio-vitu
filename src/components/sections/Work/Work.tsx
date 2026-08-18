import { useEffect, useRef } from 'react';
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

  useHorizontalScroll({ wrapRef, pinRef, trackRef, enabled: horizontal });

  /**
   * Which panel is actually on screen — asked once, answered for both readers.
   *
   * Two things need this: the register (stable orbit is a light surface, and
   * the chrome floating over it — header, distance HUD, this chapter's label —
   * has to be painted for black) and the counter in the heading.
   *
   * The question is geometric: what is under the middle of the viewport. An
   * observer with the root inset to a single vertical line answers exactly
   * that, and answers it without reading layout on the frame loop. The first
   * version did read a rect per frame and cost 11.1ms median while scrolling
   * against a 5.6ms baseline.
   *
   * The counter used to come from the scrub's own progress, quantised with
   * `Math.round`. That is a different question — it asks how far through the
   * chapter the *scroll* is, not what the reader is looking at — and the two
   * answers come apart wherever the mapping is not perfectly linear: mid-pin,
   * on a refresh, or on the trailing edge of an eased Lenis settle, the
   * counter was observed holding a stale index while another panel was fully
   * on screen. Asking the geometry directly cannot drift, because there is
   * nothing left to drift from.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !horizontal) {
      setLight('work-panel', false);
      return;
    }
    const panels = Array.from(track.children) as HTMLElement[];
    if (!panels.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = panels.indexOf(entry.target as HTMLElement);
          if (index === -1) continue;
          if (index === LIGHT_INDEX) setLight('work-panel', entry.isIntersecting);
          if (!entry.isIntersecting) continue;
          const el = counterRef.current;
          if (!el) continue;
          const next = `${String(index + 1).padStart(2, '0')} / ${total}`;
          if (el.textContent !== next) el.textContent = next;
        }
      },
      // Root inset to the vertical centre line of the viewport.
      { root: null, rootMargin: '0px -50% 0px -50%', threshold: 0 },
    );
    panels.forEach((panel) => io.observe(panel));

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
