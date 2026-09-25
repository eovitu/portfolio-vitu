import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Project } from '../../lib/content';
import * as S from './SelectedWorkTheater.styles';

const MotionMediaSurface = motion.create(S.MediaSurface);

interface Props {
  project: Project;
  active: boolean;
  reduced: boolean;
}

export function ProjectMediaSurface({ project, active, reduced }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  /**
   * A preview off screen is still being decoded.
   *
   * The theater keeps all three chapters mounted so the active one can cross
   * fade, and the whole section leaves the viewport as the reader moves on,
   * at which point three muted videos carry on decoding for nobody. This is
   * the only condition added to playback; it never starts a video that the
   * chapter state was not already going to start.
   */
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    if (typeof IntersectionObserver === 'undefined') {
      setOnScreen(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(surface);
    return () => observer.disconnect();
  }, []);

  const shouldPlay = active && !reduced && onScreen;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!shouldPlay) {
      video.pause();
      setPlaying(false);
      return;
    }
    const result = video.play();
    result?.catch(() => setPlaying(false));
    return () => video.pause();
  }, [shouldPlay]);

  return (
    <MotionMediaSurface
      ref={surfaceRef}
      layoutId={`project-media-${project.slug}`}
      transition={{ layout: { duration: 0.62, ease: [0.16, 1, 0.3, 1] } }}
      data-project-media
      data-playing={playing}
    >
      <img
        data-project-poster
        src={project.media.poster}
        alt=""
        aria-hidden="true"
        width={project.media.width}
        height={project.media.height}
        loading="lazy"
        decoding="async"
      />
      <video
        ref={videoRef}
        muted
        playsInline
        loop
        autoPlay={shouldPlay}
        preload={shouldPlay ? 'metadata' : 'none'}
        poster={project.media.poster}
        width={project.media.width}
        height={project.media.height}
        aria-label={project.media.alt}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      >
        <source src={project.media.video} type="video/mp4" />
      </video>
    </MotionMediaSurface>
  );
}
