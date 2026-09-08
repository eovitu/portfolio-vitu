import type { ProjectSlug } from '../lib/content';

interface SceneSignals {
  route: 'home' | 'case';
  chapter: number;
  transitionProgress: number;
  energy: number;
  presence: number;
  transformX: number;
  transformY: number;
  transformScale: number;
  flare: number;
  particles: number;
  projectTheme: ProjectSlug | null;
  velocity: number;
  /**
   * The active project's accent as `#rrggbb`, or the neutral gold outside
   * Works and the cases. Written by the surface tokens hook, which is also
   * what writes it into CSS, one author, so the object and the interface
   * cannot disagree about which project is on screen.
   */
  accent: string;
}

export const sceneSignals: SceneSignals = {
  route: 'home',
  chapter: 0,
  transitionProgress: 0,
  energy: 0,
  presence: 1,
  transformX: 0,
  transformY: 0,
  transformScale: 1,
  flare: 0,
  particles: 1,
  projectTheme: null,
  velocity: 0,
  accent: '#D69F51',
};

/** Keeps a stable object identity so the render loop never subscribes or rerenders. */
export function setSceneTarget(partial: Partial<SceneSignals>): void {
  Object.assign(sceneSignals, partial);
}

export function resetTransientSceneSignals(): void {
  sceneSignals.transitionProgress = 0;
  sceneSignals.energy = 0;
  sceneSignals.flare = 0;
  sceneSignals.velocity = 0;
}
