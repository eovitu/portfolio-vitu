import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from './useReducedMotion';

/** The profile assembles; the photograph settles. Both use the shared GSAP clock. */
export function useEditorialMotion(
  profileRef: RefObject<HTMLElement>,
  aboutRef: RefObject<HTMLElement>,
): void {
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (reduced) return;
    const profile = profileRef.current;
    const about = aboutRef.current;
    if (!profile || !about) return;
    const ctx = gsap.context(() => {
      gsap.from(profile.querySelectorAll('article'), {
        y: 65,
        rotation: (index) => (index % 2 ? 3 : -3),
        duration: 0.85,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: { trigger: profile, start: 'top 65%', once: true },
      });
      gsap.fromTo(
        about.querySelector('figure'),
        { y: 65, rotation: 7 },
        {
          y: -15,
          rotation: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: about,
            start: 'top bottom',
            end: 'center center',
            scrub: true,
          },
        },
      );
    });
    return () => ctx.revert();
  }, [profileRef, aboutRef, reduced]);
}
