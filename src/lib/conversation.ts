import { chat, type ChatContent, type ChatPrompt } from './content.ts';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/** Resolve a typed question locally. No network request or HTML parsing occurs. */
export function answerConversationQuestion(value: string, content: ChatContent = chat): {
  prompt?: ChatPrompt;
  answer: string;
} {
  const question = normalize(value).slice(0, 240);
  const prompt = content.prompts.find((candidate) =>
    candidate.keywords.some((keyword) => question.includes(keyword)),
  );
  return { prompt, answer: prompt?.answer ?? content.fallback };
}
