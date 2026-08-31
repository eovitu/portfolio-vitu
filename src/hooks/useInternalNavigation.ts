import { useEffect } from 'react';
import { isPublicPath } from '../lib/routes';
import { isEligibleInternalClick, type NavigationCause } from '../motion/routeIntent';

export interface NavigationContext {
  cause: NavigationCause;
  trigger?: HTMLElement;
  mediaFrame?: HTMLElement;
  projectSlug?: 'emprega-co' | 'doces-da-pati' | 'helppet';
  savedScrollY?: number;
}

type Navigate = (href: string, context: NavigationContext) => Promise<void>;

function causeFor(anchor: HTMLAnchorElement): NavigationCause {
  const value = anchor.dataset.transitionCause;
  if (value === 'brand' || value === 'previous' || value === 'next' || value === 'hash') {
    return value;
  }
  return 'link';
}

export function useInternalNavigation(navigate: Navigate): void {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || !isEligibleInternalClick(event, anchor, window.location.origin)) return;

      const url = new URL(anchor.href);
      if (!isPublicPath(url.pathname)) return;
      event.preventDefault();
      void navigate(url.href, {
        cause: causeFor(anchor),
        trigger: anchor,
        mediaFrame: anchor.closest<HTMLElement>('[data-project]')?.querySelector(
          '[data-project-media]',
        ) as HTMLElement | undefined,
        projectSlug: anchor.dataset.transitionProject as NavigationContext['projectSlug'],
      }).catch(() => undefined);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);
}
