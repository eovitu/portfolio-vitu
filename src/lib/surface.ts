import {
  DEFAULT_ACCENT,
  DEFAULT_INK,
  DEFAULT_SURFACE,
  PROJECT_THEMES,
  type CaseTheme,
} from '../motion/projectThemes.ts';
import type { ProjectSlug } from './content.ts';

/**
 * The one place the page's surface is written.
 *
 * Every colour that changes with the active project is a custom property on
 * the document element, so nothing downstream has to know which route it is
 * on: the header, the focus ring, the selection colour and the case body all
 * read the same four names. That is what keeps the design honest when a
 * fourth project arrives, nothing branches on a slug.
 */
export interface Surface {
  surface: string;
  ink: string;
  accent: string;
  accentAlt: string | null;
  easing: string;
}

export const NEUTRAL: Surface = {
  surface: DEFAULT_SURFACE,
  ink: DEFAULT_INK,
  accent: DEFAULT_ACCENT,
  accentAlt: null,
  easing: 'power3.out',
};

function fromTheme(theme: CaseTheme): Surface {
  return {
    surface: theme.surface,
    ink: theme.ink,
    accent: theme.accent,
    accentAlt: theme.accentAlt ?? null,
    easing: theme.easing,
  };
}

/**
 * The surface a route asks for.
 *
 * `accentOnly` is Selected Work: the reader is still on the dark home ground,
 * but the chapter they are looking at owns the accent. The ground itself only
 * changes when a case study takes over the page.
 */
export function surfaceFor(input: {
  route: 'home' | 'case' | 'notFound';
  slug?: ProjectSlug | null;
  accentOnly?: ProjectSlug | null;
}): Surface {
  if (input.route === 'case' && input.slug) return fromTheme(PROJECT_THEMES[input.slug]);
  if (input.accentOnly) {
    // Showcase colors also clear AA on the dark site chrome. The cream case's
    // cacao accent belongs exclusively to its light surface.
    return { ...NEUTRAL, accent: PROJECT_THEMES[input.accentOnly].showcase };
  }
  return NEUTRAL;
}

export function sameSurface(a: Surface, b: Surface): boolean {
  return (
    a.surface === b.surface &&
    a.ink === b.ink &&
    a.accent === b.accent &&
    a.accentAlt === b.accentAlt &&
    a.easing === b.easing
  );
}

/**
 * Write the surface onto the document.
 *
 * `--surface` and `--ink` are always written together and never interpolated
 * independently. Tweening them separately is what would put dark ink on a
 * half-lightened ground: a frame in the middle of the swap where the contrast
 * ratio passes through roughly 1.2:1 and the page is unreadable. They change
 * at one instant, chosen by the caller to be a moment with no copy on screen.
 */
export function writeSurface(surface: Surface, root: HTMLElement): void {
  root.style.setProperty('--surface', surface.surface);
  root.style.setProperty('--ink', surface.ink);
  root.style.setProperty('--accent', surface.accent);
  root.style.setProperty('--accent-alt', surface.accentAlt ?? surface.accent);
  root.style.setProperty('--case-ease', surface.easing);
  root.dataset.surface = surface.surface === DEFAULT_SURFACE ? 'dark' : 'light';
}
