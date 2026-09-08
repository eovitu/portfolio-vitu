import { useLayoutEffect } from 'react';
import { useRouteTransition } from '../components/routing/RouteTransitionProvider';
import { scheduleScrollRefresh } from '../motion/scrollMeasure';

/** Page geometry is stable while the opaque curtain covers the route swap. */
export function useRouteScrollRefresh(): void {
  const { phase } = useRouteTransition();
  useLayoutEffect(() => {
    if (phase === 'revealing') scheduleScrollRefresh();
  }, [phase]);
}
