import styled from 'styled-components';

/**
 * Film grain over the whole document.
 *
 * The hard constraint: the singularity is absolute black with additively
 * blended light on top of it. A conventional noise overlay lifts the black
 * point of the canvas and destroys exactly the mechanism that makes the object
 * read — the void has to stay at 0.
 *
 * `mix-blend-mode: soft-light` solves that arithmetically rather than
 * geographically. Soft-light against a backdrop of 0 returns 0 for every
 * possible source value: for Cs <= 0.5 the term is `b - (1-2Cs)·b·(1-b)`, and
 * for Cs > 0.5 it is `b + (2Cs-1)·(D(b)-b)` where `D(0) = 0`. Both collapse to
 * zero when b = 0. So the grain is mathematically incapable of touching the
 * void, while modulating everything that carries light — the disc, the halo,
 * the typography, the cream of the ABOUT section.
 *
 * This is deliberately NOT a mask over the canvas region. Masking would leave
 * the hero — the most vector-looking surface on the page — as the one place
 * without grain. Soft-light gives grain everywhere there is light, and nothing
 * where there is none, which is what film actually does.
 *
 * The texture is a single rasterised `feTurbulence` tile carried as a data URI:
 * the filter runs once at decode, then it is an ordinary repeating bitmap. It
 * is static on purpose. Animated grain means a full-screen repaint every frame,
 * and this page already spends its budget on a WebGL scene and a pinned track.
 */
const Layer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  mix-blend-mode: soft-light;
  opacity: 0.42;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 180px 180px;

  /* Grain is texture, not motion — but it is also pure visual noise, so it
     goes away for readers who asked for less of exactly that. */
  ${({ theme }) => theme.media.reduce} {
    display: none;
  }
`;

/**
 * Sits above the content and below every interactive layer (nav 60, chat 80,
 * cursor 90) so it never tints a control or eats a pointer event.
 */
export function Grain() {
  return <Layer data-grain aria-hidden="true" />;
}
