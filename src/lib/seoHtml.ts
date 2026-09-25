import type { Locale } from './content.ts';
import type { Route } from './routes.ts';
import {
  creativeWorkJsonLd,
  metadataFor,
  personJsonLd,
  websiteJsonLd,
} from './metadata.ts';

const escapeAttribute = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const escapeText = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function replaceMeta(
  html: string,
  attribute: 'name' | 'property',
  key: string,
  value: string,
): string {
  const pattern = new RegExp(
    `<meta\\s+${attribute}="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s+content="[^"]*"\\s*\\/?>`,
    'i',
  );
  return html.replace(
    pattern,
    `<meta ${attribute}="${key}" content="${escapeAttribute(value)}" />`,
  );
}

function jsonLd(id: string, value: object): string {
  const json = JSON.stringify(value).replace(/</g, '\\u003c');
  return `<script id="${id}" type="application/ld+json">${json}</script>`;
}

export function renderSeoHtml(shell: string, route: Route, locale: Locale = 'en'): string {
  const page = metadataFor(route, locale);
  let html = shell
    .replace(/<html\s+lang="[^"]*"/i, `<html lang="${page.lang}"`)
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeText(page.title)}</title>`)
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${escapeAttribute(page.canonical)}" />`,
    );

  const values: Array<['name' | 'property', string, string]> = [
    ['name', 'description', page.description],
    ['name', 'robots', page.robots],
    ['property', 'og:type', page.openGraphType],
    ['property', 'og:title', page.title],
    ['property', 'og:description', page.description],
    ['property', 'og:url', page.canonical],
    ['property', 'og:image', page.image],
    ['property', 'og:image:alt', page.imageAlt],
    ['property', 'og:image:width', String(page.imageWidth)],
    ['property', 'og:image:height', String(page.imageHeight)],
    ['property', 'og:locale', page.openGraphLocale],
    ['name', 'twitter:title', page.title],
    ['name', 'twitter:description', page.description],
    ['name', 'twitter:image', page.image],
    ['name', 'twitter:image:alt', page.imageAlt],
  ];
  for (const [attribute, key, value] of values) {
    html = replaceMeta(html, attribute, key, value);
  }

  html = html.replace(
    /\s*<script\s+id="(?:person|website|creative-work)-jsonld"[\s\S]*?<\/script>/gi,
    '',
  );
  const structured: string[] = [];
  if (route.kind !== 'notFound') structured.push(jsonLd('person-jsonld', personJsonLd()));
  if (route.kind === 'home') structured.push(jsonLd('website-jsonld', websiteJsonLd()));
  const work = creativeWorkJsonLd(route, locale);
  if (work) structured.push(jsonLd('creative-work-jsonld', work));

  return html.replace('</head>', `  ${structured.join('\n  ')}\n  </head>`);
}
