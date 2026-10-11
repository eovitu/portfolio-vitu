import { claimArrivalTargets } from './sectionArrivalOwnership';
import { gsap } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';
import { MOTION_DURATION, MOTION_EASE, MOTION_STAGGER } from './tokens';
import { sectionEntryPose } from './sectionEntryPose';

/** Individual CSS transforms keep the existing GSAP skew/reveal transform intact. */
export function animateSectionArrival(section: HTMLElement, arrival = true): () => void {
  if (prefersReducedMotion() || section.id === 'top') return () => {};
  const candidates = Array.from(
    section.querySelectorAll<HTMLElement>('h2,h3,p,[data-contact-word]'),
  ).filter((node) => {
    const rect = node.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.top < innerHeight &&
      !node.closest('[aria-hidden="true"]')
    );
  });
  const targets = candidates.filter(
    (node) => !candidates.some((other) => other !== node && other.contains(node)),
  );
  const resets: (() => void)[] = [];
  const ctx = gsap.context(() => {}, section);
  const release = claimArrivalTargets(targets, () => {
    ctx.revert();
    resets.forEach((reset) => reset());
  });
  ctx.add(() => {
    targets.forEach((node, index) => {
      const rect = node.getBoundingClientRect();
      const pose = sectionEntryPose(
        section.id,
        index,
        { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        { w: innerWidth, h: innerHeight },
        arrival,
      );
      const previous = {
        translate: node.style.translate,
        rotate: node.style.rotate,
        scale: node.style.scale,
      };
      const reset = () => {
        Object.assign(node.style, previous);
        for (const key of ['x', 'y', 'scale', 'rotation'])
          node.style.removeProperty(`--section-entry-${key}`);
      };
      resets.push(reset);
      node.style.translate = 'var(--section-entry-x) var(--section-entry-y)';
      node.style.rotate = 'var(--section-entry-rotation)';
      node.style.scale = 'var(--section-entry-scale)';
      gsap.fromTo(
        node,
        {
          '--section-entry-x': `${pose.x}px`,
          '--section-entry-y': `${pose.y}px`,
          '--section-entry-scale': pose.scale,
          '--section-entry-rotation': `${pose.rotation}deg`,
        },
        {
          '--section-entry-x': '0px',
          '--section-entry-y': '0px',
          '--section-entry-scale': 1,
          '--section-entry-rotation': '0deg',
          duration: MOTION_DURATION.standard,
          delay: index * MOTION_STAGGER.glyph,
          ease: MOTION_EASE.standard,
          overwrite: 'auto',
          onComplete: reset,
        },
      );
    });
  });
  return release;
}
