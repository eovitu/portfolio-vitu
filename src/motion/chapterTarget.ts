import { chapterScrollTarget } from './theaterChapters.ts';

function layoutTop(element: HTMLElement): number {
  let top = 0;
  for (
    let node: HTMLElement | null = element;
    node;
    node = node.offsetParent as HTMLElement | null
  )
    top += node.offsetTop;
  return top;
}

/** Resolve only after destination DOM mounts. Layout offsets survive entrance transforms. */
export function resolveChapterTarget(
  hash: string,
  root: Pick<Document, 'getElementById'> = document,
  viewportHeight = window.innerHeight,
): { element: HTMLElement; position: number } | null {
  const projectSelector = hash.match(/^\[data-project="([a-z0-9-]+)"\]$/);
  if (projectSelector) hash = `#work-${projectSelector[1]}`;
  if (!/^#work-[a-z0-9-]+$/.test(hash)) return null;
  const element = root.getElementById(hash.slice(1));
  if (!element) return null;
  const run = element.closest<HTMLElement>('[data-theater-run]');
  if (run?.dataset.enhanced === 'true') {
    const chapters = Array.from(
      run.querySelectorAll<HTMLElement>('[data-theater-chapter]'),
    );
    return {
      element,
      position: chapterScrollTarget({
        runTop: layoutTop(run),
        runHeight: run.offsetHeight,
        viewportHeight,
        index: chapters.indexOf(element),
        count: chapters.length,
      }),
    };
  }
  return { element, position: Math.max(0, layoutTop(element) - 108) };
}

export function safeSelector(value: string): HTMLElement | null {
  try {
    return document.querySelector<HTMLElement>(value);
  } catch {
    return null;
  }
}

/** Color transitions use band edges; navigation deliberately lands inside the band. */
export function resolveChapterBoundary(
  element: HTMLElement,
  viewportHeight = window.innerHeight,
): number {
  const run = element.closest<HTMLElement>('[data-theater-run]');
  if (run?.dataset.enhanced === 'true') {
    const chapters = Array.from(
      run.querySelectorAll<HTMLElement>('[data-theater-chapter]'),
    );
    const index = chapters.indexOf(element);
    return (
      layoutTop(run) +
      (Math.max(0, run.offsetHeight - viewportHeight) * index) /
        Math.max(1, chapters.length)
    );
  }
  return layoutTop(element);
}
