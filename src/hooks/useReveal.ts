import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { EASE, REVEAL, type RevealKind } from '../lib/motion';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';

/**
 * Scroll reveals for a section.
 *
 * Markup contract (mirrors the `data-reveal` attribute of the design source):
 *   - `data-reveal="line" | "soft" | "slow"` marks an element to reveal.
 *   - elements sharing the closest `[data-reveal-group]` ancestor animate
 *     together with a stagger; otherwise the whole section is one group.
 *
 * Everything is created inside a `gsap.context` scoped to `scopeRef`, so a
 * single `ctx.revert()` on unmount kills the tweens *and* their ScrollTriggers
 * and restores inline styles.
 */
export function useReveal(scopeRef: RefObject<HTMLElement>): void {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const reduce = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const nodes = Array.from(scope.querySelectorAll<HTMLElement>('[data-reveal]'));
      if (!nodes.length) return;

      if (reduce) {
        // Content must be fully visible and readable — no transforms at all.
        gsap.set(nodes, { clearProps: 'all' });
        return;
      }

      const groups = new Map<Element, HTMLElement[]>();
      nodes.forEach((node) => {
        const key = node.closest('[data-reveal-group]') ?? scope;
        const list = groups.get(key);
        if (list) list.push(node);
        else groups.set(key, [node]);
      });

      groups.forEach((els) => {
        // A group can legitimately mix kinds (e.g. a label + a paragraph);
        // tween each kind separately so the presets stay intact.
        const byKind = new Map<RevealKind, HTMLElement[]>();
        els.forEach((el) => {
          const kind = (el.dataset.reveal as RevealKind) || 'soft';
          const preset = REVEAL[kind] ? kind : 'soft';
          const list = byKind.get(preset);
          if (list) list.push(el);
          else byKind.set(preset, [el]);
        });

        byKind.forEach((targets, kind) => {
          const preset = REVEAL[kind];
          // A single `fromTo` (not `set` + `to`): a standalone `set` writes the
          // transform as pixels, and the later tween then reads `yPercent` as
          // already 0 — the element would never move. `immediateRender` puts
          // the "from" state in place at creation, so nothing flashes either.
          gsap.fromTo(targets, preset.from, {
            ...preset.to,
            duration: preset.duration,
            stagger: preset.stagger,
            ease: EASE,
            immediateRender: true,
            scrollTrigger: {
              trigger: targets[0].closest('section') ?? scope,
              start: 'top 78%',
              once: true,
            },
          });
        });
      });
    }, scope);

    return () => ctx.revert();
  }, [scopeRef]);
}
