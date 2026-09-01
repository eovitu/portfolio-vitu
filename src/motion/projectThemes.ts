import type { ProjectSlug } from '../lib/content';

export interface ProjectMotionTheme {
  accent: string;
  dust: string;
  particleSpread: number;
  orbitOrder: number;
  mediaDepth: number;
  temperature: number;
}

export const PROJECT_THEMES: Record<ProjectSlug, ProjectMotionTheme> = {
  'emprega-co': {
    // Sampled from the terracotta identity visible in the Emprega.co poster.
    accent: '#B14B25',
    dust: '#C5A18F',
    particleSpread: 0.86,
    orbitOrder: 1,
    mediaDepth: 0.36,
    temperature: 0.68,
  },
  'doces-da-pati': {
    // Sampled from the raspberry CTA and micro-labels in the storefront poster.
    accent: '#B40A65',
    dust: '#D2A2BC',
    particleSpread: 0.72,
    orbitOrder: 2,
    mediaDepth: 0.22,
    temperature: 0.54,
  },
  helppet: {
    // Sampled from the electric green HelpPet mark and entry screen.
    accent: '#38E34A',
    dust: '#9BD6A2',
    particleSpread: 1.1,
    orbitOrder: 3,
    mediaDepth: 0.44,
    temperature: 0.32,
  },
};
