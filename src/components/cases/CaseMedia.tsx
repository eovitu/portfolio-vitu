import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import type { Project } from '../../lib/content';
import * as S from './CaseStudy.styles';
import { useLanguage } from '../providers/LanguageProvider';

const MotionMedia = motion.create(S.Media);

const clock = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '0:00';
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

/**
 * The case film, with controls that belong to this page.
 *
 * The native control bar is the browser's design, not ours: it lands a grey
 * chrome widget with a fullscreen button and an overflow menu on top of the
 * one piece of work the page exists to show. This is the same `<video>`
 * element without `controls`, plus the three affordances a reader actually
 * needs here, play, seek, mute.
 *
 * It deliberately adds no border, panel or chrome of its own. The film is
 * already a recording of a browser inside a tablet mockup; a fourth frame
 * around it would be one too many.
 */
export function CaseMedia({ project }: { project: Project }) {
  const { content } = useLanguage();
  const copy = content.ui.caseStudy;
  const videoRef = useRef<HTMLVideoElement>(null);
  const surfaceRef = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  }, []);

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + delta));
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  /**
   * Off screen, the film stops.
   *
   * It never resumes on its own: playback here is something the reader
   * started deliberately, and a video that restarts itself when it scrolls
   * back into view is a video the reader cannot put down.
   */
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) videoRef.current?.pause();
      },
      { threshold: 0 },
    );
    observer.observe(surface);
    return () => observer.disconnect();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    // The seek slider owns the arrow keys while it has focus.
    if ((event.target as HTMLElement).tagName === 'INPUT') return;
    // Native buttons own Space/Enter; do not turn a mute press into playback.
    if ((event.target as HTMLElement).closest('button')) return;
    if (event.key === ' ' || event.key === 'k') {
      event.preventDefault();
      toggle();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      seekBy(5);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      seekBy(-5);
    } else if (event.key === 'm' || event.key === 'M') {
      event.preventDefault();
      toggleMute();
    }
  };

  return (
    <MotionMedia
      ref={surfaceRef}
      layoutId={`project-media-${project.slug}`}
      transition={{ layout: { duration: 0.62, ease: [0.16, 1, 0.3, 1] } }}
      data-case-media
      data-warp
      data-playing={playing}
      role="group"
      aria-label={`${project.name}, ${copy.filmLabel}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <img
        data-project-poster
        src={project.media.poster}
        alt=""
        aria-hidden="true"
        width={project.media.width}
        height={project.media.height}
      />
      <video
        ref={videoRef}
        muted
        playsInline
        preload="metadata"
        poster={project.media.poster}
        width={project.media.width}
        height={project.media.height}
        aria-label={project.media.alt}
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          setCurrent(video.currentTime);
          if (Number.isFinite(video.duration) && video.duration > 0) {
            setProgress((video.currentTime / video.duration) * 100);
          }
        }}
      >
        <source src={project.media.video} type="video/mp4" />
      </video>

      <S.Controls data-case-controls>
        <S.ControlButton
          type="button"
          data-no-magnetic
          onClick={toggle}
          aria-label={playing ? copy.pause : copy.play}
        >
          {playing ? '❙❙' : '▶'}
        </S.ControlButton>
        <S.Seek
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          aria-label={copy.seek}
          aria-valuetext={`${clock(current)} ${copy.of} ${clock(duration)}`}
          onChange={(event) => {
            const video = videoRef.current;
            if (!video || !Number.isFinite(video.duration)) return;
            video.currentTime = (Number(event.target.value) / 100) * video.duration;
          }}
        />
        <S.Time aria-hidden="true">
          {clock(current)} / {clock(duration)}
        </S.Time>
        <S.ControlButton
          type="button"
          data-no-magnetic
          onClick={toggleMute}
          aria-label={muted ? copy.unmute : copy.mute}
          aria-pressed={muted}
        >
          {muted ? copy.muted : copy.sound}
        </S.ControlButton>
      </S.Controls>
    </MotionMedia>
  );
}
