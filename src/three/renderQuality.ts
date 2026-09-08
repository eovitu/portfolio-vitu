/**
 * Render quality tiers and the framing constants for the singularity.
 *
 * Quality scales with the device instead of being fixed: the desktop hero is
 * the identity of the site and gets the full budget, while phones drop pixel
 * ratio and MSAA first, those two dominate fragment cost, and dropping them
 * preserves the composition rather than the frame rate at its expense.
 */

export type QualityTier = 'high' | 'low';

export function detectTier(): QualityTier {
  if (typeof window === 'undefined') return 'high';
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const narrow = window.innerWidth < 860;
  const cores = navigator.hardwareConcurrency ?? 8;
  return coarse || narrow || cores <= 4 ? 'low' : 'high';
}

interface TierSettings {
  /** [min, max] device pixel ratio handed to the renderer. */
  dpr: [number, number];
  /** MSAA. Real cost at high DPR, so it is a phone's first casualty. */
  antialias: boolean;
  /** World-space diagonal the model is normalised to. */
  targetSize: number;
  /** World-space nudge that places the core in the hero composition. */
  frame: { x: number; y: number };
}

/**
 * `targetSize` stays at the handoff's 2.6 on purpose.
 *
 * Presence comes from the *lens*, not from inflating the model. Scaling the
 * geometry up inside the prototype's wide 35° lens swings the accretion disc
 * open, the object stops reading as a black hole and starts reading as "a
 * planet with rings", which the direction explicitly rules out. A long lens
 * (20°) pulled in close keeps the disc near edge-on, exactly as approved,
 * while filling appreciably more of the frame.
 */
export const QUALITY: Record<QualityTier, TierSettings> = {
  high: {
    dpr: [1, 2],
    antialias: true,
    targetSize: 2.6,
    // Keep the bright core above and to the right of the desktop headline.
    frame: { x: 0.98, y: 0.22 },
  },
  low: {
    dpr: [1, 1.5],
    antialias: false,
    targetSize: 2.6,
    frame: { x: 0.05, y: 0 },
  },
};

/**
 * Telephoto. Visible frustum height is `2 · distance · tan(fov/2)`:
 * 2.11 units here against the prototype's 3.28, so the same model reads ~1.55×
 * larger while the perspective on the disc is markedly flatter.
 */
export const CAMERA = { fov: 20, near: 0.1, far: 200, distance: 6.0 } as const;

export const RENDERER = {
  /**
   * ACES filmic at the prototype's exposure, transcribed rather than re-tuned.
   * With additive blending and HDR vertex colours reaching ~3.1, the tone
   * mapper IS the bloom: the highlights roll off into white instead of
   * clipping, which is the mechanism the GLB bake destroyed.
   */
  exposure: 1.42,
} as const;
