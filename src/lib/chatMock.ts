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
    match: /work|process|how do you/i,
    answer:
      '[ MOCK ANSWER ] I start from the problem and the data model, and only then draw the interface. Design and code in one movement — which is how this portfolio was built.',
  },
  {
    match: /stack/i,
    answer:
      '[ MOCK ANSWER ] Java and Spring Boot on the backend; React, TypeScript and Three.js on the interface. Figma for design.',
  },
  {
    match: /emprega/i,
    answer:
      '[ MOCK ANSWER ] Emprega.co is a marketplace for home services: search, booking and payment in a single flow. I handled it from the data model through to the interface.',
  },
  {
    match: /avail|hire|project/i,
    answer:
      '[ MOCK ANSWER ] Yes — open to product work and digital experiences. The shortest route is the email in the CONTACT section.',
  },
];

const FALLBACK =
  '[ MOCK ANSWER ] I am not wired to a real model yet. When I am, I will answer from a curated context about Victor.';

export function askMock(question: string): Promise<string> {
  const hit = CANNED.find((entry) => entry.match.test(question));
  return new Promise((resolve) => {
    // A short delay so the typing indicator has a reason to exist.
    setTimeout(() => resolve(hit ? hit.answer : FALLBACK), 550);
  });
}
