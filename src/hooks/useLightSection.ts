import { useLayoutEffect, type RefObject } from 'react';
import { ScrollTrigger } from '../lib/gsap';
import { setLight } from '../lib/register';

/**
 * Declare a section as a light surface for as long as it owns the viewport.
 *
 * The crossing is taken at the middle of the viewport, and that is a measured
 * compromise rather than a default. The two pieces of chrome that float over
 * sections sit at opposite ends of the screen: the header at the very top, the
 * distance HUD at the vertical centre. The HUD wants the flip exactly at the
 * centre crossing; the header wants it early. Firing at 50% gives the HUD its
 * exact answer, and by the time a section's top edge has climbed past the
 * header's own 37px the trigger has long since fired — so the header is never
 * caught painting for the wrong register.
 */
export function useLightSection(ref: RefObject<HTMLElement>, id: string): void {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => setLight(id, self.isActive),
    });

    return () => {
      trigger.kill();
      setLight(id, false);
    };
  }, [ref, id]);
}
