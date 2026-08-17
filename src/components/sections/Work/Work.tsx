import { useCallback, useRef } from 'react';
import * as S from './Work.styles';
import { ProjectPanel } from './ProjectPanel';
import { projects, work } from '../../../lib/content';
import { useHorizontalScroll } from '../../../hooks/useHorizontalScroll';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { breakpoints } from '../../../styles/theme';

const total = String(projects.length).padStart(2, '0');

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
