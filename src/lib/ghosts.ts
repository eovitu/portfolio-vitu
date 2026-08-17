/**
 * The ghost layer — the theatre that hides the reload.
 *
 * A real F5 destroys the previous DOM, so the content that is about to be
 * swallowed cannot be the real content: it no longer exists. Instead the new
 * page rebuilds a throwaway, non-interactive copy of what the reader could see
 * (from `lib/reloadSnapshot`), paints it at exactly the coordinates it had,
 * and lets the singularity eat *that*.
 *
 * WHY FRAGMENTS
 * In the previous phase a block of copy was marked `[data-warp]` on its
 * container — necessary, or the block's rule and background would be left
 * behind. The cost was that an inner section absorbed as one sliding rectangle
 * instead of as matter: a blur, not a journey. Ghosts are new, disposable
 * elements, so that constraint does not apply to them — the snapshot records
 * every word's real glyph box, and each word (or line, for long copy) gets its
 * own vector, curve and delay.
 *
 * The layer is mounted *before React renders* so the very first painted frame
 * already shows the page where the reader left it.
 */

import type { WarpSnapshot, WarpType, WarpWord } from './reloadSnapshot';
import { coreOrigin, type Point } from './warpTargets';

/** Beyond this the swallow reads as noise and costs frames. */
const MAX_FRAGMENTS = 120;
/** A target with more words than this is fragmented by line instead. */
const MAX_WORDS_PER_TARGET = 12;
/** A resize invalidates every saved rect — do not pretend otherwise. */
const VIEWPORT_TOLERANCE = 0.05;

export interface GhostFragment {
  el: HTMLElement;
  /** Viewport-space centre at rest — the origin of its vector to the core. */
  center: Point;
  /** Distance to the core, used to stagger from the outside in. */
  distance: number;
}

/**
 * Per-fragment proof that the illusion lines up: the box the previous page
 * recorded versus the box the stand-in actually occupies on this one.
 */
export interface GhostFidelity {
  saved: { x: number; y: number; w: number; h: number };
  actual: { x: number; y: number; w: number; h: number };
  dx: number;
  dy: number;
  dw: number;
  dh: number;
  /** True when the fragment sits inside the container rect it came from. */
  insideTarget: boolean;
}

export interface GhostLayer {
  root: HTMLElement;
  fragments: GhostFragment[];
  fidelity: GhostFidelity[];
  /** Where the reader was, in scroll pixels: the camera's starting altitude. */
  fromScrollY: number;
  destroy: () => void;
}

let current: GhostLayer | null = null;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  t: string;
  s: number;
}

function makeFragment(box: Box, type: WarpType | null): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-ghost', '');
  el.style.position = 'absolute';
  el.style.left = `${box.x}px`;
  el.style.top = `${box.y}px`;
  el.style.width = `${box.w}px`;
  el.style.height = `${box.h}px`;
  el.style.margin = '0';
  el.style.padding = '0';
  el.style.whiteSpace = 'pre';
  el.style.willChange = 'transform, opacity';

  if (type && box.t) {
    el.style.fontFamily = type.ff;
    el.style.fontSize = type.fs;
    el.style.fontWeight = type.fw;
    el.style.fontStyle = type.fst;
    el.style.letterSpacing = type.ls;
    el.style.textTransform = type.tt;
    el.style.color = type.color;
    // The saved box is the tight glyph box, so the safest way to land the
    // text back inside it is to make the line box exactly that tall.
    el.style.lineHeight = `${box.h}px`;
    el.textContent = box.t;
  } else {
    // A media cell has no text. Leaving a hole there would make the
    // composition read as half-empty, so it is swallowed as a faint plate.
    el.style.background = 'rgba(255,255,255,0.045)';
    el.style.borderRadius = '2px';
  }
  return el;
}

/** Merge word boxes that share a baseline into one box per visual line. */
function groupIntoLines(words: WarpWord[]): Box[] {
  const lines: Box[] = [];
  for (const w of words) {
    const line = lines.find((l) => Math.abs(l.y - w.y) < w.h * 0.6);
    if (!line) {
      lines.push({ x: w.x, y: w.y, w: w.w, h: w.h, t: w.t, s: w.s });
      continue;
    }
    const right = Math.max(line.x + line.w, w.x + w.w);
    line.x = Math.min(line.x, w.x);
    line.w = right - line.x;
    line.h = Math.max(line.h, w.h);
    line.t += ` ${w.t}`;
  }
  return lines;
}

function describe(el: HTMLElement, origin: Point): GhostFragment {
  const r = el.getBoundingClientRect();
  const center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  return {
    el,
    center,
    distance: Math.hypot(origin.x - center.x, origin.y - center.y),
  };
}

/**
 * Build the layer. Returns null whenever the illusion cannot be trusted —
 * the caller then behaves exactly as on a first visit.
 */
export function mountGhosts(snapshot: WarpSnapshot): GhostLayer | null {
  const dw = Math.abs(snapshot.viewport.w - window.innerWidth) / window.innerWidth;
  const dh = Math.abs(snapshot.viewport.h - window.innerHeight) / window.innerHeight;
  if (dw > VIEWPORT_TOLERANCE || dh > VIEWPORT_TOLERANCE) return null;

  const root = document.createElement('div');
  root.setAttribute('data-ghost-layer', '');
  root.setAttribute('aria-hidden', 'true');
  root.style.cssText =
    'position:fixed;inset:0;z-index:4;pointer-events:none;contain:layout style paint;';
  document.body.appendChild(root);

  const origin = coreOrigin();
  const fragments: GhostFragment[] = [];
  const fidelity: GhostFidelity[] = [];

  const emit = (
    box: Box,
    type: WarpType | null,
    target: WarpSnapshot['targets'][number],
  ) => {
    if (box.w <= 0 || box.h <= 0) return;
    const el = makeFragment(box, type);
    root.appendChild(el);
    fragments.push(describe(el, origin));

    const r = el.getBoundingClientRect();
    const actual = { x: r.left, y: r.top, w: r.width, h: r.height };
    fidelity.push({
      saved: { x: box.x, y: box.y, w: box.w, h: box.h },
      actual,
      dx: Math.round((actual.x - box.x) * 10) / 10,
      dy: Math.round((actual.y - box.y) * 10) / 10,
      dw: Math.round((actual.w - box.w) * 10) / 10,
      dh: Math.round((actual.h - box.h) * 10) / 10,
      insideTarget:
        actual.x >= target.rect.x - 2 &&
        actual.y >= target.rect.y - 2 &&
        actual.x + actual.w <= target.rect.x + target.rect.w + 2 &&
        actual.y + actual.h <= target.rect.y + target.rect.h + 2,
    });
  };

  for (const target of snapshot.targets) {
    if (fragments.length >= MAX_FRAGMENTS) break;

    if (!target.words.length) {
      if (target.rect.w < 24 || target.rect.h < 24) continue;
      emit({ ...target.rect, t: '', s: -1 }, null, target);
      continue;
    }

    const pieces: Box[] =
      target.words.length > MAX_WORDS_PER_TARGET
        ? groupIntoLines(target.words)
        : target.words.map((w) => ({ x: w.x, y: w.y, w: w.w, h: w.h, t: w.t, s: w.s }));

    for (const piece of pieces) {
      if (fragments.length >= MAX_FRAGMENTS) break;
      emit(piece, snapshot.styles[piece.s] ?? null, target);
    }
  }

  if (!fragments.length) {
    root.remove();
    return null;
  }

  const layer: GhostLayer = {
    root,
    fragments,
    fidelity,
    fromScrollY: snapshot.scrollY,
    destroy: () => {
      root.remove();
      if (current === layer) current = null;
    },
  };
  current = layer;
  return layer;
}

/** The layer mounted for this load, if any. */
export function getGhostLayer(): GhostLayer | null {
  return current;
}

/** Unconditional teardown — the failsafe for an intro that never ran. */
export function destroyGhosts(): void {
  current?.destroy();
}
