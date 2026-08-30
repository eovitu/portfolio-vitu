import { useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { CaseStudy } from './components/cases/CaseStudy';
import { HomePage } from './components/home/HomePage';
import { SingularityStage } from './components/layout/SingularityStage';
import { Header } from './components/navigation/Header';
import { SmoothScrollProvider } from './components/providers/SmoothScrollProvider';
import { projects } from './lib/content';
import { applyMetadata } from './lib/metadata';
import { resolveRoute } from './lib/routes';
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
  const route = resolveRoute(window.location.pathname);
  const project =
    route.kind === 'case' ? projects.find((item) => item.slug === route.slug) : undefined;

  useEffect(() => {
    applyMetadata(resolveRoute(window.location.pathname));
  }, []);

  return (
    <>
      <SkipLink href={route.kind === 'home' ? '#work' : '#case-content'}>
        Skip to content
      </SkipLink>
      <Header />
      {route.kind === 'home' && <SingularityStage />}
      {project ? <CaseStudy project={project} /> : <HomePage />}
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
