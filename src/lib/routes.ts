import type { ProjectSlug } from './content';

export type Route = { kind: 'home' } | { kind: 'case'; slug: ProjectSlug };

const CASE_PATH = /^\/work\/(emprega-co|doces-da-pati|helppet)$/;

export function resolveRoute(pathname: string): Route {
  const normalized = pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname;
  const match = normalized.match(CASE_PATH);
  return match ? { kind: 'case', slug: match[1] as ProjectSlug } : { kind: 'home' };
}

export function hrefForCase(slug: ProjectSlug): string {
  return `/work/${slug}`;
}
