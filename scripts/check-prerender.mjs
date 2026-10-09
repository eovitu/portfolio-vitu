import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { projects } from '../src/lib/content.ts';
import { SITE_ORIGIN } from '../src/lib/site.ts';

const dist = resolve(import.meta.dirname, '../dist');
for (const file of [
  'index.html',
  ...projects.map(({ slug }) => `work/${slug}/index.html`),
  '404.html',
]) {
  const html = await readFile(resolve(dist, file), 'utf8');
  assert.equal(
    [...html.matchAll(/<h1(?:\s|>)/g)].length,
    1,
    `${file}: exactly one rendered H1`,
  );
  assert.match(html, /data-styled="true"/, `${file}: interface CSS extracted`);
  assert.doesNotMatch(
    html,
    /<template data-msg=/,
    `${file}: no suspended or failed content`,
  );
  assert.match(html, /<html lang="pt-BR"/, `${file}: Portuguese initial document`);
  assert.doesNotMatch(html, /data-entry-overlay/, `${file}: no opaque browser intro cover`);
  const schemas = [
    ...html.matchAll(/type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ].map((match) => JSON.parse(match[1]));
  if (file === '404.html') {
    assert.equal(schemas.length, 0);
    assert.match(html, /content="noindex, follow"/);
  } else {
    assert.ok(schemas.some((schema) => schema['@type'] === 'Person'));
    if (file !== 'index.html') {
      const project = projects.find(({ slug }) => file.includes(`/${slug}/`));
      assert.ok(project);
      assert.ok(html.includes(project.name), `${file}: real project name`);
    }
  }
}
const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
assert.equal([...sitemap.matchAll(/<loc>/g)].length, 4);
assert.doesNotMatch(sitemap, /torneio-pebolim|404/);
for (const path of ['/', '/work/emprega-co', '/work/doces-da-pati', '/work/helppet'])
  assert.ok(sitemap.includes(`${SITE_ORIGIN}${path}</loc>`));
console.log('Prerender: 6 documents and 4 verified-production sitemap URLs passed.');
