import type { ProjectSlug } from '../lib/content.ts';
import type { Route } from '../lib/routes.ts';

export type NavigationCause = 'link' | 'popstate' | 'brand' | 'previous' | 'next' | 'hash';

interface RouteIntent {
  id?: number;
  from: Route;
  to: Route;
  cause?: NavigationCause;
  hash?: string;
  projectSlug?: ProjectSlug;
  savedScrollY?: number;
}

type ScrollTarget =
  { kind: 'top' } | { kind: 'selector'; value: string } | { kind: 'saved'; value: number };

interface ClickLike {
  defaultPrevented: boolean;
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

interface AnchorLike {
  href: string;
  target: string;
  download: string;
  origin: string;
}

export function isEligibleInternalClick(
  event: ClickLike,
  anchor: AnchorLike,
  currentOrigin: string,
): boolean {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    anchor.download ||
    (anchor.target && anchor.target !== '_self') ||
    anchor.origin !== currentOrigin
  ) {
    return false;
  }

  const url = new URL(anchor.href, currentOrigin);
  return url.protocol === 'http:' || url.protocol === 'https:';
}

/**
 * A failed visual transition must never turn a real link into a dead control.
 * Superseded clicks and browser-history navigation already have another owner;
 * every other failure may safely fall back to a normal document navigation.
 */
export function shouldFallbackToDocumentNavigation(
  cause: NavigationCause,
  failureReason?: unknown,
): boolean {
  return cause !== 'popstate' && failureReason !== 'superseded';
}

export function scrollTargetFor(intent: RouteIntent): ScrollTarget {
  if (intent.cause === 'popstate' && Number.isFinite(intent.savedScrollY)) {
    return { kind: 'saved', value: Math.max(0, intent.savedScrollY ?? 0) };
  }
  if (intent.hash?.startsWith('#')) {
    return { kind: 'selector', value: intent.hash };
  }
  if (intent.from.kind === 'case' && intent.to.kind === 'home') {
    const slug = intent.projectSlug ?? intent.from.slug;
    return { kind: 'selector', value: `[data-project="${slug}"]` };
  }
  return { kind: 'top' };
}
