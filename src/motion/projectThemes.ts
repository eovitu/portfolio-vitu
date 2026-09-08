import type { ProjectSlug } from '../lib/content.ts';

/**
 * One system, three expressions.
 *
 * Everything that makes a project look and move like itself is declared here
 * and nowhere else: the surface it lives on, the ink that reads on that
 * surface, its accent, the easing that gives it a temperature of movement,
 * and the body layout its case study uses. The scene reads the same record,
 * so the object behind the page changes colour with the project rather than
 * from a second table that would drift out of step.
 *
 * These values are decided, not derived. Do not tune them here.
 */
export type CaseLayout = 'flow' | 'editorial' | 'organic';

export interface CaseTheme {
  /** Page ground. */
  surface: string;
  /** Text on that ground. Always the AA-clearing partner of `surface`. */
  ink: string;
  /**
   * The project's colour. Carries meaning, active state, focus, hover,
   * selection, never body copy and never a full-page ground.
   */
  accent: string;
  /**
   * Support colour, decorative only.
   *
   * Measured 2.16:1 against the cream surface, which clears neither AA text
   * (4.5:1) nor the 3:1 floor for meaningful UI. It may tint a rule, a dot or
   * a fill, and it may never be the only thing carrying information.
   */
  accentAlt?: string;
  /** The project's temperature of movement, as a GSAP ease. */
  easing: string;
  /** Which body composition the case study uses. */
  layout: CaseLayout;
  /** Full-color showcase surfaces, paired with their own readable ink. */
  showcase: string;
  showcaseInk: string;

  /* --- scene and chapter motion, consumed by the theater and the rig --- */
  dust: string;
  particleSpread: number;
  orbitOrder: number;
  mediaDepth: number;
  temperature: number;
}

export const DEFAULT_SURFACE = '#08080A';
export const DEFAULT_INK = '#E9E7E2';
/** What the accent falls back to outside Works and the cases. */
export const DEFAULT_ACCENT = '#D69F51';

export const PROJECT_THEMES: Record<ProjectSlug, CaseTheme> = {
  'emprega-co': {
    surface: DEFAULT_SURFACE,
    ink: DEFAULT_INK,
    // 6.71:1 on the dark surface.
    accent: '#E07A45',
    // Direct: it arrives and stops, with very little overshoot.
    easing: 'power3.out',
    layout: 'flow',
    showcase: '#E99569',
    showcaseInk: '#302218',
    dust: '#C5A18F',
    particleSpread: 0.86,
    orbitOrder: 1,
    mediaDepth: 0.36,
    temperature: 0.68,
  },
  'doces-da-pati': {
    /*
     * The only light case, and deliberately so: terracotta and cacao are
     * neighbours on the wheel and would read as the same project on the same
     * ground. Swapping the surface is what separates them.
     */
    surface: '#F2E9DE',
    ink: '#3B2318',
    // 6.51:1 on the cream surface.
    accent: '#7A4428',
    accentAlt: '#D98C8C',
    // Slow and thick: a long tail, nothing snaps.
    easing: 'power4.out',
    layout: 'editorial',
    showcase: '#F2E9DE',
    showcaseInk: '#3B2318',
    dust: '#D2A2BC',
    particleSpread: 0.72,
    orbitOrder: 2,
    mediaDepth: 0.22,
    temperature: 0.54,
  },
  helppet: {
    surface: DEFAULT_SURFACE,
    ink: DEFAULT_INK,
    // 10.59:1 on the dark surface.
    accent: '#4FD48A',
    // Springy and short.
    easing: 'back.out(1.6)',
    layout: 'organic',
    showcase: '#C5EDAD',
    showcaseInk: '#193825',
    dust: '#9BD6A2',
    particleSpread: 1.1,
    orbitOrder: 3,
    mediaDepth: 0.44,
    temperature: 0.32,
  },
};
