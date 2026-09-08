/**
 * The snapshot that makes a reload look like it never happened.
 *
 * WHY THIS EXISTS
 * A real F5 destroys the old DOM. There is no way to animate the previous
 * page out, by the time anything of ours runs, it is already gone. So the
 * exit is *staged* on the new page instead: on `pagehide` we record what the
 * reader could see, and the new load rebuilds a throwaway copy of it (see
 * `lib/ghosts`) which the singularity then swallows.
 *
 * NOTE ON SCROLL OWNERSHIP
 * This module records visual continuity only. The browser remains the owner of
 * reload scroll restoration, while the route director owns SPA navigation.
 */

import { dropNested, isOnScreen, WARP } from './warpTargets';

const KEY = 'singularity:warp';

/** Above this the snapshot is not worth reconstructing, fall back to a first visit. */
const MAX_BYTES = 50_000;
const MAX_TARGETS = 40;

interface WarpRect {
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

interface WarpTarget {
  rect: WarpRect;
  words: WarpWord[];
  /** Media boxes inside the target: images, video, canvas, inline SVG. */
  media: WarpRect[];
}

export interface WarpSnapshot {
  /** Snapshots are route-scoped: a different path is a different composition. */
  path: string;
  /** Where the reader was, the origin of the camera travel, not a destination. */
  scrollY: number;
  /** Nearest section id, for reporting/debugging. */
  section: string;
  viewport: { w: number; h: number };
  /** Shared style table, a block's words rarely all share one style. */
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
const MAX_MEDIA_TOTAL = 24;
const MAX_MEDIA_PER_TARGET = 6;

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * Boxes for the images, video and canvases sitting inside a target.
 *
 * A target with words gets one fragment per word and nothing else, a media
 * element next to that copy (a photo beside an "About" paragraph, a poster
 * behind a card's text) has no words of its own, so it was falling through
 * entirely: neither the whole-target plate (only used when a target has zero
 * words) nor any word fragment ever represented it. It has to be measured
 * separately and swallowed as its own plate alongside the text.
 */
function measureMedia(el: HTMLElement, remaining: number): WarpRect[] {
  const out: WarpRect[] = [];
  // `picture` only ever wraps an `img`, which this query already reaches.
  const nodes = el.querySelectorAll<HTMLElement>('img, video, canvas, svg');
  for (const node of nodes) {
    if (out.length >= MAX_MEDIA_PER_TARGET || out.length >= remaining) break;
    const r = node.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    out.push({ x: round(r.left), y: round(r.top), w: round(r.width), h: round(r.height) });
  }
  return out;
}

/**
 * Measure every visible word inside a target, exactly where it is painted.
 *
 * A `Range` over the text node gives the true glyph box, the same box the
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
  let wordBudget = MAX_WORDS_TOTAL;
  let mediaBudget = MAX_MEDIA_TOTAL;

  const captured: WarpTarget[] = targets.map((el) => {
    const r = el.getBoundingClientRect();
    const words = measureWords(el, styles, styleIndex, wordBudget);
    wordBudget -= words.length;
    const media = measureMedia(el, mediaBudget);
    mediaBudget -= media.length;
    return {
      rect: { x: round(r.left), y: round(r.top), w: round(r.width), h: round(r.height) },
      words,
      media,
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

const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

function isUsable(shot: WarpSnapshot | null): shot is WarpSnapshot {
  return (
    !!shot &&
    shot.path === location.pathname &&
    finite(shot.scrollY) &&
    !!shot.viewport &&
    finite(shot.viewport.w) &&
    shot.viewport.w > 0 &&
    finite(shot.viewport.h) &&
    shot.viewport.h > 0 &&
    Array.isArray(shot.styles) &&
    Array.isArray(shot.targets) &&
    shot.targets.length > 0 &&
    shot.targets.length <= MAX_TARGETS &&
    shot.targets.every(
      (target) =>
        !!target?.rect &&
        finite(target.rect.x) &&
        finite(target.rect.y) &&
        finite(target.rect.w) &&
        target.rect.w > 0 &&
        finite(target.rect.h) &&
        target.rect.h > 0 &&
        Array.isArray(target.words) &&
        Array.isArray(target.media),
    )
  );
}

/** Kept until the legacy intro audit is removed; native scroll has no guard. */
export const scrollGuard = { corrections: 0, worst: 0, released: true };

/**
 * Must run before React renders so it can consume the previous visual snapshot.
 */
export function initReloadSnapshot(): void {
  if (typeof window === 'undefined') return;

  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (raw && raw.length <= MAX_BYTES) {
      const parsed = JSON.parse(raw) as WarpSnapshot;
      pending = isUsable(parsed) ? parsed : null;
    }
  } catch {
    // Corrupt, foreign, or storage disabled, behave like a first visit.
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
