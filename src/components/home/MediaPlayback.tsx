import { useEffect, useId, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { Project } from '../../lib/content';
import { createMediaPlayback } from '../../lib/mediaPlayback';
import { useLanguage } from '../providers/LanguageProvider';
import * as S from '../cases/CaseStudy.styles';

export function MediaPlayback({
  project,
  active = true,
}: {
  project: Project;
  active?: boolean;
}) {
  const { locale, content } = useLanguage();
  const copy = content.ui.caseStudy;
  const reduced = useReducedMotion();
  const descriptionId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const policyRef = useRef<ReturnType<typeof createMediaPlayback>>();
  const contextRef = useRef({
    visible: false,
    active,
    documentVisible: typeof document === 'undefined' || !document.hidden,
    reducedMotion: !!reduced,
  });
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const policy = createMediaPlayback(video, () => {
      video.src = project.media.video;
      video.load();
    });
    policyRef.current = policy;
    const update = () =>
      void policy.update(contextRef.current).catch(() => setBlocked(true));
    const visibility = () => {
      contextRef.current.documentVisible = !document.hidden;
      update();
    };
    document.addEventListener('visibilitychange', visibility);
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              contextRef.current.visible =
                entry.isIntersecting && entry.intersectionRatio >= 0.15;
              update();
            },
            { threshold: 0.15 },
          );
    observer?.observe(video);
    return () => {
      policy.suspend();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      policyRef.current = undefined;
    };
  }, [project.media.video]);

  useEffect(() => {
    contextRef.current.active = active;
    contextRef.current.reducedMotion = !!reduced;
    void policyRef.current?.update(contextRef.current).catch(() => setBlocked(true));
  }, [active, reduced]);

  const toggle = () => {
    setError(false);
    void policyRef.current?.toggle().catch(() => {
      policyRef.current?.failed();
      setError(true);
      setPlaying(false);
    });
  };
  return (
    <>
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
        data-playing={playing}
        muted
        playsInline
        preload="none"
        poster={project.media.poster}
        width={project.media.width}
        height={project.media.height}
        role="button"
        tabIndex={0}
        aria-label={`${project.media.alt}. ${error ? (locale === 'pt' ? 'Tentar novamente' : 'Retry') : playing ? copy.pause : copy.play}`}
        aria-describedby={descriptionId}
        aria-pressed={playing}
        style={{ opacity: started && !error && !blocked ? 1 : 0 }}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
          }
        }}
        onPlaying={() => {
          setStarted(true);
          setPlaying(true);
          setBlocked(false);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          policyRef.current?.failed();
          setError(true);
          setPlaying(false);
        }}
      />
      <span id={descriptionId} className="visually-hidden">
        {locale === 'pt'
          ? 'Toque no vídeo ou pressione Enter ou Espaço para reproduzir ou pausar.'
          : 'Tap the video or press Enter or Space to play or pause.'}
      </span>
      <S.Controls data-case-controls data-media-controls>
        <S.ControlButton
          type="button"
          data-no-magnetic
          aria-label={locale === 'pt' ? 'Tela cheia' : 'Fullscreen'}
          onClick={() => {
            const surface = videoRef.current?.parentElement;
            if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
            else if (surface?.requestFullscreen)
              void surface.requestFullscreen().catch(() => {});
          }}
        >
          ⛶
        </S.ControlButton>
      </S.Controls>
      {(error || blocked || (!!reduced && !started)) && (
        <S.MediaHint role={error ? 'alert' : undefined} onClick={toggle}>
          {error
            ? locale === 'pt'
              ? 'Vídeo indisponível. Toque para tentar novamente.'
              : 'Video unavailable. Tap to retry.'
            : locale === 'pt'
              ? 'Toque para reproduzir'
              : 'Tap to play'}
        </S.MediaHint>
      )}
    </>
  );
}
