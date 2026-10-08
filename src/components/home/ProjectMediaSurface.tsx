import { motion } from 'motion/react';
import type { Project } from '../../lib/content';
import * as S from './SelectedWorkTheater.styles';
import { MediaPlayback } from './MediaPlayback';
const MotionMediaSurface = motion.create(S.MediaSurface);
export function ProjectMediaSurface({
  project,
  active,
  reduced,
}: {
  project: Project;
  active: boolean;
  reduced: boolean;
}) {
  return (
    <MotionMediaSurface
      layoutId={`project-media-${project.slug}`}
      transition={{ layout: { duration: reduced ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] } }}
      data-project-media
    >
      <MediaPlayback project={project} active={active} />
    </MotionMediaSurface>
  );
}
