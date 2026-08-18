import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /**
   * The accent, published as custom properties.
   *
   * styles/theme.ts remains the single source of truth — these are emitted
   * from it, never typed by hand. They exist so that plain CSS (the grain
   * layer, the HUD, keyframes) can reach the accent without threading the
   * styled-components theme through. There is exactly one gold in the code.
   */
  :root {
    --accent: ${({ theme }) => theme.colors.accent};
    --accent-bright: ${({ theme }) => theme.colors.accentBright};
    --accent-muted: ${({ theme }) => theme.colors.accentMuted};
    --bg: ${({ theme }) => theme.colors.bg};

    /**
     * Chrome colours — what the fixed and pinned layers paint themselves with.
     *
     * The header, the distance HUD and the WORK chapter label float over
     * whatever section is under them. With one light section that was
     * survivable; with two it is light grey type on bone. These variables are
     * the whole mechanism: the chrome reads them, lib/register publishes the
     * register on the root element, and the block below restates them.
     */
    --chrome-text: ${({ theme }) => theme.colors.text};
    --chrome-dim: ${({ theme }) => theme.colors.textDim};
    --chrome-faint: ${({ theme }) => theme.colors.textFaint};
    --chrome-trace: ${({ theme }) => theme.colors.textTrace};
    --chrome-line: ${({ theme }) => theme.colors.line};
    --chrome-border: ${({ theme }) => theme.colors.border};
    --chrome-accent: ${({ theme }) => theme.colors.accent};
    --chrome-accent-muted: ${({ theme }) => theme.colors.accentMuted};
    --chrome-veil: rgba(8, 8, 10, 0.78);
  }

  /**
   * The light register.
   *
   * Transitioned rather than switched: the reader crosses the boundary over a
   * few hundred milliseconds of scroll, and chrome that flips instantly reads
   * as a bug in the page rather than as the page changing material. Colour is
   * not a compositor property, but this is four small nodes changing at a
   * boundary crossing, not per frame.
   */
  :root[data-register='light'] {
    --chrome-text: ${({ theme }) => theme.colors.ink};
    --chrome-dim: ${({ theme }) => theme.colors.inkMuted};
    --chrome-faint: ${({ theme }) => theme.colors.inkFaint};
    --chrome-trace: ${({ theme }) => theme.colors.inkFaint};
    --chrome-line: ${({ theme }) => theme.colors.inkLine};
    --chrome-border: ${({ theme }) => theme.colors.inkLine};
    --chrome-accent: ${({ theme }) => theme.colors.accentInk};
    --chrome-accent-muted: ${({ theme }) => theme.colors.inkMuted};
    --chrome-veil: rgba(226, 222, 212, 0.82);
  }

  [data-chrome] {
    transition:
      color 0.45s ease,
      border-color 0.45s ease,
      background-color 0.45s ease;
  }

  *, *::before, *::after { box-sizing: border-box; }

  html {
    /* Lenis owns scrolling — native smooth behaviour would fight it. */
    scroll-behavior: auto;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: ${({ theme }) => theme.colors.bg};
  }

  body {
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.sans};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  /* Lenis wrapper flags */
  html.lenis, html.lenis body { height: auto; }
  .lenis.lenis-smooth { scroll-behavior: auto !important; }
  .lenis.lenis-stopped { overflow: hidden; }

  a { color: ${({ theme }) => theme.colors.text}; text-decoration: none; }
  /* Hover brightens; it does not change hue. The accent is reserved for
     meaning (the HUD, project numbering, active state), and a generic link
     hover is not meaning — spending gold here is what turned the accent into
     a second body colour. */
  a:hover { color: ${({ theme }) => theme.colors.text}; }

  button { font-family: inherit; }

  img, canvas, svg { display: block; max-width: 100%; }

  ::selection {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.bg};
  }

  /* Focus keeps the accent: it is a state, it is rare, and it is the one
     place where standing out is the whole function. */
  :focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors.accent};
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
