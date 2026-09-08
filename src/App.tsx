import styled, { ThemeProvider } from 'styled-components';
import { useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { LayoutGroup } from 'motion/react';
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
        <div
          key={sceneKey}
          ref={onSceneMount}
          style={{ position: 'relative', zIndex: 1 }}
          data-route-scene
        >
          {route.kind === 'notFound' ? (
            <NotFound path={route.path} />
          ) : project ? (
            <CaseStudy project={project} />
          ) : (
            <HomePage />
          )}
        </div>
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
