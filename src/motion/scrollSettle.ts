export const BOUNDARY_HOLD_MS = 180;
export const GESTURE_GAP_MS = 140;

/** Flow colors meet the leading viewport edge; sticky colors change in scroll space. */
export function colorBoundaryTargets(input: {
  edges: number[];
  stickyEdges: number[];
  forward: boolean;
  viewportHeight: number;
  maxScroll: number;
}): number[] {
  return [
    ...input.edges.map((edge) => edge - (input.forward ? input.viewportHeight : 0)),
    // Keep the currently visible sticky color on its side of the active-band switch.
    ...input.stickyEdges.map((edge) => edge + (input.forward ? -0.5 : 0.5)),
  ].filter((target) => Number.isFinite(target) && target > 0 && target < input.maxScroll);
}

/** The first color edge crossed by this movement, in either direction. */
export function crossedBoundary(input: {
  from: number;
  to: number;
  targets: number[];
  reduced: boolean;
  blocked: boolean;
}): number | null {
  if (input.reduced || input.blocked || input.from === input.to) return null;
  const forward = input.to > input.from;
  const crossed = input.targets.filter(
    (top) =>
      Number.isFinite(top) &&
      (forward ? top > input.from && top <= input.to : top < input.from && top >= input.to),
  );
  crossed.sort((a, b) => (forward ? a - b : b - a));
  return crossed[0] ?? null;
}

/** Inertial events cannot release the stop; a fresh gesture after the brief hold can. */
export function canReleaseBoundary(input: {
  now: number;
  heldAt: number;
  newGesture: boolean;
}): boolean {
  return input.newGesture && input.now - input.heldAt >= BOUNDARY_HOLD_MS;
}
