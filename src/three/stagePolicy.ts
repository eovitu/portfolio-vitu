export type StageMode = 'active' | 'ambient' | 'dormant';

const ACTIVE_PRESENCE = 0.35;
const AMBIENT_PRESENCE = 0.02;

/** Shared visual state for rendering, interaction and gravity. */
export function stageMode(presence: number): StageMode {
  if (presence >= ACTIVE_PRESENCE) return 'active';
  if (presence >= AMBIENT_PRESENCE) return 'ambient';
  return 'dormant';
}

export function gravityEnabled(presence: number, projected: boolean): boolean {
  return projected && stageMode(presence) === 'active';
}

export function frameInterval(mode: StageMode, reduced: boolean): number {
  if (reduced || mode === 'dormant') return 250;
  if (mode === 'ambient') return 83;
  return 0;
}
