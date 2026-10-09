import styled, { ThemeProvider } from 'styled-components';
import { lazy, Suspense, useCallback, type ComponentType } from 'react';
import type { Locale, Project } from './lib/content';
import type { Route } from './lib/routes';
import { Analytics } from '@vercel/analytics/react';
import { LayoutGroup } from 'motion/react';
import { ConversationProvider } from './components/conversation/ConversationProvider';
import { SingularityStage } from './components/layout/SingularityStage';
import { Header } from './components/navigation/Header';
import { MotionDirector } from './components/motion/MotionDirector';
import { SmoothScrollProvider } from './components/providers/SmoothScrollProvider';
import { LanguageProvider, useLanguage } from './components/providers/LanguageProvider';
import {
  RouteTransitionProvider,
  useRouteTransition,
} from './components/routing/RouteTransitionProvider';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';

const HomePage = lazy(() =>
  import('./components/home/HomePage').then(({ HomePage }) => ({ default: HomePage })),
);
const CaseStudy = lazy(() =>
  import('./components/cases/CaseStudy').then(({ CaseStudy }) => ({ default: CaseStudy })),
);
const NotFound = lazy(() =>
  import('./components/routing/NotFound').then(({ NotFound }) => ({ default: NotFound })),
);

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

const RouteFallback = styled.main`
  min-height: 100svh;
`;

export interface RouteComponents {
  HomePage?: ComponentType;
  CaseStudy?: ComponentType<{ project: Project }>;
  NotFound?: ComponentType<{ path: string }>;
}

function Site({ components }: { components?: RouteComponents }) {
  const Home = components?.HomePage ?? HomePage;
  const Case = components?.CaseStudy ?? CaseStudy;
  const Missing = components?.NotFound ?? NotFound;
  const { route, notifyRouteMounted } = useRouteTransition();
  const { content } = useLanguage();
  const onSceneMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) notifyRouteMounted();
    },
    [notifyRouteMounted],
  );
  const project =
    route.kind === 'case'
      ? content.projects.find((item) => item.slug === route.slug)
      : undefined;
  const sceneKey =
    route.kind === 'case'
      ? `case:${route.slug}`
      : route.kind === 'notFound'
        ? `missing:${route.path}`
        : 'home';

  const scene = (
    <div
      key={sceneKey}
      ref={onSceneMount}
      style={{ position: 'relative', zIndex: 1 }}
      role={route.kind === 'home' ? 'main' : undefined}
      data-route-scene
    >
      {route.kind === 'notFound' ? (
        <Missing path={route.path} />
      ) : project ? (
        <Case project={project} />
      ) : (
        <Home />
      )}
    </div>
  );
  const prepared =
    route.kind === 'home'
      ? components?.HomePage
      : route.kind === 'case'
        ? components?.CaseStudy
        : components?.NotFound;

  return (
    <>
      <SkipLink href={route.kind === 'home' ? '#work' : '#case-content'}>
        {content.ui.skipToContent}
      </SkipLink>
      <SingularityStage />
      <Header />
      <LayoutGroup id="singularity-route-layout">
        {prepared ? (
          scene
        ) : (
          <Suspense fallback={<RouteFallback aria-label={content.ui.caseStudy.loading} />}>
            {scene}
          </Suspense>
        )}
      </LayoutGroup>
    </>
  );
}

export default function App({
  initialRoute,
  initialLocale,
  components,
}: { initialRoute?: Route; initialLocale?: Locale; components?: RouteComponents } = {}) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <LanguageProvider initialLocale={initialLocale}>
        <SmoothScrollProvider>
          <RouteTransitionProvider initialRoute={initialRoute}>
            <MotionDirector>
              <ConversationProvider>
                <Site components={components} />
              </ConversationProvider>
            </MotionDirector>
          </RouteTransitionProvider>
        </SmoothScrollProvider>
      </LanguageProvider>
      <Analytics />
    </ThemeProvider>
  );
}
