/**
 * One coalesced ScrollTrigger re-measure.
 *
 * A route swap invalidates every scroll offset on the page: the outgoing
 * document is replaced, and the triggers of the incoming one are created by
 * layout effects that run while the sections still carry the transition's
 * transforms. They have to be measured again, but exactly once, and only
 * once the page is standing still.
 *
 * Several places legitimately know that the page has settled (the gravity
 * timeline finishing, the transition returning to idle, a reduced-motion swap
 * with no animation at all). Rather than have each of them refresh, which is
 * how a layout-thrashing loop starts, they all call `scheduleScrollRefresh`
 * and the requests collapse into a single refresh on the next frame.
 */

import { ScrollTrigger } from '../lib/gsap';

let pending = 0;

export function scheduleScrollRefresh(): void {
  if (pending) return;
  pending = window.requestAnimationFrame(() => {
    pending = 0;
    ScrollTrigger.refresh();
  });
}
