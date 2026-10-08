import assert from 'node:assert/strict';
import test from 'node:test';
import { contentFor } from './content.ts';
import { resolveRoute, isPublicPath } from './routes.ts';
import { metadataFor } from './metadata.ts';
const slugs = ['emprega-co', 'torneio-pebolim', 'helppet', 'doces-da-pati'];
test('four ordered cases resolve and publish equivalent localized media and metadata', () => {
  for (const locale of ['en', 'pt']) {
    const projects = contentFor(locale).projects;
    assert.deepEqual(
      projects.map((p) => p.slug),
      slugs,
    );
    assert.deepEqual(
      projects.map((p) => p.n),
      ['01', '02', '03', '04'],
    );
    for (const [index, slug] of slugs.entries()) {
      const route = resolveRoute(`/work/${slug}`);
      assert.deepEqual(route, { kind: 'case', slug });
      assert.equal(isPublicPath(`/work/${slug}/`), true);
      const meta = metadataFor(route, locale);
      assert.match(meta.canonical, new RegExp(`/work/${slug}$`));
      assert.equal(meta.lang, locale === 'pt' ? 'pt-BR' : 'en');
      assert.equal(projects[index].media.width, 1920);
      assert.equal(projects[index].media.height, 1080);
      assert.equal(projects[index].media.durationSeconds, index === 1 ? 36 : 38);
      assert.equal(projects[index].media.hasAudio, false);
    }
  }
  assert.notEqual(
    metadataFor({ kind: 'case', slug: 'torneio-pebolim' }, 'en').description,
    metadataFor({ kind: 'case', slug: 'torneio-pebolim' }, 'pt').description,
  );
});

test('keeps technical facts and contribution boundaries in both languages', () => {
  for (const locale of ['en', 'pt']) {
    const { projects, chat, ui } = contentFor(locale);
    const textFor = (slug) => {
      const p = projects.find((project) => project.slug === slug);
      return [p.summary, p.outcome, p.context, ...p.sections.map((s) => s.body)].join(' ');
    };
    assert.equal(projects[0].year, '2026');
    assert.match(textFor('emprega-co'), /trigger/);
    assert.match(textFor('emprega-co'), /volunt/i);
    assert.match(textFor('torneio-pebolim'), /153/);
    const pebolim = textFor('torneio-pebolim');
    assert.match(
      pebolim,
      locale === 'pt'
        ? /8 de outubro de 2026: 153 testes de domínio aprovados em 11 arquivos/
        : /October 8, 2026: 153 domain tests passed across 11 files/,
    );
    assert.match(
      pebolim,
      locale === 'pt'
        ? /Os 153 testes apresentados cobrem o domínio local; não demonstram permissões RLS ou sincronização Realtime em produção/
        : /The 153 tests presented cover the local domain; they do not demonstrate RLS permissions or Realtime synchronization in production/,
    );
    assert.match(
      textFor('helppet'),
      locale === 'pt'
        ? /O vídeo com telas recriadas não demonstra os serviços operando juntos/
        : /The video with recreated screens does not demonstrate the services operating together/,
    );
    assert.match(textFor('torneio-pebolim'), /RLS.*Realtime/);
    assert.match(textFor('helppet'), /Java 17/);
    assert.match(textFor('helppet'), /GET/);
    assert.match(textFor('helppet'), /recreated|recriadas/);
    assert.match(textFor('doces-da-pati'), /WhatsApp/);
    assert.match(
      textFor('doces-da-pati'),
      /not automatic|não há pagamento ou envio automático/i,
    );
    assert.match(chat.note, /NO AI CONNECTED|SEM IA/);
    assert.match(ui.home.hero.copy, /Java.*Spring Boot/);
    assert.doesNotMatch(JSON.stringify(contentFor(locale)), /—/);
  }
});
