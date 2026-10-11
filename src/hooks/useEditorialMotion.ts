import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from './useReducedMotion';
import { sectionEntryPose } from '../motion/sectionEntryPose';

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
        ...sectionEntryPose(
          'profile',
          0,
          { x: 0, y: 0 },
          { w: innerWidth, h: innerHeight },
        ),

        duration: 0.85,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: { trigger: profile, start: 'top 65%', once: true },
      });
      const photograph = about.querySelector('figure');
      // GSAP folds CSS rotate into transform. Keep that design angle at rest.
      const photographRotation = photograph
        ? Number(gsap.getProperty(photograph, 'rotation'))
        : 0;
      const photographPose = sectionEntryPose(
        'about',
        0,
        { x: 0, y: 0 },
        { w: innerWidth, h: innerHeight },
      );
      gsap.fromTo(
        photograph,
        { ...photographPose, rotation: photographRotation + photographPose.rotation },
        {
          x: 0,
          y: 0,
          scale: 1,
          rotation: photographRotation,
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
