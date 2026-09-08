import assert from 'node:assert/strict';
import test from 'node:test';
import { answerConversationQuestion } from './conversation.ts';
import { chat } from './content.ts';

test('matches the four curated conversation topics', () => {
  const samples = ['How do you work?', 'Java stack', 'Emprega.co case', 'Available?'];
  assert.deepEqual(
    samples.map((sample) => answerConversationQuestion(sample).prompt?.id),
    ['process', 'stack', 'emprega', 'availability'],
  );
});

test('answers unknown and oversized input with the safe curated fallback', () => {
  assert.equal(
    answerConversationQuestion('<script>alert(1)</script>').answer,
    chat.fallback,
  );
  assert.equal(answerConversationQuestion('x'.repeat(500)).answer, chat.fallback);
});
