import { isPublicPath } from '../lib/routes.ts';

interface PortfolioHistoryState {
  path: string;
  scrollY?: number;
}

export function normalizeHistoryState(value: unknown): PortfolioHistoryState | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as { path?: unknown; scrollY?: unknown };
  if (typeof candidate.path !== 'string' || !isPublicPath(candidate.path)) return null;

  const state: PortfolioHistoryState = { path: candidate.path };
  if (typeof candidate.scrollY === 'number' && Number.isFinite(candidate.scrollY)) {
    state.scrollY = Math.max(0, candidate.scrollY);
  }
  return state;
}
