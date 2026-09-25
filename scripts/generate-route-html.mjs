import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { renderSeoHtml } from '../src/lib/seoHtml.ts';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const shell = await readFile(resolve(dist, 'index.html'), 'utf8');
const documents = [
  ['index.html', { kind: 'home' }],
  ['work/emprega-co/index.html', { kind: 'case', slug: 'emprega-co' }],
  ['work/doces-da-pati/index.html', { kind: 'case', slug: 'doces-da-pati' }],
  ['work/helppet/index.html', { kind: 'case', slug: 'helppet' }],
  ['404.html', { kind: 'notFound', path: '/404' }],
];

for (const [relativePath, route] of documents) {
  const target = resolve(dist, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, renderSeoHtml(shell, route), 'utf8');
}
