import { useEffect } from 'react';
import { gsap } from '../lib/gsap';
import { useMediaQuery } from './useMediaQuery';
import { useReducedMotion } from './useReducedMotion';

/** Magnetic translation is independent of route, entrance and press transforms. */
export function useMagneticElements(key: unknown): void {
  const reduced = useReducedMotion();
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  useEffect(() => {
    if (reduced || !fine) return;
    const elements = Array.from(document.querySelectorAll<HTMLElement>('a, button')).filter(
      (element) => !element.hasAttribute('data-no-magnetic'),
    );
    const cleanups = elements.map((element) => {
      const offset = { x: 0, y: 0 };
      const paint = () => {
        element.style.setProperty('--magnetic-x', `${offset.x}px`);
        element.style.setProperty('--magnetic-y', `${offset.y}px`);
      };
      const moveX = gsap.quickTo(offset, 'x', {
        duration: 0.35,
        ease: 'power3.out',
        onUpdate: paint,
      });
      const moveY = gsap.quickTo(offset, 'y', {
        duration: 0.35,
        ease: 'power3.out',
        onUpdate: paint,
      });
      const settle = () => {
        moveX(0);
        moveY(0);
      };
      const move = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        moveX(
          Math.max(-6, Math.min(6, (event.clientX - rect.left - rect.width / 2) * 0.12)),
        );
        moveY(
          Math.max(-6, Math.min(6, (event.clientY - rect.top - rect.height / 2) * 0.12)),
        );
      };
      element.dataset.magnetic = '';
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerleave', settle);
      element.addEventListener('blur', settle);
      return () => {
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerleave', settle);
        element.removeEventListener('blur', settle);
        moveX.tween.kill();
        moveY.tween.kill();
        element.style.removeProperty('--magnetic-x');
        element.style.removeProperty('--magnetic-y');
        delete element.dataset.magnetic;
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [key, reduced, fine]);
}
