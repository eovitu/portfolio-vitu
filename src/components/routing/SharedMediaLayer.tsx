import { forwardRef, useImperativeHandle, useRef } from 'react';
import styled from 'styled-components';
import { gsap } from '../../lib/gsap';
import {
  createSharedMediaRepresentation,
  measureMediaFrame,
  selectSharedMediaSource,
} from '../../motion/sharedMedia';

const Layer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 112;
  pointer-events: none;
`;

export interface SharedMediaHandle {
  capture: (source: HTMLElement | null, signal: AbortSignal) => void;
  animateTo: (destination: HTMLElement | null, signal: AbortSignal) => Promise<void>;
  clear: () => void;
}

export const SharedMediaLayer = forwardRef<SharedMediaHandle>(
  function SharedMediaLayer(_props, forwardedRef) {
    const layerRef = useRef<HTMLDivElement>(null);
    const representationRef = useRef<HTMLElement | null>(null);

    const clear = () => {
      gsap.killTweensOf(representationRef.current);
      representationRef.current?.remove();
      representationRef.current = null;
    };

    useImperativeHandle(
      forwardedRef,
      () => ({
        clear,
        capture(source, signal) {
          clear();
          if (!source || !layerRef.current || signal.aborted) return;
          const poster = source.querySelector<HTMLImageElement>('[data-project-poster]');
          const mediaSource = selectSharedMediaSource({
            poster: poster?.currentSrc || poster?.src,
            posterLoaded: Boolean(poster?.complete && poster.naturalWidth > 0),
            frameReady: source.isConnected,
          });
          if (!mediaSource) return;
          const representation = createSharedMediaRepresentation(
            mediaSource,
            measureMediaFrame(source),
            signal,
          );
          if (!representation) return;
          layerRef.current.append(representation);
          representationRef.current = representation;
        },
        animateTo(destination, signal) {
          const representation = representationRef.current;
          if (!representation || !destination || signal.aborted) {
            clear();
            return Promise.resolve();
          }
          // Complete all layout reads before GSAP performs its first write.
          const destinationRect = measureMediaFrame(destination);
          const sourceRect = representation.getBoundingClientRect();
          const scaleX = destinationRect.width / Math.max(1, sourceRect.width);
          const scaleY = destinationRect.height / Math.max(1, sourceRect.height);

          return new Promise((resolve) => {
            let settled = false;
            const finish = () => {
              if (settled) return;
              settled = true;
              clear();
              resolve();
            };
            const animation = gsap.to(representation, {
              x: destinationRect.left - sourceRect.left,
              y: destinationRect.top - sourceRect.top,
              scaleX,
              scaleY,
              borderRadius: destinationRect.borderRadius,
              clipPath: destinationRect.clipPath,
              opacity: 0.92,
              duration: 0.46,
              ease: 'power3.inOut',
              onComplete: finish,
            });
            signal.addEventListener(
              'abort',
              () => {
                animation.kill();
                finish();
              },
              { once: true },
            );
          });
        },
      }),
      [],
    );

    return <Layer ref={layerRef} aria-hidden="true" data-shared-media-layer />;
  },
);
