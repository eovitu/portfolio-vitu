import { contentFor, type Locale } from './content.ts';
import type { Route } from './routes.ts';
import { SITE_ORIGIN as ORIGIN } from './site.ts';

const HOME_TITLE = 'Victor Hugo, Backend Developer & Product Engineer';
const HOME_DESCRIPTION =
  'Backend developer building reliable digital products from system architecture to expressive interfaces.';

interface PageMetadata {
  lang: 'en' | 'pt-BR';
  title: string;
  description: string;
  canonical: string;
  /**
   * The value for `<meta name="robots">`.
   *
   * The host rewrites every unmatched path to `index.html`, so a wrong URL is
   * answered with HTTP 200 and cannot be a hard 404. `noindex` is what keeps
   * a mistyped address out of the index anyway.
   */
  robots: 'index, follow, max-image-preview:large' | 'noindex, follow';
}

const INDEXABLE = 'index, follow, max-image-preview:large' as const;

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Victor Hugo',
    jobTitle: 'Backend Developer & Product Engineer',
    url: `${ORIGIN}/`,
    email: 'mailto:eovitu7@gmail.com',
    sameAs: ['https://github.com/eovitu'],
  } as const;
}

export function metadataFor(route: Route, locale: Locale = 'en'): PageMetadata {
  const localized = contentFor(locale);
  const homeTitle =
    locale === 'pt' ? 'Victor Hugo, Desenvolvedor Backend e Engenheiro de Produto' : HOME_TITLE;
  const homeDescription =
    locale === 'pt'
      ? 'Desenvolvedor backend criando produtos digitais confiáveis, da arquitetura de sistemas às interfaces expressivas.'
      : HOME_DESCRIPTION;
  const lang = locale === 'pt' ? 'pt-BR' : 'en';
  if (route.kind === 'home') {
    return {
      lang,
      title: homeTitle,
      description: homeDescription,
      canonical: `${ORIGIN}/`,
      robots: INDEXABLE,
    };
  }

  if (route.kind === 'notFound') {
    return {
      lang,
      title: locale === 'pt' ? 'Além do horizonte, Victor Hugo' : 'Past the horizon, Victor Hugo',
      description:
        locale === 'pt'
          ? 'Este endereço não existe. Volte aos projetos selecionados.'
          : 'This address does not exist. Return to the selected work.',
      // Canonical points home: the missing page has no address of its own
      // worth pointing a crawler at.
      canonical: `${ORIGIN}/`,
      robots: 'noindex, follow',
    };
  }

  const project = localized.projects.find((item) => item.slug === route.slug);
  return {
    lang,
    title: `${project?.name ?? (locale === 'pt' ? 'Case' : 'Case Study')}, Victor Hugo`,
    description: project?.summary ?? homeDescription,
    canonical: `${ORIGIN}/work/${route.slug}`,
    robots: INDEXABLE,
  };
}

function meta(
  selector: string,
  attribute: 'name' | 'property',
  value: string,
): HTMLMetaElement {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, selector.match(/"(.+)"/)?.[1] ?? '');
    document.head.append(element);
  }
  element.content = value;
  return element;
}

export function applyMetadata(route: Route, locale: Locale = 'en'): void {
  const page = metadataFor(route, locale);
  document.documentElement.lang = page.lang;
  document.title = page.title;
  meta('meta[name="description"]', 'name', page.description);
  meta('meta[property="og:title"]', 'property', page.title);
  meta('meta[property="og:description"]', 'property', page.description);
  meta('meta[property="og:url"]', 'property', page.canonical);
  meta('meta[name="twitter:title"]', 'name', page.title);
  meta('meta[name="twitter:description"]', 'name', page.description);
  meta('meta[name="robots"]', 'name', page.robots);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = page.canonical;

  let structuredData = document.head.querySelector<HTMLScriptElement>('#person-jsonld');
  if (!structuredData) {
    structuredData = document.createElement('script');
    structuredData.id = 'person-jsonld';
    structuredData.type = 'application/ld+json';
    document.head.append(structuredData);
  }
  structuredData.text = JSON.stringify(personJsonLd());
}
