/**
 * Mock conversation layer.
 *
 * The panel talks to this module through `askMock`, which has the same shape a
 * real endpoint would (`(question) => Promise<string>`). Swapping in an API
 * later is a one-function change — no component has to move.
 *
 * TODO(api): replace with a call to the curated-context endpoint.
 */

const CANNED: Array<{ match: RegExp; answer: string }> = [
  {
    match: /trabalh/i,
    answer:
      '[ RESPOSTA MOCK ] Começo pelo problema e pelo modelo de dados, e só então desenho a interface. Design e código no mesmo movimento — é assim que este portfolio foi feito.',
  },
  {
    match: /stack/i,
    answer:
      '[ RESPOSTA MOCK ] Java e Spring Boot no backend, React, TypeScript e Three.js na interface. Figma para o design.',
  },
  {
    match: /emprega/i,
    answer:
      '[ RESPOSTA MOCK ] Emprega.co é um marketplace de serviços domésticos: busca, agendamento e pagamento em um fluxo só. Cuidei do modelo de dados à interface.',
  },
  {
    match: /dispon|projeto/i,
    answer:
      '[ RESPOSTA MOCK ] Sim — aberto a projetos de produto e experiências digitais. O caminho mais curto é o e-mail na seção CONTACT.',
  },
];

const FALLBACK =
  '[ RESPOSTA MOCK ] Ainda não estou conectado a uma IA real. Quando estiver, respondo a partir de um contexto curado sobre o Victor.';

export function askMock(question: string): Promise<string> {
  const hit = CANNED.find((entry) => entry.match.test(question));
  return new Promise((resolve) => {
    // A short delay so the typing indicator has a reason to exist.
    setTimeout(() => resolve(hit ? hit.answer : FALLBACK), 550);
  });
}
