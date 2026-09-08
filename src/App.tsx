import styled, { ThemeProvider } from 'styled-components';
import { useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { CaseStudy } from './components/cases/CaseStudy';
import { ConversationProvider } from './components/conversation/ConversationProvider';
import { NotFound } from './components/routing/NotFound';
import { HomePage } from './components/home/HomePage';
import { SingularityStage } from './components/layout/SingularityStage';
import { Header } from './components/navigation/Header';
import { MotionDirector } from './components/motion/MotionDirector';
import { SmoothScrollProvider } from './components/providers/SmoothScrollProvider';
import {
  RouteTransitionProvider,
  useRouteTransition,
} from './components/routing/RouteTransitionProvider';
import { useReducedMotion } from './hooks/useReducedMotion';
import { projects } from './lib/content';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';

const SkipLink = styled.a`
  position: fixed;
  left: 12px;
  top: -70px;
  z-index: 120;
  padding: 12px 16px;
  color: ${({ theme }) => theme.colors.bg};
  background: ${({ theme }) => theme.colors.text};
  font: 400 11px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.12em;
  text-transform: uppercase;

  &:focus {
    top: 12px;
  }
`;

function Site() {
  const { route, notifyRouteMounted } = useRouteTransition();
  const onSceneMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) notifyRouteMounted();
    },
    [notifyRouteMounted],
  );
  const reduced = useReducedMotion();
  const project =
    route.kind === 'case' ? projects.find((item) => item.slug === route.slug) : undefined;
  const sceneKey =
    route.kind === 'case'
      ? `case:${route.slug}`
      : route.kind === 'notFound'
        ? `missing:${route.path}`
        : 'home';

  return (
    <>
      <SkipLink href={route.kind === 'home' ? '#work' : '#case-content'}>
        Skip to content
      </SkipLink>
      <SingularityStage />
      <Header />
      <LayoutGroup id="singularity-route-layout">
        {/* `mode="wait"` makes this the master clock of a route swap: the
            incoming scene is not mounted until the outgoing exit has finished.
            The scene ref tells the transition director when the
            destination DOM actually exists. */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            ref={onSceneMount}
            key={sceneKey}
            initial="initial"
            animate="animate"
            exit="exit"
            /* Reduced motion keeps the same clock, `mode="wait"` still
               reports the exit, and replaces the collapse into the core with
               a short cross fade. Opacity only: no scale, no travel. */
            variants={
              reduced
                ? {
                    initial: { opacity: 0 },
                    animate: { opacity: 1, transition: { duration: 0.12 } },
                    exit: { opacity: 0, transition: { duration: 0.12 } },
                  }
                : {
                    initial: { opacity: 0, scale: 0.84, x: 0, y: 0 },
                    animate: {
                      opacity: 1,
                      scale: 1,
                      x: 0,
                      y: 0,
                      transition: { duration: 0.68, ease: [0.16, 1, 0.3, 1] },
                    },
                    /*
                     * The exit is one gesture, not two.
                     *
                     * The wrapper used to collapse to `scale: 0` on its own
                     * clock while `useSectionGravity` pulled each section
                     * into the core on another, two readings of the same
                     * movement, fighting over the same pixels. The pull is
                     * the gesture; the wrapper only has to still be there
                     * while it happens and be gone once the last section has
                     * landed. Its duration is the cascade's: six sections at
                     * 45 ms apart plus a 540 ms fall.
                     */
                    exit: {
                      opacity: [1, 1, 0],
                      x: 0,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.78,
                        ease: 'linear',
                        opacity: { duration: 0.78, times: [0, 0.92, 1], ease: 'linear' },
                      },
                    },
                  }
            }
            style={{
              position: 'relative',
              zIndex: 1,
              transformOrigin: '50% 50%',
              willChange: reduced ? 'opacity' : 'transform, opacity',
            }}
            data-route-scene
          >
            {route.kind === 'notFound' ? (
              <NotFound path={route.path} />
            ) : project ? (
              <CaseStudy project={project} />
            ) : (
              <HomePage />
            )}
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <SmoothScrollProvider>
        <RouteTransitionProvider>
          <MotionDirector>
            <ConversationProvider>
              <Site />
            </ConversationProvider>
          </MotionDirector>
        </RouteTransitionProvider>
      </SmoothScrollProvider>
      <Analytics />
    </ThemeProvider>
  );
}
