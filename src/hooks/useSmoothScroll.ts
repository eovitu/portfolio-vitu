import { useContext, useEffect, useRef } from 'react';
import {
  SmoothScrollContext,
  type FrameCallback,
  type SmoothScrollApi,
} from '../components/providers/smoothScrollContext';

/** Read the shared scroll API. */
export function useSmoothScroll(): SmoothScrollApi {
  return useContext(SmoothScrollContext);
}

/**
 * Subscribe a callback to the shared frame loop for the component's lifetime.
 *
 * The callback is held in a ref and re-read every frame, so a component may
 * close over fresh props without the subscription being torn down and rebuilt
 * on each render — resubscribing per render is how a shared loop ends up with
 * duplicate listeners.
 */
export function useAnimationFrame(cb: FrameCallback, enabled = true): void {
  const { onFrame } = useSmoothScroll();
  const ref = useRef(cb);
  ref.current = cb;

  useEffect(() => {
    if (!enabled) return;
    return onFrame((t, dt) => ref.current(t, dt));
  }, [onFrame, enabled]);
}
