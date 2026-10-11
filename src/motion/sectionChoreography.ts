export interface VisibleSection {
  id: string;
  top: number;
  bottom: number;
  visible: boolean;
}
/** Prefer the visible chapter over the enclosing, many-screen theater run. */
export function selectVisibleSection(sections: VisibleSection[], height: number): string {
  const visible = sections.filter((s) => s.visible && s.bottom > 0 && s.top < height);
  const candidates = visible.some((s) => s.id.startsWith('work-'))
    ? visible.filter((s) => s.id !== 'work')
    : visible;
  return (
    candidates.sort(
      (a, b) =>
        Math.min(height, b.bottom) -
        Math.max(0, b.top) -
        (Math.min(height, a.bottom) - Math.max(0, a.top)),
    )[0]?.id ?? ''
  );
}
export function reloadPlan(
  shot: { section: string; scrollY: number } | null,
  reduced: boolean,
  spent: number,
) {
  const duration = Math.max(0, Math.min(1.65, 3.2 - Math.max(0, spent)));
  return {
    animate:
      !reduced &&
      !!shot &&
      Number.isFinite(shot.scrollY) &&
      shot.scrollY >= 0 &&
      duration > 0,
    scrollY: shot?.scrollY,
    duration,
  };
}
/** A single outward pose per fragment. GSAP carries it there and back in place. */
export function fragmentPose(
  section: string,
  index: number,
  center: { x: number; y: number },
  viewport: { w: number; h: number },
) {
  if (section.startsWith('case-') && section.includes(':')) {
    const project = section.slice(5).split(':')[0];
    return fragmentPose(`work-${project}`, index, center, viewport);
  }
  const dx = viewport.w / 2 - center.x,
    dy = viewport.h / 2 - center.y,
    side = index % 2 ? 1 : -1;
  switch (section) {
    case 'top':
      return { x: dx * 0.65, y: dy * 0.65, scale: 0.3, rotate: side * 8 };
    case 'work-emprega-co':
      return { x: side * 64, y: 0, scale: 0.96, rotate: 0 };
    case 'work-torneio-pebolim':
      return { x: side * 36, y: -32, scale: 0.9, rotate: side * 7 };
    case 'work-helppet':
      return { x: 0, y: 48 + (index % 3) * 12, scale: 0.92, rotate: 0 };
    case 'work-doces-da-pati':
      return { x: side * 24, y: 24, scale: 0.8, rotate: side * -5 };
    case 'profile':
      return { x: -32, y: (index % 4) * 8, scale: 1, rotate: 0 };
    case 'about':
      return { x: side * 28, y: 18, scale: 0.96, rotate: side * 2 };
    case 'contact':
      return { x: dx * 0.9, y: dy * 0.9, scale: 0.15, rotate: 0 };
    default:
      return section.startsWith('case-')
        ? { x: 40, y: -18, scale: 0.94, rotate: 0 }
        : { x: 0, y: 16, scale: 1, rotate: 0 };
  }
}
