import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /**
   * The accent, published as custom properties.
   *
   * styles/theme.ts remains the single source of truth, these are emitted
   * from it, never typed by hand. They exist so that plain CSS (the grain
   * layer, the HUD, keyframes) can reach the accent without threading the
   * styled-components theme through. There is exactly one gold in the code.
   */
  :root {
    color-scheme: dark;
    --accent: ${({ theme }) => theme.colors.accent};
    --accent-alt: ${({ theme }) => theme.colors.accent};
    --accent-bright: ${({ theme }) => theme.colors.accentBright};
    --accent-muted: ${({ theme }) => theme.colors.accentMuted};
    --bg: ${({ theme }) => theme.colors.bg};
    --case-ease: power3.out;

    /**
     * The active surface, written by lib/surface.ts.
     *
     * The defaults are the dark theme's own values, spelled out rather than
     * derived, so every dark page renders byte-identically to before the
     * token layer existed. Only the light surface derives.
     */
    --surface: ${({ theme }) => theme.colors.bg};
    --ink: ${({ theme }) => theme.colors.text};
    --ink-muted: ${({ theme }) => theme.colors.textMuted};
    --ink-faint: ${({ theme }) => theme.colors.textFaint};
    --line: ${({ theme }) => theme.colors.line};
    --border: ${({ theme }) => theme.colors.border};
    --panel: ${({ theme }) => theme.colors.bgPanel};
  }

  /**
   * The light surface, derived from ink so a future surface needs no table.
   *
   * Measured against #F2E9DE: muted 6.40:1, faint 4.78:1, both clear WCAG AA
   * for body and for the 10px mono micro-labels, which is the text that most
   * needs the help. The --accent-alt token is decorative only: the rosé measures
   * 2.16:1 here and may never be the only carrier of meaning.
   */
  :root[data-surface='light'] {
    color-scheme: light;
    --ink-muted: color-mix(in srgb, var(--ink) 78%, var(--surface));
    --ink-faint: color-mix(in srgb, var(--ink) 68%, var(--surface));
    --line: color-mix(in srgb, var(--ink) 14%, var(--surface));
    --border: color-mix(in srgb, var(--ink) 26%, var(--surface));
    --panel: color-mix(in srgb, var(--ink) 6%, var(--surface));
  }

  *, *::before, *::after { box-sizing: border-box; }

  html {
    /* Lenis owns scrolling, native smooth behaviour would fight it. */
    scroll-behavior: auto;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: var(--surface);
  }

  body {
    color: var(--ink);
    font-family: ${({ theme }) => theme.fonts.sans};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  /* Lenis wrapper flags */
  html.lenis, html.lenis body { height: auto; }
  .lenis.lenis-smooth { scroll-behavior: auto !important; }
  .lenis.lenis-stopped { overflow: hidden; }

  a { color: var(--ink); text-decoration: none; }
  [data-magnetic] { translate: var(--magnetic-x, 0px) var(--magnetic-y, 0px); }
  /* Hover brightens; it does not change hue. The accent is reserved for
     meaning (the HUD, project numbering, active state), and a generic link
     hover is not meaning, spending gold here is what turned the accent into
     a second body colour. */
  a:hover { color: var(--ink); }

  button { font-family: inherit; }

  img, canvas, svg { display: block; max-width: 100%; }

  section[id] { scroll-margin-top: 88px; }

  /* Selection is the project's colour: it is a state the reader creates, and
     it is one of the few places an accent says something. */
  ::selection {
    background: var(--accent);
    color: var(--surface);
  }

  /* Focus keeps the accent: it is a state, it is rare, and it is the one
     place where standing out is the whole function. */
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }

  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: .15; } }

  ${({ theme }) => theme.media.reduce} {
    *, *::before, *::after {
      animation-duration: .001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .001ms !important;
    }
  }

  /* Screen-reader-only utility for the skip link. */
  .visually-hidden {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap; border: 0;
  }
`;
