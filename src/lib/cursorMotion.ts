export interface CursorPoint {
  x: number;
  y: number;
}

/** Start at the first real event; never interpolate from an off-screen sentinel. */
export function seedCursor(
  x: number,
  y: number,
): {
  position: CursorPoint;
  target: CursorPoint;
} {
  return {
    position: { x, y },
    target: { x, y },
  };
}
