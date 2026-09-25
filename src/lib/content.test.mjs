import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import * as content from './content.ts';

const { projects } = content;

test('serves complete English and Portuguese interface copy', () => {
  assert.equal(typeof content.contentFor, 'function');
  const english = content.contentFor('en');
  const portuguese = content.contentFor('pt');

  assert.equal(english.nav.links[0].label, 'WORK');
  assert.equal(portuguese.nav.links[0].label, 'PROJETOS');
  assert.equal(portuguese.ui.home.hero.title, 'Código com pulso humano.');
  assert.equal(portuguese.projects.length, english.projects.length);
  assert.deepEqual(
    portuguese.projects.map((project) => project.slug),
    english.projects.map((project) => project.slug),
  );
  assert.equal(portuguese.chat.prompts.length, english.chat.prompts.length);
});

test('accepts only supported persisted locales', () => {
  assert.equal(typeof content.parseLocale, 'function');
  assert.equal(content.parseLocale('pt'), 'pt');
  assert.equal(content.parseLocale('en'), 'en');
  assert.equal(content.parseLocale('es'), null);
  assert.equal(content.parseLocale(null), null);
});

test('publishes localized footer contact links', () => {
  const english = content.contentFor('en').footer;
  const portuguese = content.contentFor('pt').footer;

  assert.equal(english.socialLabel, 'FIND ME ONLINE');
  assert.equal(portuguese.socialLabel, 'ENCONTRE-ME EM');
  assert.deepEqual(english.links, [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/eovitu/' },
    { label: 'GitHub', href: 'https://github.com/eovitu' },
    { label: 'Email', href: 'mailto:eovitu7@gmail.com' },
  ]);
  assert.deepEqual(portuguese.links, english.links);
});

test('publishes exactly three complete, uniquely addressed cases', () => {
  assert.deepEqual(
    projects.map((project) => project.slug),
    ['emprega-co', 'doces-da-pati', 'helppet'],
  );
  for (const project of projects) {
    assert.ok(project.summary.length > 30);
    assert.ok(project.ownership.length >= 2);
    assert.ok(project.media.poster.startsWith('/'));
    assert.ok(project.sections.length >= 3);
  }
});

test('describes the final project films and their real poster fallbacks', () => {
  for (const project of projects) {
    assert.equal(project.media.width, 1280);
    assert.equal(project.media.height, 720);
    assert.equal(project.media.width / project.media.height, 16 / 9);
    assert.ok(
      existsSync(new URL(`../../public${project.media.poster}`, import.meta.url)),
      `missing poster for ${project.slug}`,
    );
  }
});

test('does not expose placeholder links', () => {
  for (const project of projects) {
    for (const action of project.actions) {
      assert.notEqual(action.href, '#');
      assert.notEqual(action.href, '#contact');
    }
  }
});

test('publishes source access only for HelpPet', () => {
  const doces = projects.find((project) => project.slug === 'doces-da-pati');
  const helppet = projects.find((project) => project.slug === 'helppet');

  assert.equal(
    doces.actions.some((action) => action.label === 'View Source'),
    false,
  );
  assert.deepEqual(
    helppet.actions.find((action) => action.label === 'View Source'),
    {
      label: 'View Source',
      href: 'https://github.com/orgs/HelpPetSENAI/repositories',
    },
  );
});

test('presents Doces da Pati as a production commerce system', () => {
  const english = content.contentFor('en');
  const portuguese = content.contentFor('pt');
  const doces = english.projects.find((project) => project.slug === 'doces-da-pati');
  const docesPt = portuguese.projects.find((project) => project.slug === 'doces-da-pati');

  for (const value of [
    doces.summary,
    doces.outcome,
    ...doces.sections.map(({ body }) => body),
  ]) {
    assert.match(
      value,
      /WhatsApp|Firestore|admin|zero(?:-| infrastructure )cost|GA4|structured data/i,
    );
  }
  assert.match(doces.role, /FRONT-END/);
  assert.match(doces.tech, /FIREBASE/);
  assert.match(docesPt.outcome, /custo (?:de infraestrutura )?zero|R\$ 0/i);
  assert.equal(english.ui.commerce.steps.length, 4);
  assert.equal(portuguese.ui.commerce.steps.length, 4);
});

test('presents HelpPet gateway engineering alongside interface work', () => {
  for (const locale of ['en', 'pt']) {
    const localized = content.contentFor(locale);
    const helppet = localized.projects.find((project) => project.slug === 'helppet');
    const published = [
      helppet.summary,
      helppet.outcome,
      helppet.role,
      helppet.tech,
      ...helppet.ownership,
      ...helppet.sections.map(({ body }) => body),
      localized.ui.integration.body,
    ].join(' ');

    assert.match(published, /Java/);
    assert.match(published, /Spring/);
    assert.match(published, /JWT/);
    assert.match(published, /health/i);
    assert.match(published, /gateway/i);
    assert.match(published, /interface|UI\/UX/i);
  }
});
