/**
 * The snapshot that makes a reload look like it never happened.
 *
 * WHY THIS EXISTS
 * A real F5 destroys the old DOM. There is no way to animate the previous
 * page out — by the time anything of ours runs, it is already gone. So the
 * exit is *staged* on the new page instead: on `pagehide` we record what the
 * reader could see, and the new load rebuilds a throwaway copy of it (see
 * `lib/ghosts`) which the singularity then swallows.
 *
 * NOTE ON SCROLL OWNERSHIP
 * This module used to also restore the previous scroll offset. It no longer
 * does, and nothing else does either: from now on **every reload lands on the
 * hero, at the top**. The saved offset survives only as the *starting point*
 * of the camera travel, never as a destination. `scrollRestoration` is still
 * forced to `manual` so the browser cannot re-introduce a second owner.
 */

import { dropNested, isOnScreen, WARP } from './warpTargets';

const KEY = 'singularity:warp';

/** Above this the snapshot is not worth reconstructing — fall back to a first visit. */
const MAX_BYTES = 50_000;
const MAX_TARGETS = 40;

export interface WarpRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Just enough typography for a ghost to lay its text out the same way. */
export interface WarpType {
  ff: string;
  fs: string;
  fw: string;
  fst: string;
  ls: string;
  lh: string;
  tt: string;
  color: string;
  ta: string;
}

/**
 * One word, measured where it actually sat.
 *
 * Re-laying the text out on the next page (in a probe element with the
 * container's font) was accurate to ~20px, because a marked block is rarely a
 * single uniform run of text: it has padding, nested headings, its own line
 * boxes. Measuring the real glyph runs with a `Range` removes the guesswork
 * and the dependency on web fonts having finished loading.
 */
export interface WarpWord {
  x: number;
  y: number;
  w: number;
  h: number;
  /** The word itself. */
  t: string;
  /** Index into the snapshot's shared style table. */
  s: number;
}

export interface WarpTarget {
  rect: WarpRect;
  words: WarpWord[];
}

export interface WarpSnapshot {
  /** Snapshots are route-scoped: a different path is a different composition. */
  path: string;
  /** Where the reader was — the origin of the camera travel, not a destination. */
  scrollY: number;
  /** Nearest section id, for reporting/debugging. */
  section: string;
  viewport: { w: number; h: number };
  /** Shared style table — a block's words rarely all share one style. */
  styles: WarpType[];
  targets: WarpTarget[];
}

let pending: WarpSnapshot | null = null;

function readType(el: Element): WarpType {
  const s = getComputedStyle(el);
  return {
    ff: s.fontFamily,
    fs: s.fontSize,
    fw: s.fontWeight,
    fst: s.fontStyle,
    ls: s.letterSpacing,
    lh: s.lineHeight,
    tt: s.textTransform,
    color: s.color,
    ta: s.textAlign,
  };
}

/** Beyond these the reconstruction stops being worth its bytes. */
const MAX_WORDS_TOTAL = 240;
const MAX_WORDS_PER_TARGET = 60;

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * Measure every visible word inside a target, exactly where it is painted.
 *
 * A `Range` over the text node gives the true glyph box — the same box the
 * reader was looking at, including whatever padding, alignment and nested
 * typography the block happens to use.
 */
function measureWords(
  el: HTMLElement,
  styles: WarpType[],
  styleIndex: Map<Element, number>,
  remaining: number,
): WarpWord[] {
  const out: WarpWord[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = (node as Text).data;
    if (!text.trim()) continue;

    const parent = node.parentElement;
    if (!parent) continue;
    let si = styleIndex.get(parent);
    if (si === undefined) {
      si = styles.push(readType(parent)) - 1;
      styleIndex.set(parent, si);
    }

    const re = /\S+/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      if (out.length >= MAX_WORDS_PER_TARGET || out.length >= remaining) return out;
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const r = range.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      out.push({
        x: round(r.left),
        y: round(r.top),
        w: round(r.width),
        h: round(r.height),
        t: match[0].slice(0, 40),
        s: si,
      });
    }
  }
  return out;
}

function capture(): WarpSnapshot | null {
  const targets = dropNested(Array.from(document.querySelectorAll<HTMLElement>(WARP)))
    .filter(isOnScreen)
    .slice(0, MAX_TARGETS + 1);

  // Over the bound: reconstructing this would cost more than it buys.
  if (!targets.length || targets.length > MAX_TARGETS) return null;

  const section =
    document.querySelector<HTMLElement>('section[id], [id="work"], [id="top"]')?.id ?? '';

  const styles: WarpType[] = [];
  const styleIndex = new Map<Element, number>();
  let budget = MAX_WORDS_TOTAL;

  const captured: WarpTarget[] = targets.map((el) => {
    const r = el.getBoundingClientRect();
    const words = measureWords(el, styles, styleIndex, budget);
    budget -= words.length;
    return {
      rect: { x: round(r.left), y: round(r.top), w: round(r.width), h: round(r.height) },
      words,
    };
  });

  return {
    path: location.pathname,
    scrollY: window.scrollY,
    section,
    viewport: { w: window.innerWidth, h: window.innerHeight },
    styles,
    targets: captured,
  };
}

function isUsable(shot: WarpSnapshot | null): shot is WarpSnapshot {
  return (
    !!shot &&
    shot.path === location.pathname &&
    Array.isArray(shot.targets) &&
    shot.targets.length > 0 &&
    shot.targets.length <= MAX_TARGETS
  );
}

/**
 * Hold the top until the reader actually asks to leave it.
 *
 * Setting `scrollRestoration = 'manual'` early stops the *browser* from moving
 * us, but it is not the only thing that can. The document keeps growing after
 * mount — the WORK pin spacer alone adds ~1900px — and every party that
 * measures it (ScrollTrigger's refresh, Lenis syncing its virtual offset) is
 * capable of writing a scroll position while doing so. A single check right
 * after load cannot see any of that; it happens later.
 *
 * So the invariant is enforced continuously instead of asserted once: until
 * the reader produces genuine scroll intent, scrollY is 0, and anything that
 * says otherwise is undone on the spot. Real input releases the guard
 * immediately, so it can never fight the reader — including the skip link and
 * the nav anchors, which are all preceded by a key or pointer event.
 */
/**
 * How many times the guard had to undo someone else's scroll, and how far.
 * Published for the verification harness: "it ended at 0" is a much weaker
 * claim than "nothing ever tried to move it", and only this can tell them
 * apart.
 */
export const scrollGuard = { corrections: 0, worst: 0, released: false };

function holdTop(): void {
  let released = false;

  const release = () => {
    if (released) return;
    released = true;
    scrollGuard.released = true;
    window.removeEventListener('scroll', onScroll);
    for (const type of INTENT) window.removeEventListener(type, release);
  };

  const onScroll = () => {
    if (released) return;
    const y = window.scrollY;
    if (y === 0) return;
    scrollGuard.corrections += 1;
    scrollGuard.worst = Math.max(scrollGuard.worst, Math.abs(y));
    window.scrollTo(0, 0);
  };

  const INTENT = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
  window.addEventListener('scroll', onScroll, { passive: true });
  for (const type of INTENT) {
    window.addEventListener(type, release, { passive: true, once: true });
  }
}

/**
 * Must run before React renders: it takes over scroll restoration and reads
 * (and consumes) the snapshot the previous page left behind.
 */
export function initReloadSnapshot(): void {
  if (typeof window === 'undefined') return;

  // Belt and braces — the authoritative write is the inline script in
  // index.html, which runs before this module is even fetched.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  holdTop();

  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (raw && raw.length <= MAX_BYTES) {
      const parsed = JSON.parse(raw) as WarpSnapshot;
      pending = isUsable(parsed) ? parsed : null;
    }
  } catch {
    // Corrupt, foreign, or storage disabled — behave like a first visit.
    pending = null;
  }

  const save = () => {
    try {
      const shot = capture();
      if (!shot) {
        sessionStorage.removeItem(KEY);
        return;
      }
      const raw = JSON.stringify(shot);
      if (raw.length > MAX_BYTES) sessionStorage.removeItem(KEY);
      else sessionStorage.setItem(KEY, raw);
    } catch {
      // The choreography is a courtesy, never a requirement.
    }
  };

  // `pagehide` covers the bfcache and mobile Safari; `beforeunload` covers
  // the ordinary F5 path.
  window.addEventListener('pagehide', save);
  window.addEventListener('beforeunload', save);
}

/** True when this load was an actual reload rather than a fresh navigation. */
export function isReloadNavigation(): boolean {
  const nav = performance.getEntriesByType('navigation')[0] as
    PerformanceNavigationTiming | undefined;
  return nav?.type === 'reload';
}

/** Consumes the snapshot. Returns it, or null when this is a first visit. */
export function consumeSnapshot(): WarpSnapshot | null {
  const value = pending;
  pending = null;
  return value;
}
