import { projects } from './content.ts';
import type { Route } from './routes.ts';
import { SITE_ORIGIN as ORIGIN } from './site.ts';

const HOME_TITLE = 'Victor Hugo — Backend Developer & Product Engineer';
const HOME_DESCRIPTION =
  'Backend developer building reliable digital products from system architecture to expressive interfaces.';

export interface PageMetadata {
  lang: 'en';
  title: string;
  description: string;
  canonical: string;
}

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

export function metadataFor(route: Route): PageMetadata {
  if (route.kind === 'home') {
    return {
      lang: 'en',
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      canonical: `${ORIGIN}/`,
    };
  }

  const project = projects.find((item) => item.slug === route.slug);
  return {
    lang: 'en',
    title: `${project?.name ?? 'Case Study'} — Victor Hugo`,
    description: project?.summary ?? HOME_DESCRIPTION,
    canonical: `${ORIGIN}/work/${route.slug}`,
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

export function applyMetadata(route: Route): void {
  const page = metadataFor(route);
  document.documentElement.lang = page.lang;
  document.title = page.title;
  meta('meta[name="description"]', 'name', page.description);
  meta('meta[property="og:title"]', 'property', page.title);
  meta('meta[property="og:description"]', 'property', page.description);
  meta('meta[property="og:url"]', 'property', page.canonical);

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
