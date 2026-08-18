import { useCallback, useEffect, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';
import {
  SmoothScrollProvider,
  useSmoothScroll,
} from './components/providers/SmoothScrollProvider';
import { getGhostLayer } from './lib/ghosts';
import { useScrollSkew } from './hooks/useScrollSkew';
import { requestRefresh } from './lib/refreshGate';
import { Header } from './components/navigation/Header';
import { Hud } from './components/layout/Hud';
import { Cursor } from './components/layout/Cursor';
import { Grain } from './components/layout/Grain';
import { Marquee } from './components/layout/Marquee';
import { Interlude } from './components/layout/Interlude';
import { Redshift } from './components/layout/Redshift';
import { SoundToggle } from './components/layout/SoundToggle';
import { Hero } from './components/sections/Hero/Hero';
import { Work } from './components/sections/Work/Work';
import { About } from './components/sections/About/About';
import { Skills } from './components/sections/Skills/Skills';
import { Contact } from './components/sections/Contact/Contact';
import { ChatWidget } from './components/chat/ChatWidget';
import { useChat } from './hooks/useChat';
import { useSingularityIntro } from './hooks/useSingularityIntro';
import { interludes } from './lib/content';
import { SingularityStage } from './components/layout/SingularityStage';

const SkipLink = styled.a`
  position: absolute;
  left: 8px;
  top: -60px;
  z-index: 100;
  padding: 10px 16px;
  background: ${({ theme }) => theme.colors.bgPanel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.16em;
  transition: top 0.3s ease;

  &:focus {
    top: 8px;
  }
`;

/**
 * No overflow / transform / filter here on purpose: any of them would make
 * this element a containing block for the `position: fixed` element
 * ScrollTrigger uses while the WORK chapter is pinned.
 */
const Main = styled.main`
  position: relative;
  /* Above the fixed singularity layer, which sits at z-index 0. */
  z-index: 1;
`;

function Site() {
  const { open, openChat, closeChat } = useChat();
  const { stop, start } = useSmoothScroll();
  const [introReady, setIntroReady] = useState(false);
  useScrollSkew();

  const onLock = useCallback(() => stop(), [stop]);
  const onRelease = useCallback(() => start(), [start]);
  useSingularityIntro(introReady, { onLock, onRelease });

  // Safety net: never leave the page frozen if the intro is torn down early.
  useEffect(() => () => start(), [start]);

  /**
   * Hold the scroll from the first frame of a staged reload.
   *
   * The timeline's own `onStart` lock arrives a few frames later, and a reader
   * whose finger is still on the wheel from before the refresh would otherwise
   * drag the page while the ghosts are being painted.
   */
  useEffect(() => {
    if (getGhostLayer()) stop();
  }, [stop]);

  /**
   * Measure, then start — nothing to restore any more.
   *
   * Every load lands on the hero at the top (`lib/reloadSnapshot` owns that),
   * so the old measure → restore → re-measure dance is gone. What remains is
   * the one thing that still matters: `refresh()` builds and measures the
   * WORK pin spacer, which is what gives the document its final height, and
   * web fonts change the metrics of every pinned measurement.
   *
   * The gate is deliberately short. The ghosts are already on screen, and the
   * reload sequence has a hard 3.2s budget measured from that first painted
   * frame — a long wait here would spend the budget on nothing.
   */
  useEffect(() => {
    let cancelled = false;
    let started = false;

    const settle = () => {
      if (cancelled || started) return;
      started = true;
      requestRefresh('app:fonts-settled');
      setIntroReady(true);
    };

    document.fonts?.ready.then(settle).catch(() => undefined);
    const timer = window.setTimeout(settle, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <SkipLink href="#work">SKIP TO CONTENT</SkipLink>
      <Hud />
      <Cursor />
      <SingularityStage />
      <Header onOpenChat={openChat} chatOpen={open} />

      <Main>
        <Hero onOpenChat={openChat} />
        <Work />
        {/* Crosses the WORK -> interlude boundary, which is the site's biggest
            change of register and the one seam most in need of a stitch. */}
        <Marquee />
        {/**
         * The rhythm of the descent, stated as two full-bleed screens.
         *
         * The first is saturation: it lands where the page used to hold its
         * longest stretch of nothing — the gap between the last panel and the
         * light section — and answers it with a screen that is entirely image.
         * The second is breath, and it sits immediately before the collapse so
         * that the collapse has silence to break.
         */}
        <Interlude
          id={interludes.matter.id}
          kind={0}
          lines={interludes.matter.lines}
          lead={interludes.matter.lead}
          metrics={interludes.matter.metrics}
        />
        <About />
        <Skills />
        <Interlude id={interludes.fall.id} kind={2} lines={interludes.fall.lines} />
        <Contact />
      </Main>

      {/* After Main so it composites over the content, before the interactive
          layers so it never tints a control. */}
      <Redshift />
      <Grain />

      <SoundToggle />
      <ChatWidget open={open} onClose={closeChat} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <SmoothScrollProvider>
        <Site />
      </SmoothScrollProvider>
    </ThemeProvider>
  );
}
