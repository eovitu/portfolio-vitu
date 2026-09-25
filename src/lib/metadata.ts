import { contentFor, type Locale } from './content.ts';
import type { Route } from './routes.ts';
import { SITE_ORIGIN as ORIGIN } from './site.ts';

const HOME_TITLE = 'Victor Hugo | Junior Java & Spring Backend Developer';
const HOME_DESCRIPTION =
  'Portfolio of Victor Hugo (Vitu), a junior backend developer in São Paulo building Java, Spring Boot, API, PostgreSQL and digital product projects in Brazil.';

const CASE_METADATA = {
  en: {
    'emprega-co': {
      title: 'Emprega.co | Employment Platform by Victor Hugo',
      description:
        'Emprega.co case study: an employment platform with candidate and employer journeys, product architecture and integration across web and mobile applications.',
    },
    'doces-da-pati': {
      title: 'Doces da Pati | Firebase Storefront by Victor Hugo',
      description:
        'Doces da Pati case study: mobile catalogue, WhatsApp cart handoff, Firebase administration, access rules, technical SEO and analytics with GA4 consent.',
    },
    helppet: {
      title: 'HelpPet | Spring API Gateway by Victor Hugo',
      description:
        'HelpPet case study: a reactive Java and Spring Cloud API Gateway with JWT authentication, microservice routing, resilience and aggregated health checks.',
    },
  },
  pt: {
    'emprega-co': {
      title: 'Emprega.co | Plataforma de empregos por Victor Hugo',
      description:
        'Case da Emprega.co: plataforma de empregos com jornadas para candidatos e empresas, arquitetura de produto e integração entre aplicações web e mobile.',
    },
    'doces-da-pati': {
      title: 'Doces da Pati | Loja Firebase por Victor Hugo',
      description:
        'Case da Doces da Pati: catálogo mobile, carrinho enviado por WhatsApp, administração Firebase, regras de acesso, SEO e analytics com consentimento GA4.',
    },
    helppet: {
      title: 'HelpPet | API Gateway Spring por Victor Hugo',
      description:
        'Case HelpPet: API Gateway reativo em Java e Spring Cloud, com autenticação JWT, rotas para microsserviços, resiliência e health checks agregados do sistema.',
    },
  },
} as const;

export interface PageMetadata {
  lang: 'en' | 'pt-BR';
  title: string;
  description: string;
  canonical: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  openGraphType: 'website' | 'article';
  openGraphLocale: 'en_US' | 'pt_BR';
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
    alternateName: ['Vitu', 'eovitu'],
    jobTitle: 'Backend Developer & Product Engineer',
    url: `${ORIGIN}/`,
    email: 'mailto:eovitu7@gmail.com',
    sameAs: ['https://github.com/eovitu', 'https://www.linkedin.com/in/eovitu/'],
  } as const;
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Vitu',
    alternateName: ['eovitu', 'Victor Hugo'],
    url: `${ORIGIN}/`,
  } as const;
}

export function creativeWorkJsonLd(route: Route, locale: Locale = 'en') {
  if (route.kind !== 'case') return null;
  const page = metadataFor(route, locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: page.title.split(' | ')[0],
    headline: page.title,
    description: page.description,
    url: page.canonical,
    image: page.image,
    inLanguage: page.lang,
    creator: {
      '@type': 'Person',
      name: 'Victor Hugo',
      alternateName: ['Vitu', 'eovitu'],
      url: `${ORIGIN}/`,
    },
  } as const;
}

export function metadataFor(route: Route, locale: Locale = 'en'): PageMetadata {
  const localized = contentFor(locale);
  const homeTitle =
    locale === 'pt' ? 'Victor Hugo | Desenvolvedor Backend Java e Spring Boot' : HOME_TITLE;
  const homeDescription =
    locale === 'pt'
      ? 'Portfólio de Victor Hugo (Vitu), desenvolvedor backend júnior em São Paulo, com projetos reais em Java, Spring Boot, APIs, PostgreSQL e produtos digitais.'
      : HOME_DESCRIPTION;
  const lang = locale === 'pt' ? 'pt-BR' : 'en';
  const openGraphLocale = locale === 'pt' ? 'pt_BR' : 'en_US';
  if (route.kind === 'home') {
    return {
      lang,
      title: homeTitle,
      description: homeDescription,
      canonical: `${ORIGIN}/`,
      image: `${ORIGIN}/og.png`,
      imageAlt: homeTitle,
      imageWidth: 1200,
      imageHeight: 630,
      openGraphType: 'website',
      openGraphLocale,
      robots: INDEXABLE,
    };
  }

  if (route.kind === 'notFound') {
    return {
      lang,
      title:
        locale === 'pt'
          ? 'Além do horizonte, Victor Hugo'
          : 'Past the horizon, Victor Hugo',
      description:
        locale === 'pt'
          ? 'Este endereço não existe. Volte aos projetos selecionados.'
          : 'This address does not exist. Return to the selected work.',
      // Canonical points home: the missing page has no address of its own
      // worth pointing a crawler at.
      canonical: `${ORIGIN}/`,
      image: `${ORIGIN}/og.png`,
      imageAlt: homeTitle,
      imageWidth: 1200,
      imageHeight: 630,
      openGraphType: 'website',
      openGraphLocale,
      robots: 'noindex, follow',
    };
  }

  const project = localized.projects.find((item) => item.slug === route.slug)!;
  const seo = CASE_METADATA[locale][route.slug];
  return {
    lang,
    title: seo.title,
    description: seo.description,
    canonical: `${ORIGIN}/work/${route.slug}`,
    image: `${ORIGIN}${project.media.poster}`,
    imageAlt: project.media.alt,
    imageWidth: project.media.width,
    imageHeight: project.media.height,
    openGraphType: 'article',
    openGraphLocale,
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
  meta('meta[property="og:type"]', 'property', page.openGraphType);
  meta('meta[property="og:locale"]', 'property', page.openGraphLocale);
  meta('meta[property="og:image"]', 'property', page.image);
  meta('meta[property="og:image:alt"]', 'property', page.imageAlt);
  meta('meta[property="og:image:width"]', 'property', String(page.imageWidth));
  meta('meta[property="og:image:height"]', 'property', String(page.imageHeight));
  meta('meta[name="twitter:title"]', 'name', page.title);
  meta('meta[name="twitter:description"]', 'name', page.description);
  meta('meta[name="twitter:image"]', 'name', page.image);
  meta('meta[name="twitter:image:alt"]', 'name', page.imageAlt);
  meta('meta[name="robots"]', 'name', page.robots);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = page.canonical;

  const structured = [
    ['person-jsonld', route.kind === 'notFound' ? null : personJsonLd()],
    ['website-jsonld', route.kind === 'home' ? websiteJsonLd() : null],
    ['creative-work-jsonld', creativeWorkJsonLd(route, locale)],
  ] as const;
  for (const [id, value] of structured) {
    let element = document.head.querySelector<HTMLScriptElement>(`#${id}`);
    if (!value) {
      element?.remove();
      continue;
    }
    if (!element) {
      element = document.createElement('script');
      element.id = id;
      element.type = 'application/ld+json';
      document.head.append(element);
    }
    element.text = JSON.stringify(value);
  }
}
