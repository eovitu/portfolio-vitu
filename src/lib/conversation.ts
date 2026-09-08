import { chat } from './content.ts';

export type ChatPrompt = (typeof chat.prompts)[number];

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/** Resolve a typed question locally. No network request or HTML parsing occurs. */
export function answerConversationQuestion(value: string): {
  prompt?: ChatPrompt;
  answer: string;
} {
  const question = normalize(value).slice(0, 240);
  const prompt = chat.prompts.find((candidate) =>
    candidate.keywords.some((keyword) => question.includes(keyword)),
  );
  return { prompt, answer: prompt?.answer ?? chat.fallback };
}
