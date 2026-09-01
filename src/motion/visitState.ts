/**
 * Which entry the reader gets.
 *
 * The decision is pure so it can be tested without a browser: storage access
 * and its failure modes live in `readVisitSeen`, and the caller passes the
 * resolved booleans in. A first visit earns the full composition once; every
 * later visit in the same session gets a short pulse, because a long animation
 * on every arrival is exactly what the spec rules out.
 */

export type VisitMode = 'first' | 'repeat' | 'static';

export interface VisitInput {
  /** The reader has already been through the entry in this session. */
  seen: boolean;
  /** `prefers-reduced-motion: reduce`. */
  reduced: boolean;
}

export function visitMode({ seen, reduced }: VisitInput): VisitMode {
  // Reduced motion is a completion state, not a shorter animation, so it wins
  // over the repeat pulse as well as over the first entry.
  if (reduced) return 'static';
  return seen ? 'repeat' : 'first';
}

export const VISIT_STORAGE_KEY = 'singularity:entry-seen';

/** The slice of `sessionStorage` this module needs, so tests can substitute it. */
export interface VisitStorage {
  getItem(key: string): string | null;
}

/**
 * Session storage throws rather than returning null in private mode and under
 * blocked third-party storage. A reader who cannot be remembered is simply a
 * first-time reader — never a crash, and never a missing interface.
 */
export function readVisitSeen(storage: VisitStorage | null | undefined): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(VISIT_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markVisitSeen(): void {
  try {
    window.sessionStorage?.setItem(VISIT_STORAGE_KEY, 'true');
  } catch {
    // Nothing to recover: the reader just sees the full entry again next time.
  }
}

/** Reads the real session storage, guarded for environments that deny it. */
export function currentVisitStorage(): VisitStorage | null {
  try {
    return window.sessionStorage ?? null;
  } catch {
    return null;
  }
}
