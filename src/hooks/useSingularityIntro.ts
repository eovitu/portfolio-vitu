import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';
import { getGhostLayer } from '../lib/ghosts';
import { elapsedSinceFirstFrame, markEnd } from '../lib/introAudit';
import { dropNested, isOnScreen, WARP } from '../lib/warpTargets';
import { fragmentPose, reloadPlan } from '../motion/sectionChoreography';
import { SECTION_MOTION_STRENGTH } from '../motion/tokens';

interface Options {
  onLock?: () => void;
  onRelease?: () => void;
  onRestore?: (position: number) => void;
}
/** Reload animates the captured viewport and reconciles hydration geometry until release. */
export function useSingularityIntro(
  ready: boolean,
  { onLock, onRelease, onRestore }: Options = {},
): void {
  const pendingDestroy = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (!ready) return;
    if (pendingDestroy.current !== null) window.clearTimeout(pendingDestroy.current);
    const ghosts = getGhostLayer();
    const plan = reloadPlan(
      ghosts ? { section: ghosts.section, scrollY: ghosts.fromScrollY } : null,
      prefersReducedMotion(),
      elapsedSinceFirstFrame(),
    );
    const releaseStaging = () => document.documentElement.classList.remove('warp-staging');
    if (!ghosts || !plan.animate) {
      ghosts?.destroy();
      releaseStaging();
      markEnd();
      onRelease?.();
      return;
    }
    // Hide only the current visual targets, preserving every existing transform and inline style.
    const targets = dropNested(
      Array.from(document.querySelectorAll<HTMLElement>(WARP)),
    ).filter(isOnScreen);
    const saved = targets.map((el) => ({ el, visibility: el.style.visibility }));
    saved.forEach(({ el }) => {
      el.style.visibility = 'hidden';
    });
    releaseStaging();
    // Header stays above the ghost plane; move its real items on this same timeline.
    const nav = dropNested(
      Array.from(
        document.querySelectorAll<HTMLElement>('[data-nav-item], [data-talk-position]'),
      ),
    ).filter(isOnScreen);
    const navTransforms = nav.map((el) => ({ el, transform: el.style.transform }));
    const restoreNav = () =>
      navTransforms.forEach(({ el, transform }) => {
        el.style.transform = transform;
      });
    let released = false;
    let timer = 0;
    // Desktop theater hydration changes document height after native restoration.
    // Reconcile only while the captured reload owns the viewport; gestures cancel it.
    const restore = () => onRestore?.(ghosts.fromScrollY);
    const geometry = new ResizeObserver(restore);
    const content = document.getElementById('root');
    if (content) geometry.observe(content);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => {
      if (released) return;
      released = true;
      window.clearTimeout(timer);
      geometry.disconnect();
      saved.forEach(({ el, visibility }) => {
        el.style.visibility = visibility;
      });
      restoreNav();
      ghosts.destroy();
      releaseStaging();
      markEnd();
      onRelease?.();
    };
    onLock?.();
    restore();
    const tl = gsap.timeline({ onComplete: finish });
    const span = Math.max(1, ghosts.fragments.length - 1);
    ghosts.fragments.forEach((fragment, index) => {
      const base = fragmentPose(ghosts.section, index, fragment.center, {
        w: window.innerWidth,
        h: window.innerHeight,
      });
      const strength = SECTION_MOTION_STRENGTH.reload;
      const pose = {
        x: base.x * strength,
        y: base.y * strength,
        scale: Math.max(0.1, 1 + (base.scale - 1) * strength),
        rotate: base.rotate * strength,
      };
      const at = (index / span) * 0.18;
      tl.to(fragment.el, { ...pose, duration: 0.42, ease: 'power2.inOut' }, at).to(
        fragment.el,
        { x: 0, y: 0, scale: 1, rotate: 0, duration: 0.78, ease: 'expo.out' },
        at + 0.42,
      );
    });
    nav.forEach((el, index) => {
      const r = el.getBoundingClientRect();
      const pose = fragmentPose(
        ghosts.section,
        index,
        { x: r.left + r.width / 2, y: r.top + r.height / 2 },
        { w: innerWidth, h: innerHeight },
      );
      tl.to(
        el,
        {
          x: Math.max(-12, Math.min(12, pose.x)),
          y: Math.max(-10, Math.min(10, pose.y)),
          duration: 0.42,
          ease: 'power2.inOut',
        },
        0,
      ).to(el, { x: 0, y: 0, duration: 0.78, ease: 'expo.out' }, 0.42);
    });
    tl.timeScale(tl.duration() / plan.duration);
    const cancel = () => {
      tl.kill();
      finish();
    };
    window.addEventListener('resize', cancel);
    // Release the intro before Lenis handles this same gesture in the bubble phase.
    window.addEventListener('wheel', cancel, { passive: true, capture: true });
    window.addEventListener('touchstart', cancel, { passive: true, capture: true });
    window.addEventListener('keydown', cancel, true);
    media.addEventListener('change', cancel);
    timer = window.setTimeout(cancel, Math.max(0, 3.2 - elapsedSinceFirstFrame()) * 1000);
    return () => {
      tl.kill();
      window.clearTimeout(timer);
      geometry.disconnect();
      window.removeEventListener('resize', cancel);
      window.removeEventListener('wheel', cancel, true);
      window.removeEventListener('touchstart', cancel, true);
      window.removeEventListener('keydown', cancel, true);
      media.removeEventListener('change', cancel);
      saved.forEach(({ el, visibility }) => {
        el.style.visibility = visibility;
      });
      restoreNav();
      if (!released) {
        released = true;
        onRelease?.();
      }
      releaseStaging();
      // Preserve the pre-React snapshot across StrictMode's immediate effect probe.
      pendingDestroy.current = window.setTimeout(() => {
        if (getGhostLayer() === ghosts) ghosts.destroy();
      }, 0);
    };
  }, [ready, onLock, onRelease, onRestore]);
}
