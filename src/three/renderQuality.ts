/**
 * Render quality tiers and the framing constants for the singularity.
 *
 * Quality scales with the device instead of being fixed: the desktop hero is
 * the identity of the site and gets the full budget, while phones drop pixel
 * ratio and MSAA first — those two dominate fragment cost, and dropping them
 * preserves the composition rather than the frame rate at its expense.
 */

export type QualityTier = 'high' | 'balanced' | 'low';

export interface DeviceCapabilities {
  width: number;
  coarsePointer: boolean;
  cores: number;
  memoryGb?: number;
}

function browserCapabilities(): DeviceCapabilities {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return {
    width: window.innerWidth,
    coarsePointer: window.matchMedia?.('(pointer: coarse)').matches ?? false,
    cores: navigator.hardwareConcurrency ?? 8,
    memoryGb: memory,
  };
}

export function detectTier(capabilities?: DeviceCapabilities): QualityTier {
  if (!capabilities && typeof window === 'undefined') return 'high';
  const device = capabilities ?? browserCapabilities();
  if (
    device.coarsePointer ||
    device.width < 860 ||
    device.cores <= 4 ||
    (device.memoryGb !== undefined && device.memoryGb <= 4)
  ) {
    return 'low';
  }
  if (
    device.width < 1280 ||
    device.cores <= 8 ||
    (device.memoryGb !== undefined && device.memoryGb <= 8)
  ) {
    return 'balanced';
  }
  return 'high';
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
  /** Geometry budget used when the procedural model is constructed. */
  detail: QualityTier;
}

/**
 * `targetSize` stays at the handoff's 2.6 on purpose.
 *
 * Presence comes from the *lens*, not from inflating the model. Scaling the
 * geometry up inside the prototype's wide 35° lens swings the accretion disc
 * open — the object stops reading as a black hole and starts reading as "a
 * planet with rings", which the direction explicitly rules out. A long lens
 * (20°) pulled in close keeps the disc near edge-on, exactly as approved,
 * while filling appreciably more of the frame.
 */
export const QUALITY: Record<QualityTier, TierSettings> = {
  high: {
    dpr: [1, 1.75],
    antialias: true,
    targetSize: 2.6,
    detail: 'high',
    /**
     * Inside the lockup, not beside it.
     *
     * The old framing (x 0.15, y 0.08) put the core at screen ~(856, 418),
     * which landed the disc's left arm at x≈640 — one pixel short of where
     * VICTOR's R ends at x≈650. Object and typography abutted without
     * overlapping, which reads worse than a gap: it looks like deliberate
     * grid alignment rather than a scene.
     *
     * At the hero's framing one world unit is ~428 screen px vertically
     * (frustum height 2·6·tan(10°) = 2.116 units over 905px). So x −0.31
     * moves the core to ~660px and y −0.045 drops it to ~471px: the disc's
     * left arm now runs to x≈400, deep behind VICTOR, and the bright band
     * crosses the lower ~25% of the glyph height. Typography stays in front
     * (Main is z-index 1, the canvas layer 0), so the glow leaks around the
     * letterforms instead of over them.
     */
    frame: { x: -0.31, y: -0.045 },
  },
  balanced: {
    dpr: [1, 1.4],
    antialias: true,
    targetSize: 2.4,
    frame: { x: -0.2, y: 0.02 },
    detail: 'balanced',
  },
  low: {
    dpr: [1, 1.15],
    antialias: false,
    targetSize: 1.7,
    frame: { x: 0.02, y: 0.34 },
    detail: 'low',
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
