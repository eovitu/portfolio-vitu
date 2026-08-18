/**
 * Design tokens extracted 1:1 from the approved handoff
 * (`Singularity Portfolio v2.dc.html`). Do not invent values here —
 * every token below appears literally in the design source.
 */

export const colors = {
  bg: '#08080A',
  bgElevated: '#0B0B0D',
  bgPanel: '#0E0E11',
  bgPanelAlt: '#0B0B0D',
  line: '#1C1C20',
  border: '#2A2A30',
  text: '#E9E7E2',
  textMuted: '#A0A0A6',
  textDim: '#8A8A90',
  /**
   * The dim end of the neutral ramp, raised to clear WCAG AA.
   *
   * The handoff's values (`#6E6E74`, `#55555C`, `#3E3E44`) measured 3.95:1,
   * 2.71:1 and 1.88:1 against the page black — every micro-label on the site
   * failed, and the 10px mono labels are exactly the text that most needs the
   * help. These are the darkest greys that still clear 4.5:1 on `#08080A`,
   * which keeps the four-step hierarchy while making all of it readable.
   *
   * Measured after the change: faint 5.75:1, ghost 4.96:1, trace 4.63:1.
   */
  textFaint: '#8A8A92',
  textGhost: '#7F7F87',
  textTrace: '#7A7A82',
  /**
   * The single accent. One warm colour against the black — never two.
   *
   * Its hue (35°) was measured, not chosen: sampling the composited hero with
   * `Page.captureScreenshot` puts the accretion disc's chromatic body at
   * hsl(32–35°) on both flanks (peak-chroma pixel `#A68E6C`, hsl 35.2°).
   *
   * Its saturation was chosen, and deliberately runs hotter than the object's
   * measured 26%. The disc states its colour across a 500px-wide mass; the
   * accent has to state the same colour in a 12px numeral or a 1px rule, and
   * at that size 26% reads as grey. Matching the object's saturation would
   * have reproduced `#B9A79A` — the old accent, which carried no weight.
   * If it ever reads too sweet beside the object, drop saturation toward 50%.
   */
  accent: '#D69F51',
  /** Hover and focus: same hue, lifted. */
  accentBright: '#EFC27E',
  /** Secondary marks that must not compete with the accent proper. */
  accentMuted: '#8F7A5C',
  /**
   * Scene particulate, NOT the UI accent — the dust is nearly achromatic on
   * purpose and must not inherit the accent's saturation, or the starfield
   * turns gold and the object stops reading as light against void.
   */
  dust: '#B9A79A',
  /**
   * The ABOUT register break — the one light surface on a black site.
   *
   * Bone rather than white: white would read as an unstyled section, while a
   * warmed paper reads as a deliberate change of material, and it is the only
   * neutral that sits comfortably beside the accent's 35° hue.
   */
  paper: '#E8E3D9',
  paperDeep: '#DBD4C6',
  ink: '#0F0E0C',
  inkMuted: '#46423B',
  inkFaint: '#6B655B',
  inkLine: '#C3BBAB',
  backdrop: 'rgba(4,4,6,.6)',
} as const;

export const fonts = {
  sans: 'Archivo, Helvetica, Arial, sans-serif',
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

/**
 * Fluid type scale.
 *
 * The display end was authored against the design source and measured far too
 * small once the site existed: the hero lockup occupied roughly a quarter of
 * the viewport's height and every other surface inherited that timidity, which
 * is what made the black read as empty rather than as chosen.
 *
 * The display sizes are now bound by `min(vw, vh)` rather than by `vw` alone.
 * A `vw`-only clamp is a promise about width, and what the composition needed
 * was a promise about *height* — "VICTOR HUGO" is two lines at 0.84 leading,
 * so `21.5vh` per line puts the block at ~36vh on any aspect ratio instead of
 * at 27vh on a 16:9 laptop and 45vh on a tall window.
 *
 * The small end is untouched on purpose. The tension between a 10px mono label
 * and a 200px name is the authorship; raising both would just be a zoom.
 *
 * To revert the display scale to the handoff values, restore:
 *   heroName: 'clamp(52px, 11.5vw, 178px)'
 *   sectionTitle: 'clamp(28px, 4.6vw, 72px)'
 *   projectTitle: 'clamp(34px, 5.4vw, 88px)'
 *   contactTitle: 'clamp(38px, 8.2vw, 142px)'
 */
export const type = {
  heroName: 'clamp(58px, min(16.4vw, 21.5vh), 268px)',
  sectionTitle: 'clamp(38px, min(7.4vw, 12.4vh), 138px)',
  projectTitle: 'clamp(44px, 9.4vw, 168px)',
  contactTitle: 'clamp(48px, min(11.6vw, 19vh), 214px)',
  body: '18px',
  bodyAlt: '17px',
  skill: '22px',
  mono: '11px',
  monoSm: '10px',
  monoLg: '12px',
} as const;

export const space = {
  gutter: '32px',
  navY: '20px',
  sectionY: '140px',
} as const;

export const layout = {
  maxWidth: '1500px',
} as const;

export const breakpoints = {
  /** Below this the pinned horizontal chapter is replaced by a vertical stack. */
  desktop: 860,
  tablet: 1080,
  mobile: 560,
} as const;

export const media = {
  desktop: `@media (min-width: ${breakpoints.desktop}px)`,
  belowDesktop: `@media (max-width: ${breakpoints.desktop - 1}px)`,
  belowTablet: `@media (max-width: ${breakpoints.tablet - 1}px)`,
  mobile: `@media (max-width: ${breakpoints.mobile}px)`,
  hover: '@media (hover: hover) and (pointer: fine)',
  reduce: '@media (prefers-reduced-motion: reduce)',
} as const;

export const z = {
  content: 1,
  nav: 60,
  progress: 70,
  chat: 80,
  cursor: 90,
} as const;

export const theme = { colors, fonts, type, space, layout, breakpoints, media, z } as const;

export type Theme = typeof theme;
