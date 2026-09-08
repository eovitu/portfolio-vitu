import { useCallback, useRef, useState, type MouseEvent } from 'react';
import { ArrowBendDownRight, ArrowUpRight } from '@phosphor-icons/react';
import { projects } from '../../lib/content';
import { hrefForCase } from '../../lib/routes';
import { PROJECT_THEMES } from '../../motion/projectThemes';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useReveal } from '../../hooks/useReveal';
import { useProjectTheaterMotion } from '../../hooks/useProjectTheaterMotion';
import { chapterScrollTarget } from '../../motion/theaterChapters';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';
import { useReloadColorReveal } from '../../hooks/useReloadColorReveal';
import { ProjectMediaSurface } from './ProjectMediaSurface';
import * as S from './SelectedWorkTheater.styles';
import * as Base from './HomePage.styles';

export function SelectedWorkTheater() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const enhanced = useMediaQuery(
    '(min-width: 1000px) and (min-height: 620px) and (hover: hover) and (pointer: fine)',
  );
  const { scrollTo } = useSmoothScroll();
  useProjectTheaterMotion(sectionRef, setActive);
  useReveal(sectionRef);
  useReloadColorReveal(sectionRef, '#08080a');

  /**
   * The numbered navigation moves the scroll, never the active index.
   *
   * `active` has exactly one author, the theater's ScrollTrigger. Setting it
   * here as well would give it two, and the next `onUpdate` would immediately
   * overwrite whatever the click chose. So the link scrolls to the band that
   * belongs to the chapter and lets the trigger conclude what is active.
   *
   * Outside the enhanced run the chapters are in normal document flow and
   * their ids resolve to real, distinct positions: the plain anchor is
   * correct there and is left alone.
   */
  const openChapter = useCallback(
    (index: number) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey)
        return;
      const run = sectionRef.current?.querySelector<HTMLElement>('[data-theater-run]');
      if (!run || run.dataset.enhanced !== 'true') return;
      event.preventDefault();
      const rect = run.getBoundingClientRect();
      scrollTo(
        chapterScrollTarget({
          runTop: rect.top + window.scrollY,
          runHeight: rect.height,
          viewportHeight: window.innerHeight,
          index,
          count: projects.length,
        }),
        0.9,
      );
    },
    [scrollTo],
  );

  return (
    <S.Theater id="work" ref={sectionRef} aria-labelledby="work-title" data-gravity-section>
      <S.Intro>
        <div>
          <Base.Kicker data-reveal="line">Selected work</Base.Kicker>
          <h2 id="work-title" data-skew data-reveal="soft">
            Different problems.
            <br />
            Different worlds.
          </h2>
        </div>
        <p data-reveal="soft">
          Three projects across platform architecture, local commerce and connected care.
          Each case shows the decisions behind the surface.
        </p>
      </S.Intro>
      <S.TheaterRun
        data-theater-run
        data-enhanced="false"
        data-chapter-count={projects.length}
      >
        <S.TheaterStage data-theater-stage>
          {projects.map((project, index) => {
            const theme = PROJECT_THEMES[project.slug];
            const isActive = active === index;
            return (
              <S.Chapter
                key={project.slug}
                id={`work-${project.slug}`}
                data-project={project.slug}
                data-theater-chapter
                data-active={isActive}
                aria-hidden={enhanced && !reduced && !isActive}
                data-layout={theme.layout}
                style={
                  {
                    '--accent': theme.accent,
                    '--chapter-color': theme.showcase,
                    '--chapter-ink': theme.showcaseInk,
                  } as React.CSSProperties
                }
              >
                <S.ChapterNumber aria-hidden="true">{project.n}</S.ChapterNumber>
                <ProjectMediaSurface
                  project={project}
                  active={isActive}
                  reduced={reduced}
                />
                <S.Copy>
                  <span data-project-kicker>
                    {project.context} · {project.status}
                  </span>
                  <h3>{project.name}</h3>
                  <p>{project.summary}</p>
                  <ul>
                    {project.ownership.map((item) => (
                      <li key={item}>
                        <ArrowBendDownRight aria-hidden="true" weight="regular" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div data-project-meta>
                    <dl>
                      <dt>Role</dt>
                      <dd>{project.role}</dd>
                    </dl>
                    <dl>
                      <dt>Stack</dt>
                      <dd>{project.tech}</dd>
                    </dl>
                  </div>
                  <Base.Actions>
                    <Base.Action
                      $primary
                      href={hrefForCase(project.slug)}
                      data-project-link
                      data-transition-project={project.slug}
                    >
                      View case study <ArrowUpRight aria-hidden="true" weight="regular" />
                    </Base.Action>
                    {project.actions.map((action) => (
                      <Base.Action
                        key={action.href}
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {action.label} <ArrowUpRight aria-hidden="true" weight="regular" />
                      </Base.Action>
                    ))}
                  </Base.Actions>
                </S.Copy>
              </S.Chapter>
            );
          })}
          <S.Progress aria-label="Selected work chapters">
            {projects.map((project, index) => (
              <a
                key={project.slug}
                href={`#work-${project.slug}`}
                aria-current={active === index ? 'step' : undefined}
                aria-label={`${project.n}, ${project.name}`}
                onClick={openChapter(index)}
              >
                <span>{project.n}</span>
                <span>{project.name}</span>
              </a>
            ))}
          </S.Progress>
        </S.TheaterStage>
      </S.TheaterRun>
    </S.Theater>
  );
}
