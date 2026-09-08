import { useEffect, useRef } from 'react';
import { useAnimationFrame } from '../components/providers/SmoothScrollProvider';
import { useRouteTransition } from '../components/routing/RouteTransitionProvider';
import { sameSurface, surfaceFor, writeSurface, type Surface } from '../lib/surface';
import { sceneSignals } from '../motion/sceneSignals';

/**
 * The single injection point for the active surface.
 *
 * Two things move it: the route, and, while the reader is inside Selected
 * Work, which chapter is on screen. The chapter is a per-frame signal rather
 * than React state, so it is sampled from the shared ticker and only written
 * to the DOM when it actually changes; nothing here re-renders anything.
 *
 * The surface swap is timed, not tweened. `--surface` and `--ink` flip at the
 * one instant the presence layer guarantees no route content is mounted, the
 * same `onExitComplete` the route director already waits on. Interpolating
 * them would put the incoming project's ink on the outgoing project's ground
 * for a few hundred milliseconds, and on the cream case that frame is
 * unreadable. There is no frame here where ink and ground disagree.
 */
export function useSurfaceTokens(): void {
  const { route, phase, onRouteMounted } = useRouteTransition();
  const applied = useRef<Surface | null>(null);

  const write = (next: Surface) => {
    if (applied.current && sameSurface(applied.current, next)) return;
    applied.current = next;
    writeSurface(next, document.documentElement);
    // The scene reads the same value it does, from the same write.
    sceneSignals.accent = next.accent;
  };

  /**
   * The ground changes at the swap instant, not on a phase.
   *
   * `--surface` and `--ink` are written together, synchronously, from the
   * router's `onRouteMounted`, the single moment the outgoing scene has
   * been removed and the incoming one has not painted. Doing it on a phase
   * change instead put the cream case's accent-coloured eyebrow on the dark
   * ground for the first third of its entrance: measured at 2.56:1, which is
   * unreadable. There is now no frame where ink and ground disagree.
   */
  const targetRef = useRef<Surface>(
    surfaceFor({
      route: route.kind,
      slug: route.kind === 'case' ? route.slug : null,
    }),
  );
  targetRef.current = surfaceFor({
    route: route.kind,
    slug: route.kind === 'case' ? route.slug : null,
  });

  useEffect(() => onRouteMounted(() => write(targetRef.current)), [onRouteMounted]);

  // Direct loads, reloads and any settled state.
  useEffect(() => {
    if (phase === 'idle') write(targetRef.current);
  }, [route, phase]);

  /**
   * Selected Work moves the accent, never the ground.
   *
   * `sceneSignals.projectTheme` is written once per frame by the theater's
   * ScrollTrigger. Reading it here keeps one author for "which chapter is
   * active" instead of a second scroll observer that could disagree.
   */
  useAnimationFrame(() => {
    if (route.kind !== 'home' || phase !== 'idle') return;
    write(
      surfaceFor({
        route: 'home',
        accentOnly: sceneSignals.projectTheme,
      }),
    );
  });
}
