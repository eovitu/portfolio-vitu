import { motion, useReducedMotion } from 'motion/react';
import type { Project } from '../../lib/content';
import * as S from './CaseStudy.styles';
import { useLanguage } from '../providers/LanguageProvider';
import { MediaPlayback } from '../home/MediaPlayback';
const MotionMedia = motion.create(S.Media);
export function CaseMedia({ project }: { project: Project }) {
  const { content } = useLanguage();
  const reduced = useReducedMotion();
  return (
    <MotionMedia
      layoutId={`project-media-${project.slug}`}
      transition={{ layout: { duration: reduced ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] } }}
      data-case-media
      data-warp
      role="group"
      aria-label={`${project.name}, ${content.ui.caseStudy.filmLabel}`}
    >
      <MediaPlayback project={project} />
    </MotionMedia>
  );
}
