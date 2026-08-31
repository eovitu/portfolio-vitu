import styled, { ThemeProvider } from 'styled-components';
import { CaseStudy } from './components/cases/CaseStudy';
import { HomePage } from './components/home/HomePage';
import { SingularityStage } from './components/layout/SingularityStage';
import { Header } from './components/navigation/Header';
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
  const { route } = useRouteTransition();
  const project =
    route.kind === 'case' ? projects.find((item) => item.slug === route.slug) : undefined;

  return (
    <>
      <SkipLink href={route.kind === 'home' ? '#work' : '#case-content'}>
        Skip to content
      </SkipLink>
      <Header />
      <SingularityStage />
      {project ? <CaseStudy project={project} /> : <HomePage />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <SmoothScrollProvider>
        <RouteTransitionProvider>
          <Site />
        </RouteTransitionProvider>
      </SmoothScrollProvider>
    </ThemeProvider>
  );
}
