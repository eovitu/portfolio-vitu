/**
 * Scroll diagnostics, for the bug that will not reproduce here.
 *
 * The WORK → interlude stutter and the HUD's distance readout jumping are
 * reported on a real machine and have never once reproduced in the headless
 * harness this project is tested with. Two rounds of reasoning from the code
 * produced a fix that did not land, so this module exists to stop reasoning
 * and start recording: it captures, on the machine where the defect actually
 * happens, every quantity the failure could be made of.
 *
 * Off unless asked for, and cheap when off — `enabled` is read once at module
 * load and every entry point returns immediately when it is false, so a normal
 * session pays one boolean test per frame and allocates nothing.
 *
 * Turn on with `?debug=scroll` in the URL, or `window.__scrollDebug = true`
 * followed by a reload.
 */

import { ScrollTrigger } from './gsap';

interface RefreshEntry {
  kind: 'refresh';
  t: number;
  by: string;
  scrollY: number;
  shBefore: number;
  shAfter: number;
  pinEndBefore: number;
  pinEndAfter: number;
  distanceBefore: number;
  distanceAfter: number;
  guarded: boolean;
}

interface FrameEntry {
  kind: 'frame';
  t: number;
  scrollY: number;
  progress: number;
  distance: number;
  velocity: number;
  sh: number;
  pinEnd: number;
}

interface HeightEntry {
  kind: 'height';
  t: number;
  scrollY: number;
  from: number;
  to: number;
  /** True when no refresh() ran in the same tick — the interesting case. */
  silent: boolean;
}

type Entry = RefreshEntry | FrameEntry | HeightEntry;

function wanted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (new URLSearchParams(window.location.search).get('debug') === 'scroll') return true;
  } catch {
    /* malformed query string is not a reason to fail */
  }
  return (window as unknown as Record<string, unknown>).__scrollDebug === true;
}

export const scrollDebugEnabled = wanted();

/**
 * Ring buffer rather than an unbounded array. A slow scroll through the
 * chapter is a few thousand frames, and a reader who has to reproduce an
 * intermittent bug may scrub the section many times before catching it — an
 * unbounded log would be the thing that makes the page stutter.
 */
const CAPACITY = 6000;
const log: Entry[] = [];
let cursor = 0;

function push(entry: Entry): void {
  if (log.length < CAPACITY) log.push(entry);
  else log[cursor] = entry;
  cursor = (cursor + 1) % CAPACITY;
}

/** Reader for the current pin geometry, installed by `useHorizontalScroll`. */
type PinProbe = () => { end: number; distance: number; progress: number };
let probe: PinProbe | null = null;

export function registerPinProbe(fn: PinProbe): () => void {
  if (!scrollDebugEnabled) return () => {};
  probe = fn;
  return () => {
    if (probe === fn) probe = null;
  };
}

function readPin() {
  try {
    return probe?.() ?? { end: -1, distance: -1, progress: -1 };
  } catch {
    return { end: -1, distance: -1, progress: -1 };
  }
}

const sh = () => document.documentElement.scrollHeight;

/** Last observed document height, so a silent change can be spotted. */
let lastHeight = -1;
/** Set for the duration of a refresh, so height changes can be attributed. */
let insideRefresh = false;
/** Who asked for the refresh currently running, when the app asked at all. */
let attribution: { by: string; guarded: boolean } | null = null;

/**
 * Wrap a `ScrollTrigger.refresh()` call, recording what it changed.
 *
 * `by` is the caller's own description — the stack is unreliable once the code
 * is minified, and every call site in this app is already named.
 */
export function recordRefresh<T>(by: string, guarded: boolean, run: () => T): T {
  if (!scrollDebugEnabled) return run();
  // Only attribution is set here. The entry itself is written by the watcher
  // below, which sees every refresh — including the ones ScrollTrigger starts
  // by itself — so a refresh is never recorded twice.
  attribution = { by, guarded };
  try {
    return run();
  } finally {
    attribution = null;
  }
}

/** Called from the WORK scrub, once per update. */
export function recordFrame(progress: number, velocity: number): void {
  if (!scrollDebugEnabled) return;
  const pin = readPin();
  push({
    kind: 'frame',
    t: performance.now(),
    scrollY: window.scrollY,
    progress,
    distance: pin.distance,
    velocity,
    sh: sh(),
    pinEnd: pin.end,
  });
}

/**
 * Watch the document's height on every frame, not only around refreshes.
 *
 * This is the part the previous investigation could not have caught. The
 * assumption was that `scrollHeight` only moves when ScrollTrigger re-measures;
 * if something else resizes the document mid-gesture — a late web font, an
 * image settling, a lazy section, the browser's own UI collapsing on a laptop
 * trackpad flick — the HUD's progress and the pin's mapping both shift with no
 * refresh anywhere in the trace. `silent` marks exactly that case.
 */
export function sampleHeight(): void {
  if (!scrollDebugEnabled) return;
  const now = sh();
  if (lastHeight === -1) {
    lastHeight = now;
    return;
  }
  if (now !== lastHeight) {
    push({
      kind: 'height',
      t: performance.now(),
      scrollY: window.scrollY,
      from: lastHeight,
      to: now,
      silent: !insideRefresh,
    });
    lastHeight = now;
  }
}

/**
 * Catch the refreshes nobody asked for.
 *
 * `lib/refreshGate` names every refresh the application requests, but
 * ScrollTrigger also refreshes on its own — it installs a `resize` listener of
 * its own, and a pinned trigger can re-measure without any of this app's code
 * being involved. Those are precisely the ones the previous investigation
 * would have missed, so they are captured here from ScrollTrigger's own
 * lifecycle events and marked `auto:*`.
 *
 * Installed at module load rather than from a component: the first refreshes
 * of a session are fired by sections registering their triggers on mount, and
 * a watcher installed from an effect is already too late to see them.
 */
function installRefreshWatcher(): void {
  if (!scrollDebugEnabled) return;

  let before: { end: number; distance: number } | null = null;
  let shBefore = 0;
  let startedAt = 0;

  const onInit = () => {
    before = readPin();
    shBefore = sh();
    startedAt = performance.now();
    insideRefresh = true;
  };
  const onDone = () => {
    insideRefresh = false;
    const after = readPin();
    push({
      kind: 'refresh',
      t: startedAt,
      by: attribution?.by ?? 'auto:scrolltrigger',
      scrollY: window.scrollY,
      shBefore,
      shAfter: sh(),
      pinEndBefore: before?.end ?? -1,
      pinEndAfter: after.end,
      distanceBefore: before?.distance ?? -1,
      distanceAfter: after.distance,
      guarded: attribution?.guarded ?? false,
    });
  };

  ScrollTrigger.addEventListener('refreshInit', onInit);
  ScrollTrigger.addEventListener('refresh', onDone);
}

installRefreshWatcher();

interface Summary {
  refreshes: number;
  refreshesThatChangedThePin: number;
  silentHeightChanges: number;
  progressReversals: number;
  scrollReversals: number;
}

function summarise(entries: Entry[]): Summary {
  const s: Summary = {
    refreshes: 0,
    refreshesThatChangedThePin: 0,
    silentHeightChanges: 0,
    progressReversals: 0,
    scrollReversals: 0,
  };
  let prev: FrameEntry | null = null;
  for (const e of entries) {
    if (e.kind === 'refresh') {
      s.refreshes++;
      if (e.pinEndBefore !== e.pinEndAfter || e.distanceBefore !== e.distanceAfter) {
        s.refreshesThatChangedThePin++;
      }
    } else if (e.kind === 'height') {
      if (e.silent) s.silentHeightChanges++;
    } else {
      if (prev) {
        if (e.progress - prev.progress < -0.004) s.progressReversals++;
        if (e.scrollY - prev.scrollY < -2) s.scrollReversals++;
      }
      prev = e;
    }
  }
  return s;
}

/** Entries in chronological order, oldest first. */
function ordered(): Entry[] {
  return log.length < CAPACITY ? log.slice() : log.slice(cursor).concat(log.slice(0, cursor));
}

export interface ScrollDebugApi {
  /** Everything captured, as JSON — this is what to copy out. */
  dump: () => string;
  /** Counts only, for a quick look before copying the full trace. */
  summary: () => Summary;
  /** Start over, so a clean pass through the chapter can be captured. */
  clear: () => void;
  entries: () => Entry[];
}

if (scrollDebugEnabled && typeof window !== 'undefined') {
  const api: ScrollDebugApi = {
    dump: () =>
      JSON.stringify(
        {
          ua: navigator.userAgent,
          dpr: window.devicePixelRatio,
          viewport: { w: window.innerWidth, h: window.innerHeight },
          summary: summarise(ordered()),
          entries: ordered(),
        },
        null,
        0,
      ),
    summary: () => summarise(ordered()),
    clear: () => {
      log.length = 0;
      cursor = 0;
      lastHeight = -1;
    },
    entries: ordered,
  };
  (window as unknown as Record<string, unknown>).__scroll = api;
  // Deliberate: this is the one message that tells the reader the harness is
  // live and how to get the trace out of it.
  console.warn(
    '[scroll-debug] active. Reproduce the stutter, then run: copy(__scroll.dump())',
  );
}
