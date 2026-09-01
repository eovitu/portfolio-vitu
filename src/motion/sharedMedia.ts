export interface SharedMediaCandidate {
  poster?: string;
  posterLoaded: boolean;
  frameReady: boolean;
}

export type SharedMediaSource =
  | { kind: 'poster'; src: string }
  | { kind: 'frame-surface' };

export interface MediaRect {
  left: number;
  top: number;
  width: number;
  height: number;
  borderRadius: string;
  clipPath: string;
}

export function selectSharedMediaSource(
  input: SharedMediaCandidate,
): SharedMediaSource | null {
  if (input.posterLoaded && input.poster) return { kind: 'poster', src: input.poster };
  if (input.frameReady) return { kind: 'frame-surface' };
  return null;
}

export function measureMediaFrame(element: HTMLElement): MediaRect {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    borderRadius: styles.borderRadius,
    clipPath: styles.clipPath === 'none' ? 'inset(0% round 0px)' : styles.clipPath,
  };
}

function positionRepresentation(element: HTMLElement, rect: MediaRect): void {
  Object.assign(element.style, {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    borderRadius: rect.borderRadius,
    clipPath: rect.clipPath,
    objectFit: 'cover',
    pointerEvents: 'none',
    transformOrigin: '0 0',
  });
}

export function createSharedMediaRepresentation(
  source: SharedMediaSource,
  rect: MediaRect,
  signal: AbortSignal,
): HTMLElement | null {
  if (signal.aborted || typeof document === 'undefined') return null;

  const representation =
    source.kind === 'poster' ? document.createElement('img') : document.createElement('div');
  representation.dataset.sharedMediaRepresentation = source.kind;
  representation.setAttribute('aria-hidden', 'true');

  if (representation instanceof HTMLImageElement && source.kind === 'poster') {
    representation.src = source.src;
    representation.alt = '';
    representation.decoding = 'async';
  } else {
    representation.style.background = 'linear-gradient(135deg, #15100b, #08080a 72%)';
    representation.style.border = '1px solid rgba(255,255,255,0.12)';
  }

  positionRepresentation(representation, rect);
  signal.addEventListener('abort', () => representation.remove(), { once: true });
  return representation;
}
