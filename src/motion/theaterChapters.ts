/**
 * The Selected Work theater's band geometry, in one place.
 *
 * The theater's ScrollTrigger spans `top top` to `bottom bottom` of the run
 * and splits that range into equal bands, one per chapter. Two things need
 * that split and must never disagree about it: the trigger, which reads a
 * progress and concludes which chapter is active, and the numbered
 * navigation, which is handed a chapter and has to produce a scroll position.
 *
 * They are written here as inverses of each other. The chapters themselves
 * cannot answer either question: inside the sticky stage they are stacked at
 * `inset: 0`, so all of them resolve to the same document position and an
 * in-page anchor has nowhere distinct to go.
 */

/** Which chapter a trigger progress (0..1) belongs to. */
export function chapterIndexForProgress(progress: number, count: number): number {
  if (count <= 0) return 0;
  const clamped = Math.min(Math.max(progress, 0), 0.999999);
  return Math.min(count - 1, Math.floor(clamped * count));
}

/**
 * Document scroll position that lands the theater on a chapter, the middle
 * of its band, the only offset unambiguously inside it.
 */
export function chapterScrollTarget(input: {
  runTop: number;
  runHeight: number;
  viewportHeight: number;
  index: number;
  count: number;
}): number {
  const { runTop, runHeight, viewportHeight, index, count } = input;
  if (count <= 0) return runTop;
  const range = Math.max(0, runHeight - viewportHeight);
  const band = (Math.min(Math.max(index, 0), count - 1) + 0.5) / count;
  return runTop + range * band;
}
