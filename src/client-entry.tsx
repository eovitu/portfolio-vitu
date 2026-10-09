import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { resolveRoute } from './lib/routes';
// Keep the prerendered interface painted until its route module is available.
// The other routes and WebGL remain lazy; saved locale is still read by the provider.
export async function mount() {
  const route = resolveRoute(window.location.pathname);
  const components =
    route.kind === 'home'
      ? { HomePage: (await import('./components/home/HomePage')).HomePage }
      : route.kind === 'case'
        ? {
            CaseStudy: await (
              await import('./components/cases/CaseStudy')
            ).prepareCaseStudy(route.slug),
          }
        : { NotFound: (await import('./components/routing/NotFound')).NotFound };
  const root = document.getElementById('root')!;
  const app = (
    <StrictMode>
      <App initialRoute={route} initialLocale="pt" components={components} />
    </StrictMode>
  );
  if (root.hasChildNodes()) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
