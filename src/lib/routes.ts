import type { ProjectSlug } from './content';

/**
 * Three outcomes, not two.
 *
 * Resolving an unknown path to `home` is why a wrong URL used to show the
 * home page at HTTP 200 with `robots: index, follow`, the reader had no way
 * to tell they had mistyped, and a crawler had no way to tell either.
 */
export type Route =
  | { kind: 'home' }
  | { kind: 'case'; slug: ProjectSlug }
  | { kind: 'notFound'; path: string };

const CASE_PATH = /^\/work\/(emprega-co|doces-da-pati|helppet)$/;

export function isPublicPath(pathname: string): boolean {
  const normalized = pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname;
  return normalized === '/' || CASE_PATH.test(normalized);
}

export function resolveRoute(pathname: string): Route {
  const normalized = pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname;
  if (normalized === '/') return { kind: 'home' };
  const match = normalized.match(CASE_PATH);
  if (match) return { kind: 'case', slug: match[1] as ProjectSlug };
  return { kind: 'notFound', path: normalized };
}

export function isSameRoute(left: Route, right: Route): boolean {
  if (left.kind !== right.kind) return false;
  if (left.kind === 'home' || right.kind === 'home') return true;
  if (left.kind === 'notFound' || right.kind === 'notFound') {
    // Two different wrong URLs are two different destinations: the page names
    // the path it could not find.
    return left.kind === 'notFound' && right.kind === 'notFound'
      ? left.path === right.path
      : false;
  }
  return left.slug === right.slug;
}

export function hrefForCase(slug: ProjectSlug): string {
  return `/work/${slug}`;
}
