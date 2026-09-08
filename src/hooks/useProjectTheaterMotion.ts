import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';
import { useAnimationFrame } from '../components/providers/SmoothScrollProvider';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';
import { sceneSignals } from '../motion/sceneSignals';
import { PROJECT_THEMES } from '../motion/projectThemes';
import { chapterIndexForProgress } from '../motion/theaterChapters';
import type { ProjectSlug } from '../lib/content';
import { useMediaQuery } from './useMediaQuery';
import { useReducedMotion } from './useReducedMotion';

export function useProjectTheaterMotion(
  sectionRef: RefObject<HTMLElement>,
  setActive: (index: number) => void,
): void {
  const reduced = useReducedMotion();
  const fineDesktop = useMediaQuery(
    '(min-width: 1000px) and (min-height: 620px) and (hover: hover) and (pointer: fine)',
  );
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const run = section?.querySelector<HTMLElement>('[data-theater-run]');
    if (!section || !run) return;

    if (reduced || !fineDesktop) {
      run.dataset.enhanced = 'false';
      setActive(0);
      return;
    }

    run.dataset.enhanced = 'true';
    const chapters = Array.from(
      run.querySelectorAll<HTMLElement>('[data-theater-chapter]'),
    );
    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: run,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = gsap.utils.clamp(0, 0.999999, self.progress);
          const index = chapterIndexForProgress(progress, chapters.length);
          setActive(index);
          const project = chapters[index]?.dataset.project as ProjectSlug | undefined;
          if (project) {
            const theme = PROJECT_THEMES[project];
            sceneSignals.chapter = index;
            sceneSignals.projectTheme = project;
            sceneSignals.transitionProgress = progress * chapters.length - index;
            sceneSignals.energy = Math.min(1, 0.2 + Math.abs(self.getVelocity()) / 4000);
            sceneSignals.particles = theme.particleSpread;
          }
        },
      });

      return () => trigger.kill();
    }, section);

    return () => {
      run.dataset.enhanced = 'false';
      sceneSignals.chapter = 0;
      sceneSignals.projectTheme = null;
      sceneSignals.transitionProgress = 0;
      ctx.revert();
    };
  }, [sectionRef, setActive, reduced, fineDesktop]);

  useAnimationFrame(() => {
    const section = sectionRef.current;
    if (!section || !fineDesktop || prefersReducedMotion()) return;
    const velocity = Math.max(-1, Math.min(1, sceneSignals.velocity / 32));
    const previous = Number(section.dataset.theaterVelocity ?? 0);
    const damped = previous + (velocity - previous) * 0.12;
    if (Math.abs(damped - previous) < 0.001) return;
    section.dataset.theaterVelocity = String(damped);
    section.style.setProperty('--theater-velocity', damped.toFixed(3));
    section.style.setProperty('--theater-tilt', `${(damped * 1.4).toFixed(3)}deg`);
  });
}
