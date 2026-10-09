import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { projects } from '../src/lib/content.ts';
import { renderSeoHtml } from '../src/lib/seoHtml.ts';
import { SITE_ORIGIN } from '../src/lib/site.ts';
import { renderSitemap } from '../src/lib/discovery.ts';
import { render } from '../dist-ssr/entry-server.js';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const shell = await readFile(resolve(dist, 'index.html'), 'utf8');
const documents = [
  ['index.html', { kind: 'home' }],
  ...projects.map(({ slug }) => [`work/${slug}/index.html`, { kind: 'case', slug }]),
  ['404.html', { kind: 'notFound', path: '/404' }],
];

for (const [relativePath, route] of documents) {
  const target = resolve(dist, relativePath);
  await mkdir(dirname(target), { recursive: true });
  const rendered = await render(route);
  const document = renderSeoHtml(shell, route, 'pt')
    .replace('<div id="root"></div>', `<div id="root">${rendered.html}</div>`)
    .replace('</head>', `${rendered.styles}</head>`);
  if (!document.includes('<h1'))
    throw new Error(`Missing rendered heading: ${relativePath}`);
  await writeFile(target, document, 'utf8');
}

await writeFile(resolve(dist, 'sitemap.xml'), renderSitemap(SITE_ORIGIN), 'utf8');
await rm(resolve(root, 'dist-ssr'), { recursive: true });
