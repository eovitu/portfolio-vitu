/**
 * Instrumentation for the reload choreography.
 *
 * Phase A left one open question: an intermediate measurement showed a single
 * residual transform on a warp target in WORK and in CONTACT, which never
 * reproduced. It is cheap to keep watching for, and impossible to argue about
 * without a number — so the sequence publishes its own timings and a stranded
 * transform scan instead of relying on how the recording looks.
 *
 * Everything here is read-only and exists on `window` for the verification
 * harness; nothing in the app reads it back.
 */

import { coreOrigin } from './warpTargets';
import { scrollGuard } from './reloadSnapshot';

export interface IntroReport {
  /** performance.now() at the frame the ghosts were first painted. */
  firstUsefulFrame: number | null;
  /** performance.now() when the expulsion finished. */
  end: number | null;
  /** Total sequence duration in seconds, once both ends are known. */
  duration: number | null;
  mode: 'first-visit' | 'reload' | 'reduced' | null;
  ghosts: number;
  fragments: number;
  /** Saved-rect vs rebuilt-rect deltas, one per reconstructed target. */
  fidelity: unknown[];
  /** Camera altitude in scroll pixels, sampled every frame while travelling. */
  camera: number;
  cameraSamples: number[];
}

const report: IntroReport = {
  firstUsefulFrame: null,
  end: null,
  duration: null,
  mode: null,
  ghosts: 0,
  fragments: 0,
  fidelity: [],
  camera: 0,
  cameraSamples: [],
};

declare global {
  interface Window {
    __intro?: IntroReport;
    __introFrames?: IntroFrame[];
    __introAudit?: () => {
      strandedTransforms: { selector: string; transform: string }[];
      hiddenTargets: { selector: string; opacity: string }[];
      ghostLayer: boolean;
      duration: number | null;
      scrollY: number;
      scrollGuard: { corrections: number; worst: number; released: boolean };
    };
  }
}

function label(el: Element): string {
  const id = el.id ? `#${el.id}` : '';
  const cls =
    el.className && typeof el.className === 'string'
      ? `.${el.className.trim().split(/\s+/)[0]}`
      : '';
  return `${el.tagName.toLowerCase()}${id}${cls}`;
}

function isIdentity(transform: string): boolean {
  if (!transform || transform === 'none') return true;
  const m = transform.match(/matrix\(([^)]+)\)/);
  if (!m) return false;
  const v = m[1].split(',').map((n) => Number(n.trim()));
  return (
    Math.abs(v[0] - 1) < 0.01 &&
    Math.abs(v[1]) < 0.01 &&
    Math.abs(v[2]) < 0.01 &&
    Math.abs(v[3] - 1) < 0.01 &&
    Math.abs(v[4]) < 0.5 &&
    Math.abs(v[5]) < 0.5
  );
}

/**
 * Per-frame recorder. Inert unless `sessionStorage['singularity:record']` is
 * set, which only the verification harness does.
 *
 * It has to live inside the app rather than be injected from the outside: the
 * frames that matter most are the first ones, and anything injected after the
 * document exists has already missed them.
 */
export interface IntroFrame {
  /** Milliseconds since the recorder started (≈ first script execution). */
  t: number;
  scrollY: number;
  camera: number;
  ghosts: number;
  /** Highest computed opacity among on-screen content this frame. */
  maxOpacity: number;
  /** How many on-screen elements are carrying visible content this frame. */
  visible: number;
  /** False for frames captured before the first painted frame of content. */
  armed: boolean;
  /**
   * Distance in px from the core to the nearest surviving ghost. The whole
   * point of the travel is that matter is swallowed *by the object*, so this
   * has to converge toward zero rather than drift.
   */
  nearestGhostToCore: number | null;
  /** Fragment transforms, sampled sparsely so the log stays small. */
  transforms?: string[];
}

const frames: IntroFrame[] = [];

function measureFrame(t0: number): IntroFrame {
  const layer = document.querySelector('[data-ghost-layer]');
  const ghostEls = layer
    ? Array.from(layer.querySelectorAll<HTMLElement>('[data-ghost]'))
    : [];

  const candidates: HTMLElement[] = [
    ...ghostEls,
    ...Array.from(document.querySelectorAll<HTMLElement>('[data-warp], [data-letter]')),
  ];

  let maxOpacity = 0;
  let visible = 0;
  for (const el of candidates) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    if (r.bottom <= 0 || r.top >= window.innerHeight) continue;
    if (r.right <= 0 || r.left >= window.innerWidth) continue;
    // Effective opacity: an ancestor at 0 (the staging rule) hides it too.
    let o = 1;
    let node: HTMLElement | null = el;
    while (node && node !== document.documentElement) {
      o *= Number(getComputedStyle(node).opacity);
      if (o < 0.001) break;
      node = node.parentElement;
    }
    if (o > 0.05) visible += 1;
    if (o > maxOpacity) maxOpacity = o;
  }

  let nearest: number | null = null;
  if (ghostEls.length) {
    const core = coreOrigin();
    for (const el of ghostEls) {
      if (el.style.display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 && r.height <= 0) continue;
      const d = Math.hypot(
        core.x - (r.left + r.width / 2),
        core.y - (r.top + r.height / 2),
      );
      if (nearest === null || d < nearest) nearest = Math.round(d);
    }
  }

  return {
    t: Math.round((performance.now() - t0) * 10) / 10,
    nearestGhostToCore: nearest,
    scrollY: Math.round(window.scrollY),
    camera: Math.round(report.camera * 10) / 10,
    ghosts: ghostEls.filter((el) => el.style.display !== 'none').length,
    maxOpacity: Math.round(maxOpacity * 1000) / 1000,
    visible,
    armed: report.firstUsefulFrame !== null,
  };
}

function startRecorder(): void {
  const t0 = performance.now();
  let n = 0;
  const tick = () => {
    const frame = measureFrame(t0);
    // Sample the individual fragment vectors repeatedly through the fall: the
    // stagger means a single snapshot catches most fragments before they have
    // moved, which would understate how much they differ.
    if (frame.ghosts > 0 && n % 6 === 0) {
      const layer = document.querySelector('[data-ghost-layer]');
      frame.transforms = layer
        ? Array.from(layer.querySelectorAll<HTMLElement>('[data-ghost]'))
            .slice(0, 60)
            .map((el) => el.style.transform || 'none')
        : [];
    }
    frames.push(frame);
    n += 1;
    if (frame.t < 5000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Renderer probe, opt-in via `sessionStorage['singularity:record']`.
 *
 * Frame cost has to be measured, not asserted — the previous phase's decision
 * to drop post-processing "because it would cost too much" was made without a
 * number, and the object paid for it. This exposes the live renderer so a
 * harness can time real `render()` calls at a chosen pixel ratio.
 */
export function installRenderProbe(handles: {
  gl: unknown;
  scene: unknown;
  camera: unknown;
}): void {
  try {
    if (!sessionStorage.getItem('singularity:record')) return;
  } catch {
    return;
  }
  (window as unknown as { __gl?: unknown }).__gl = handles;
}

/** Build cost and geometry census, published for the harness. */
export function reportSceneStats(stats: unknown): void {
  (window as unknown as { __sceneStats?: unknown }).__sceneStats = stats;
}

export function installAudit(): void {
  if (typeof window === 'undefined') return;
  window.__intro = report;
  window.__introFrames = frames;
  try {
    if (sessionStorage.getItem('singularity:record')) startRecorder();
  } catch {
    // Storage disabled — recording is a verification affordance, nothing more.
  }
  window.__introAudit = () => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-warp], [data-letter]'),
    );
    const strandedTransforms: { selector: string; transform: string }[] = [];
    const hiddenTargets: { selector: string; opacity: string }[] = [];

    for (const el of targets) {
      const s = getComputedStyle(el);
      // `[data-parallax]` elements legitimately hold a scroll-derived offset;
      // they are owned by `useParallax`, not by the intro. Counting them as
      // stranded would report a permanent, harmless false positive.
      if (!el.closest('[data-parallax]') && !isIdentity(s.transform)) {
        strandedTransforms.push({ selector: label(el), transform: s.transform });
      }
      const r = el.getBoundingClientRect();
      const onScreen = r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
      if (onScreen && Number(s.opacity) < 0.99) {
        hiddenTargets.push({ selector: label(el), opacity: s.opacity });
      }
    }

    return {
      strandedTransforms,
      hiddenTargets,
      ghostLayer: !!document.querySelector('[data-ghost-layer]'),
      duration: report.duration,
      scrollY: window.scrollY,
      scrollGuard: { ...scrollGuard },
    };
  };
}

export function markFirstUsefulFrame(
  mode: IntroReport['mode'],
  ghosts: number,
  fragments: number,
  fidelity: unknown[] = [],
): void {
  report.mode = mode;
  report.ghosts = ghosts;
  report.fragments = fragments;
  report.fidelity = fidelity;
  if (report.firstUsefulFrame !== null) return;
  // Double rAF: the first callback runs *before* the frame is painted, the
  // second after it. The budget is measured from pixels, not from intent.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (report.firstUsefulFrame === null) report.firstUsefulFrame = performance.now();
    }),
  );
}

/**
 * Seconds already spent between the first painted frame and now.
 *
 * The 3.2s budget is measured from pixels, not from the moment the timeline
 * happens to be built — whatever the mount gate costs comes out of the same
 * envelope, so the choreography has to know about it.
 */
export function elapsedSinceFirstFrame(): number {
  if (report.firstUsefulFrame === null) return 0;
  return (performance.now() - report.firstUsefulFrame) / 1000;
}

export function markEnd(): void {
  report.end = performance.now();
  if (report.firstUsefulFrame !== null) {
    report.duration = (report.end - report.firstUsefulFrame) / 1000;
  }
}

export function sampleCamera(y: number): void {
  report.camera = y;
  if (report.cameraSamples.length < 400) report.cameraSamples.push(Math.round(y * 10) / 10);
}
